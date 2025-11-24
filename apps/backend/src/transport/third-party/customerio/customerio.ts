import { getConfig } from '../../../config/environment-config'
import { APIClient, RegionEU, TrackClient } from 'customerio-node'

// read about the differences between trackClient and apiClient here:
// https://docs.customer.io/accounts-and-workspaces/managing-credentials/
export const trackClient = new TrackClient(getConfig().customerioSiteId, getConfig().customerioApiKey, {
  region: RegionEU,
})

export const apiClient = new APIClient(getConfig().customerioAppApiKey, { region: RegionEU })
