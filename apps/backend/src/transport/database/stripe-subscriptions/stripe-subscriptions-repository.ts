import { sql } from '../postgres-client'
import { logCustomErrorMessageAndError } from '../../third-party/sentry/error-monitoring'

export type DbInterval = 'month' | 'year'
export type DbStripeSubscription = {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_product_id: string
  status: StripeSubscriptionStatus
  current_period_end: Date | null
  cancel_at_period_end: boolean
  trial_end: Date | null
  created_at: Date
  updated_at: Date
  currency: string
  amount: number | null
  interval: DbInterval
  interval_count: number
}
// the description of all the Stripe status codes can be found here:
// https://docs.stripe.com/billing/subscriptions/overview#subscription-statuses
export type StripeSubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete_expired'
  | 'incomplete'
  | 'paused'

const insertSubscription = async (
  userId: string,
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean,
  trialEnd: number | null,
  stripeProductId: string,
  eventTimestamp: number,
  currency: string,
  amount: number | null,
  interval: DbInterval,
  intervalCount: number
): Promise<boolean> => {
  const currentPeriodEndDate = new Date(currentPeriodEnd * 1000).toISOString()
  const trialEndDate = trialEnd ? new Date(trialEnd * 1000).toISOString() : null
  const eventDate = new Date(eventTimestamp * 1000).toISOString()

  try {
    await sql`
      INSERT INTO public.stripe_subscriptions 
      (user_id, stripe_subscription_id, status, current_period_end, cancel_at_period_end, trial_end, stripe_product_id, created_at, updated_at, currency, amount, interval, interval_count)
      VALUES 
      (${userId}, ${stripeSubscriptionId}, ${status}::stripe_subscription_status, 
      ${currentPeriodEndDate}, ${cancelAtPeriodEnd}, ${trialEndDate}, ${stripeProductId}, ${eventDate}, ${eventDate},
      ${currency}, ${amount}, ${interval}::subscription_interval, ${intervalCount})
    `
    return true
  } catch (error) {
    logCustomErrorMessageAndError(
      `insertSubscription - userId: ${userId}, stripeSubscriptionId: ${stripeSubscriptionId}, status: ${status}, currentPeriodEnd: ${currentPeriodEnd}, cancelAtPeriodEnd: ${cancelAtPeriodEnd}, trialEnd: ${trialEnd}, productId: ${stripeProductId}, eventTimestamp: ${eventTimestamp}, currency: ${currency}, amount: ${amount}, interval: ${interval}`,
      error
    )
    return false
  }
}

const upsertSubscription = async (
  userId: string,
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean,
  trialEnd: number | null,
  stripeProductId: string,
  eventTimestamp: number,
  currency: string,
  amount: number | null,
  interval: DbInterval,
  intervalCount: number
): Promise<boolean> => {
  const currentPeriodEndDate = new Date(currentPeriodEnd * 1000).toISOString()
  const trialEndDate = trialEnd ? new Date(trialEnd * 1000).toISOString() : null
  const eventDate = new Date(eventTimestamp * 1000).toISOString()

  try {
    await sql`
      INSERT INTO public.stripe_subscriptions 
      (user_id, stripe_subscription_id, status, current_period_end, cancel_at_period_end, trial_end, stripe_product_id, updated_at, currency, amount, interval, interval_count)
      VALUES 
      (${userId}, ${stripeSubscriptionId}, ${status}::stripe_subscription_status, 
      ${currentPeriodEndDate}, ${cancelAtPeriodEnd}, ${trialEndDate}, ${stripeProductId}, ${eventDate},
      ${currency}, ${amount}, ${interval}::subscription_interval, ${intervalCount})
      ON CONFLICT (stripe_subscription_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        trial_end = EXCLUDED.trial_end,
        stripe_product_id = EXCLUDED.stripe_product_id,
        updated_at = EXCLUDED.updated_at,
        currency = EXCLUDED.currency,
        amount = EXCLUDED.amount,
        interval = EXCLUDED.interval,
        interval_count = EXCLUDED.interval_count
    `
    return true
  } catch (error) {
    logCustomErrorMessageAndError(
      `upsertSubscription - userId: ${userId}, stripeSubscriptionId: ${stripeSubscriptionId}, status: ${status}, currentPeriodEnd: ${currentPeriodEnd}, cancelAtPeriodEnd: ${cancelAtPeriodEnd}, trialEnd: ${trialEnd}, productId: ${stripeProductId}, eventTimestamp: ${eventTimestamp}, currency: ${currency}, amount: ${amount}, interval: ${interval}`,
      error
    )
    return false
  }
}

const getSubscriptionUpdatedAt = async (stripeSubscriptionId: string): Promise<number | null> => {
  try {
    const result = await sql`
      SELECT updated_at FROM public.stripe_subscriptions
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `

    if (result.count > 0) {
      return new Date(result[0].updated_at).getTime() / 1000
    }
    return null
  } catch (error) {
    logCustomErrorMessageAndError(`getSubscriptionUpdatedAt - stripeSubscriptionId: ${stripeSubscriptionId}`, error)
    return null
  }
}

const cancelSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    await sql`
      UPDATE public.stripe_subscriptions
      SET 
        status = 'canceled',
        updated_at = NOW()
      WHERE stripe_subscription_id = ${subscriptionId}
    `
    return true
  } catch (error) {
    logCustomErrorMessageAndError(`deleteSubscription error - subscriptionId - ${subscriptionId}`, error)
    return false
  }
}

const getAllSubscriptions = async (): Promise<DbStripeSubscription[]> => {
  try {
    const result = await sql`
      SELECT *
      FROM public.stripe_subscriptions
    `

    return result.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      stripe_subscription_id: row.stripe_subscription_id,
      stripe_product_id: row.stripe_product_id,
      status: row.status,
      current_period_end: row.current_period_end ? new Date(row.current_period_end) : null,
      cancel_at_period_end: row.cancel_at_period_end,
      trial_end: row.trial_end ? new Date(row.trial_end) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      currency: row.currency,
      amount: row.amount,
      interval: row.interval,
      interval_count: row.interval_count,
    }))
  } catch (error) {
    logCustomErrorMessageAndError(`getAllSubscriptions error`, error)
    throw error
  }
}

const getSubscriptionsByUserId = async (userId: string): Promise<DbStripeSubscription[]> => {
  try {
    const result = await sql`
      SELECT *
      FROM public.stripe_subscriptions
      WHERE user_id = ${userId}
    `

    return result.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      stripe_subscription_id: row.stripe_subscription_id,
      stripe_product_id: row.stripe_product_id,
      status: row.status,
      current_period_end: row.current_period_end ? new Date(row.current_period_end) : null,
      cancel_at_period_end: row.cancel_at_period_end,
      trial_end: row.trial_end ? new Date(row.trial_end) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      currency: row.currency,
      amount: row.amount,
      interval: row.interval,
      interval_count: row.interval_count,
    }))
  } catch (error) {
    logCustomErrorMessageAndError(`getSubscriptionsByUserId error - userId - ${userId}`, error)
    return []
  }
}

const findSubscriptionByStripeSubscriptionId = async (
  stripeSubscriptionId: string
): Promise<DbStripeSubscription | null> => {
  try {
    const result = await sql`
      SELECT *
      FROM public.stripe_subscriptions
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `

    if (result.count === 0) {
      return null
    }

    const row = result[0]
    return {
      id: row.id,
      user_id: row.user_id,
      stripe_subscription_id: row.stripe_subscription_id,
      stripe_product_id: row.stripe_product_id,
      status: row.status,
      current_period_end: row.current_period_end ? new Date(row.current_period_end) : null,
      cancel_at_period_end: row.cancel_at_period_end,
      trial_end: row.trial_end ? new Date(row.trial_end) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      currency: row.currency,
      amount: row.amount,
      interval: row.interval,
      interval_count: row.interval_count,
    }
  } catch (error) {
    logCustomErrorMessageAndError(
      `findSubscriptionByStripeId error - stripeSubscriptionId - ${stripeSubscriptionId}`,
      error
    )
    return null
  }
}

export interface StripeSubscriptionsRepositoryInterface {
  insertSubscription: (
    userId: string,
    stripeSubscriptionId: string,
    status: string,
    currentPeriodEnd: number,
    cancelAtPeriodEnd: boolean,
    trialEnd: number | null,
    stripeProductId: string,
    eventTimestamp: number,
    currency: string,
    amount: number | null,
    interval: DbInterval,
    intervalCount: number
  ) => Promise<boolean>
  upsertSubscription: (
    userId: string,
    stripeSubscriptionId: string,
    status: string,
    currentPeriodEnd: number,
    cancelAtPeriodEnd: boolean,
    trialEnd: number | null,
    stripeProductId: string,
    eventTimestamp: number,
    currency: string,
    amount: number | null,
    interval: DbInterval,
    intervalCount: number
  ) => Promise<boolean>
  getSubscriptionUpdatedAt: (stripeSubscriptionId: string) => Promise<number | null>
  cancelSubscription: (subscriptionId: string) => Promise<boolean>
  getAllSubscriptions: () => Promise<DbStripeSubscription[]>
  getSubscriptionsByUserId: (userId: string) => Promise<DbStripeSubscription[]>
  findSubscriptionByStripeSubscriptionId: (stripeSubscriptionId: string) => Promise<DbStripeSubscription | null>
}

export const StripeSubscriptionsRepository = (): StripeSubscriptionsRepositoryInterface => {
  return {
    insertSubscription,
    upsertSubscription,
    getSubscriptionUpdatedAt,
    cancelSubscription,
    getAllSubscriptions,
    getSubscriptionsByUserId,
    findSubscriptionByStripeSubscriptionId,
  }
}
