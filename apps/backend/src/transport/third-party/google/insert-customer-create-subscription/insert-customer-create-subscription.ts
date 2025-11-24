import Stripe from 'stripe'
import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'
import { googleAffiliateMasterSpreadsheet } from '../google'
import { PlanType } from '@yourbestaccent/api-client/orpc-contracts/billing-contract'

export const insertCustomerCreateSubscriptionGoogleSheets = async (
  subscription: Stripe.Subscription,
  planType: PlanType,
  planAmount: number
) => {
  try {
    await googleAffiliateMasterSpreadsheet.loadInfo()
    const subscriptionsCreatedSheet = googleAffiliateMasterSpreadsheet.sheetsByTitle['Subscriptions Created']

    const newRowData = {
      id: subscription.id,
      plan_amount: planAmount,
      customer_id: subscription.customer as string,
      user_id: subscription.metadata?.user_id ?? '',
      created: new Date(subscription.created * 1000).toISOString(),
      currency: subscription.currency,
      referral: subscription.metadata?.referral ?? '',
      status: subscription.status,
      plan: planType ?? '',
    }

    await subscriptionsCreatedSheet.addRow(newRowData)
  } catch (error) {
    logCustomErrorMessageAndError(
      `Error adding subscription data to Google Spreadsheet, subscription - ${JSON.stringify(subscription)}`,
      error
    )
  }
}
