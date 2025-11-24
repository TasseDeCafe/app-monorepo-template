import { CustomerIORequestError, IdentifierType } from 'customerio-node'
import { logWithSentry } from '../../sentry/error-monitoring'
import { CustomerIOAttributesResult } from './types'
import { apiClient } from '../customerio'

export const getCustomerData = async (userId: string): Promise<CustomerIOAttributesResult> => {
  try {
    const response = await apiClient.getAttributes(userId, IdentifierType.Id)
    if (
      response.customer === undefined ||
      response.customer.attributes === undefined ||
      response.customer.unsubscribed === undefined
    ) {
      logWithSentry({
        message: 'wrong structure',
        params: {
          userId,
          response,
        },
      })
      return {
        wasSuccessful: false,
      }
    }
    return {
      wasSuccessful: true,
      data: {
        attributes: response.customer.attributes,
        unsubscribed: response.customer.unsubscribed,
      },
    }
  } catch (error) {
    const customerIOError = error as CustomerIORequestError
    if (customerIOError.statusCode !== 404) {
      logWithSentry({
        message: 'non 404 error',
        params: {
          userId,
        },
        error,
      })
    }
    return {
      wasSuccessful: false,
    }
  }
}
