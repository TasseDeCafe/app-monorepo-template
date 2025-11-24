import { logWithSentry } from '../../sentry/error-monitoring'
import { trackClient } from '../customerio'
import { CustomerioUser } from '../types'

export const updateCustomer = async (userId: string, customerioUser: Partial<CustomerioUser>): Promise<boolean> => {
  try {
    // sending data like this merges whatever is already stored on customer io
    await trackClient.identify(userId, customerioUser)
    return true
  } catch (error) {
    logWithSentry({
      message: 'Error updating customer',
      params: {
        userId,
        ...customerioUser,
      },
      error,
    })
    return false
  }
}
