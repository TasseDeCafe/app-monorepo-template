import { CustomerIOAttributesResult } from './types'

export const mockGetCustomerAttributes = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string
): Promise<CustomerIOAttributesResult> => {
  return {
    wasSuccessful: true,
    data: {
      attributes: {},
      unsubscribed: false,
    },
  }
}
