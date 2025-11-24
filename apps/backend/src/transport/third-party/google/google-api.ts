import Stripe from 'stripe'
import { insertChargeRefundedGoogleSheets } from './insert-charge-refunded/insert-charge-refunded'
import { insertCustomerCreateSubscriptionGoogleSheets } from './insert-customer-create-subscription/insert-customer-create-subscription'
import { insertInvoicePaymentSucceededGoogleSheets } from './insert-invoice-payment-succeeded/insert-invoice-payment-succeeded'
import { mockInsertChargeRefunded } from './insert-charge-refunded/mock-insert-charge-refunded'
import { mockInsertInvoicePaymentSucceeded } from './insert-invoice-payment-succeeded/mock-insert-invoice-payment-succeeded'
import { mockInsertCustomerCreateSubscription } from './insert-customer-create-subscription/mock-insert-customer-create-subscription'
import { DbUser } from '../../database/users/users-repository'
import { PlanType } from '@yourbestaccent/api-client/orpc-contracts/billing-contract'

export interface GoogleApi {
  insertInvoicePaymentSucceededGoogleSheets: (invoice: Stripe.Invoice, paymentNumber: number) => Promise<void>
  insertChargeRefundedGoogleSheets: (charge: Stripe.Charge, user: DbUser) => Promise<void>
  insertCustomerCreateSubscriptionGoogleSheets: (
    subscription: Stripe.Subscription,
    planType: PlanType,
    planAmount: number
  ) => Promise<void>
}

export const RealGoogleApi: GoogleApi = {
  insertInvoicePaymentSucceededGoogleSheets,
  insertChargeRefundedGoogleSheets,
  insertCustomerCreateSubscriptionGoogleSheets,
}

export const MockGoogleApi: GoogleApi = {
  insertInvoicePaymentSucceededGoogleSheets: mockInsertInvoicePaymentSucceeded,
  insertChargeRefundedGoogleSheets: mockInsertChargeRefunded,
  insertCustomerCreateSubscriptionGoogleSheets: mockInsertCustomerCreateSubscription,
}
