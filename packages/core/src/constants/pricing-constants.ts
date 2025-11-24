export const STRIPE_MONTHLY_PRICE_IN_EUR: number = 19
export const STRIPE_YEARLY_PRICE_IN_EUR: number = 189
export const STRIPE_MONTHLY_PRICE_IN_PLN: number = 79
export const STRIPE_YEARLY_PRICE_IN_PLN: number = 789
export const LIFETIME_PRICE: number = 449
// if this is set to lower than 7 days make sure to disable the "send a reminder email 7 days before trial ends" at
// https://dashboard.stripe.com/settings/billing/automatic
export const NUMBER_OF_DAYS_IN_FREE_TRIAL: number = 7
export const REFUND_PERIOD_IN_DAYS: number = 14

// these should reflect our stripe pricing from https://dashboard.stripe.com/products/prod_Qc3fXqhGKGN1oI
export enum SUPPORTED_STRIPE_CURRENCY {
  EUR = 'eur',
  PLN = 'pln',
}

export type PlanInterval = 'month' | 'year'
