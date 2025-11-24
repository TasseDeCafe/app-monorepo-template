import { logCustomErrorMessageAndError } from '../../sentry/error-monitoring'
import { trackClient } from '../customerio'

export const destroyCustomer = async (identifier: string): Promise<boolean> => {
  try {
    await trackClient.destroy(identifier)
    return true
  } catch (error) {
    logCustomErrorMessageAndError(`deleteContact, identifier - ${identifier}`, error)
    return false
  }
}
