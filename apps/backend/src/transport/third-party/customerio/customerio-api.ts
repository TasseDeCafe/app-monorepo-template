import { identifyCustomer } from './identify-customer/identify-customer'
import { mockIdentifyCustomer } from './identify-customer/mock-identify-customer'
import { destroyCustomer } from './destroy-customer/destroy-customer'
import { mockDestroyCustomer } from './destroy-customer/mock-destroy-customer'
import { updateCustomer } from './update-customer/update-customer'
import { mockUpdateCustomer } from './update-customer/mock-update-customer'
import { getCustomerData } from './get-customer-attributes/get-customer-attributes'
import { mockGetCustomerAttributes } from './get-customer-attributes/mock-get-customer-attributes'
import { CustomerIOAttributesResult } from './get-customer-attributes/types'
import { toggleSubscribeToMarketingEmails } from './toggle-subscribe/toggle-subscribe-to-marketing-emails'
import { mockToggleSubscribeToMarketingEmails } from './toggle-subscribe/mock-toggle-subscribe-to-marketing-emails'
import { CustomerioUser } from './types'

export interface CustomerioApi {
  identifyCustomer: (userId: string, customerioUser: CustomerioUser) => Promise<boolean>
  updateCustomer: (userId: string, data: Partial<CustomerioUser>) => Promise<boolean>
  destroyCustomer: (userId: string) => Promise<boolean>
  getCustomerData: (userId: string) => Promise<CustomerIOAttributesResult>
  toggleSubscribeToMarketingEmails: (userId: string, shouldUnsubscribe: boolean) => Promise<boolean>
}

export const RealCustomerioApi: CustomerioApi = {
  identifyCustomer,
  updateCustomer,
  destroyCustomer,
  getCustomerData,
  toggleSubscribeToMarketingEmails,
}

export const MockCustomerioApi: CustomerioApi = {
  identifyCustomer: mockIdentifyCustomer,
  updateCustomer: mockUpdateCustomer,
  destroyCustomer: mockDestroyCustomer,
  getCustomerData: mockGetCustomerAttributes,
  toggleSubscribeToMarketingEmails: mockToggleSubscribeToMarketingEmails,
}
