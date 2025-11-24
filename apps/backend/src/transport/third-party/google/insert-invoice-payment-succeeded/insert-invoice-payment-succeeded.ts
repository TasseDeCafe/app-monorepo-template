import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'
import Stripe from 'stripe'
import { googleAffiliateMasterSpreadsheet } from '../google'

export const insertInvoicePaymentSucceededGoogleSheets = async (invoice: Stripe.Invoice, paymentNumber: number) => {
  try {
    await googleAffiliateMasterSpreadsheet.loadInfo()
    const paymentSucceededSheet = googleAffiliateMasterSpreadsheet.sheetsByTitle['Payments Succeeded']

    const lineItem = invoice.lines.data[0]
    // In Stripe API v18, InvoiceLineItem.pricing is a complex union type
    // For subscription invoices, pricing.price contains the Price object with recurring info
    const pricing = lineItem.pricing as { price?: { recurring?: { interval?: string } } }
    const interval = pricing?.price?.recurring?.interval === 'year' ? 'year' : 'month'

    const newRowData = {
      id: invoice.id,
      amount_paid: (invoice.amount_paid / 100).toString(),
      customer_id: invoice.customer as string,
      user_id: invoice.parent?.subscription_details?.metadata?.user_id ?? '',
      created: new Date(invoice.created * 1000).toISOString(),
      currency: invoice.currency,
      referral: invoice.parent?.subscription_details?.metadata?.referral ?? '',
      status: invoice.status as string,
      interval: interval,
      payment_number: paymentNumber,
    }

    await paymentSucceededSheet.addRow(newRowData)
  } catch (error) {
    logCustomErrorMessageAndError(
      `Error adding invoice data to Google Spreadsheet: invoice - ${JSON.stringify(invoice)}`,
      error
    )
  }
}
