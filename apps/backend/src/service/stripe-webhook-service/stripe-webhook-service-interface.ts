import Stripe from 'stripe'

export interface StripeWebhookServiceInterface {
  handleCustomerSubscriptionCreated: (subscription: Stripe.Subscription) => Promise<void>

  handleCustomerSubscriptionDeleted: (subscription: Stripe.Subscription) => Promise<void>

  handleInvoicePaymentSucceeded: (invoice: Stripe.Invoice) => Promise<void>

  handleChargeRefunded: (charge: Stripe.Charge) => Promise<void>

  handleSubscriptionUpdated: (subscription: Stripe.Subscription) => Promise<void>

  syncStripeSubscriptionWithOurDbAndCache: (customerId: string) => Promise<boolean>
}
