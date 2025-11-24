import { logWithSentry } from '../../sentry/error-monitoring'
import { trackClient } from '../customerio'

export const toggleSubscribeToMarketingEmails = async (
  userId: string,
  shouldUnsubscribe: boolean
): Promise<boolean> => {
  try {
    // https://docs.customer.io/journeys/unsubscribes/#:~:text=Unsubscribe%20a%20person%20via%20JavaScript,%2C%20and%20%221%22%20too.
    await trackClient.identify(userId, {
      unsubscribed: shouldUnsubscribe,
    })
    return true
  } catch (error) {
    logWithSentry({
      message: 'Error when toggling subscribe',
      params: {
        userId,
        unsubscribe: shouldUnsubscribe,
      },
      error,
    })
    return false
  }
}
