import { CUSTOM_CUSTOMERIO_ATTRIBUTE } from '../types'

export const mockIdentifyCustomer = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data: Record<CUSTOM_CUSTOMERIO_ATTRIBUTE, string | boolean | null>
): Promise<boolean> => {
  return true
}
