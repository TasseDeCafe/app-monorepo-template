import Stripe from 'stripe'
import { StripeSubscriptionsRepositoryInterface } from '../../transport/database/stripe-subscriptions/stripe-subscriptions-repository'
import { GoogleApi } from '../../transport/third-party/google/google-api'
import {
  ListStripeSubscriptionsResponse,
  RetrieveSubscriptionResponse,
  StripeApi,
} from '../../transport/third-party/stripe/stripe-api'
import { StripeWebhookServiceInterface } from './stripe-webhook-service-interface'
import { CustomerioApi } from '../../transport/third-party/customerio/customerio-api'
import { AccessCacheServiceInterface } from '../long-running/subscription-cache-service/access-cache-service'
import { DbUser, UsersRepositoryInterface } from '../../transport/database/users/users-repository'
import { logWithSentry } from '../../transport/third-party/sentry/error-monitoring'
import { CUSTOM_CUSTOMERIO_ATTRIBUTE } from '../../transport/third-party/customerio/types'
import { calculatePaymentNumber } from '../../utils/payment-utils'
import { getDiscountsForReferral } from '@yourbestaccent/core/constants/referral-constants'

export const StripeWebhookService = (
  googleApi: GoogleApi,
  stripeApi: StripeApi,
  customerioApi: CustomerioApi,
  stripeSubscriptionsRepository: StripeSubscriptionsRepositoryInterface,
  accessCacheService: AccessCacheServiceInterface,
  usersRepository: UsersRepositoryInterface
  // authUsersRepository: AuthUsersRepository
): StripeWebhookServiceInterface => {
  const handleCustomerSubscriptionCreated = async (subscription: Stripe.Subscription) => {
    const referral = subscription.metadata?.referral
    const userId = subscription.metadata?.user_id

    if (!userId) {
      logWithSentry({
        message: 'userId is not found in the metadata of the subscription in the event data',
        params: {
          subscription,
          referral,
        },
      })
      return
    }
    const interval = subscription.items.data[0].price.recurring?.interval
    // const planType: PlanType = interval as PlanType

    await customerioApi.updateCustomer(userId, {
      [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN]: 'premium',
      [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN_INTERVAL]: interval as 'month' | 'year',
    })

    //todo: remove this google spreadsheet API call completely if we completely stop using this feature
    // if (isWithinDurationLimit) {
    //   await googleApi.insertInvoicePaymentSucceededGoogleSheets(invoice, paymentNumber)
    // }

    // const planAmount = subscription.items.data[0].price.unit_amount ?? 0

    // const dbAuthUser: DbAuthUser | null = await authUsersRepository.findUserById(userId)
    // let email = ''
    // if (!dbAuthUser) {
    //   logMessage(`handleCustomerSubscriptionCreated: user with id ${userId} could not be found`)
    // } else {
    //   email = dbAuthUser.email
    // }
    // const isTestUser = getConfig().emailsOfTestUsers.includes(email)

    // if (referral && !isTestUser) {
    //   await googleApi.insertCustomerCreateSubscriptionGoogleSheets(subscription, planType, planAmount / 100)
    // }
  }

  const handleCustomerSubscriptionDeleted = async (subscription: Stripe.Subscription) => {
    const { metadata } = subscription
    const userId: string = metadata.user_id

    await customerioApi.updateCustomer(userId, {
      [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN]: null,
      [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN_INTERVAL]: null,
    })
  }

  const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice) => {
    const referral = invoice.parent?.subscription_details?.metadata?.referral
    if (!referral || invoice.amount_paid <= 0) {
      return
    }

    const subscription = await stripeSubscriptionsRepository.findSubscriptionByStripeSubscriptionId(
      invoice.parent?.subscription_details?.subscription as string
    )
    if (!subscription) {
      return
    }

    const lineItem = invoice.lines.data[0]
    // In Stripe API v18, InvoiceLineItem.pricing is a complex union type
    // For subscription invoices, pricing.price contains the Price object with recurring info
    const pricing = lineItem.pricing as { price?: { recurring?: { interval?: string } } }
    const interval = pricing?.price?.recurring?.interval === 'year' ? 'year' : 'month'
    const paymentNumber = calculatePaymentNumber(subscription.created_at, interval)
    const discounts = getDiscountsForReferral(referral)

    const commissionLimit = interval === 'year' ? discounts.yearly.commissionLimit : discounts.monthly.commissionLimit
    const isWithinDurationLimit = commissionLimit === null || paymentNumber <= commissionLimit

    if (isWithinDurationLimit) {
      await googleApi.insertInvoicePaymentSucceededGoogleSheets(invoice, paymentNumber)
    }
  }

  const handleChargeRefunded = async (charge: Stripe.Charge) => {
    const user = await usersRepository.findUserByStripeCustomerId(charge.customer as string)
    if (user?.referral) {
      await googleApi.insertChargeRefundedGoogleSheets(charge, user)
    }
  }

  const handleSubscriptionUpdated = async (subscription: Stripe.Subscription) => {
    const { metadata } = subscription
    const userId: string = metadata.user_id

    if (subscription.status === 'canceled') {
      await customerioApi.updateCustomer(userId, {
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN]: null,
        [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN_INTERVAL]: null,
      })
    }
  }

  const syncStripeSubscriptionWithOurDbAndCache = async (customerId: string): Promise<boolean> => {
    const [subscriptions, dbUser]: [ListStripeSubscriptionsResponse | null, DbUser | null] = await Promise.all([
      stripeApi.listAllSubscriptions(customerId),
      usersRepository.findUserByStripeCustomerId(customerId),
    ])
    if (!dbUser) {
      // this happens when user removed his account, by this time we don't have his subscriptions in the db, and we should not try to sync them
      return true
    }
    if (!subscriptions) {
      logWithSentry({
        message: "could not retrieve user's subscriptions",
        params: {
          customerId,
        },
      })
      return false
    }
    if (subscriptions.length === 0) {
      logWithSentry({
        message: 'user has no subscription, while at least one subscription is expected',
        params: {
          customerId,
        },
      })
      return false
    }
    // I could not find a confirmation that the first subscription in the list is the most recent one,
    // so I am sorting the list by created timestamp
    const mostRecentSubscription: {
      id: string
      created: number
      status: string
      trial_end: number | null
    } = subscriptions.sort((a, b) => b.created - a.created)[0]

    // todo stripe v2: check if we can do it with a single call to Stripe API, note that we initially decided to store more
    // than Theo recommends, so it's not clear if a listSubscriptions call give us all the data we need
    // as we store more data in our database, like amount, interval etc
    // We might not need the below additional call to Stripe API, but I tried to have less changes when migrating from our stripe v1 to v2
    const subscriptionWithMoreDetails: RetrieveSubscriptionResponse | null = await stripeApi.retrieveSubscription(
      mostRecentSubscription.id
    )

    if (!subscriptionWithMoreDetails) {
      return false
    }

    const { id, status, current_period_end, cancel_at_period_end, trial_end, items, metadata } =
      subscriptionWithMoreDetails
    const userId = metadata.user_id
    const productId = items.data[0].price.product
    const updatedAt = Math.floor(Date.now() / 1000)
    const plan = items.data[0].plan
    const currency = plan.currency
    const amount = plan.amount
    const interval = plan.interval
    const interval_count = plan.interval_count

    const isSuccessfullyUpserted: boolean = await stripeSubscriptionsRepository.upsertSubscription(
      userId,
      id,
      status,
      current_period_end,
      cancel_at_period_end,
      trial_end,
      productId,
      updatedAt,
      currency,
      amount,
      interval,
      interval_count
    )
    if (!isSuccessfullyUpserted) {
      logWithSentry({
        message: 'Error upserting subscription',
        params: {
          userId,
          id,
          status,
          current_period_end,
          cancel_at_period_end,
          trial_end,
          productId,
          updatedAt,
          currency,
          amount,
          interval,
          interval_count,
        },
      })
    }
    await accessCacheService.updateForUser(userId)
    return true
  }

  return {
    handleCustomerSubscriptionCreated,
    handleCustomerSubscriptionDeleted,
    handleInvoicePaymentSucceeded,
    handleChargeRefunded,
    handleSubscriptionUpdated,
    syncStripeSubscriptionWithOurDbAndCache,
  }
}
