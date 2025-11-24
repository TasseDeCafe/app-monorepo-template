import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'
import Stripe from 'stripe'
import { DbUser } from '../../../database/users/users-repository'
import { googleAffiliateMasterSpreadsheet } from '../google'

export const insertChargeRefundedGoogleSheets = async (charge: Stripe.Charge, user: DbUser) => {
  try {
    await googleAffiliateMasterSpreadsheet.loadInfo()
    const sheet = googleAffiliateMasterSpreadsheet.sheetsByTitle['Charges Refunded']

    const newRowData = {
      id: charge.id,
      amount_refunded: (charge.amount_refunded / 100).toString(),
      customer_id: charge.customer as string,
      user_id: user.id,
      created: new Date(charge.created * 1000).toISOString(),
      currency: charge.currency,
      referral: user.referral ?? '',
    }

    await sheet.addRow(newRowData)
  } catch (error) {
    logCustomErrorMessageAndError(
      `Error adding refund data to Google Spreadsheet, charge - ${JSON.stringify(charge)}`,
      error
    )
  }
}
