import { Customer } from '../revenuecat-api'

export const mockGetCustomer = async (customerId: string): Promise<Customer | null> => {
  return {
    object: 'customer',
    id: customerId,
    project_id: 'mock-project-id',
    first_seen_at: Date.now(),
    last_seen_at: Date.now(),
  }
}
