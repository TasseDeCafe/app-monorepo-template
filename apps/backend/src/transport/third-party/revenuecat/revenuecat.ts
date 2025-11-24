import axios from 'axios'
import { getConfig } from '../../../config/environment-config'

export const client = axios.create({
  baseURL: `https://api.revenuecat.com/v2/projects/${getConfig().revenuecatProjectId}`,
  headers: {
    Authorization: `Bearer ${getConfig().revenuecatApiKey}`,
    'Content-Type': 'application/json',
  },
})
