import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'
import { trackClient } from '../customerio'
import { CustomerioUser } from '../types'

export const identifyCustomer = async (userId: string, customerioUser: CustomerioUser): Promise<boolean> => {
  try {
    await trackClient.identify(userId, {
      ...customerioUser,
      created_at: Math.floor(Date.now() / 1000),
    })
    return true
  } catch (error) {
    logCustomErrorMessageAndError(`identifyCustomer, userId - ${userId}`, error)
    return false
  }
}
