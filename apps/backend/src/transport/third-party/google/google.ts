import { JWT } from 'google-auth-library'
import { getConfig } from '../../../config/environment-config'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const googleCredentials = JSON.parse(getConfig().googleServiceAccountCredentials)

export const serviceAccountAuth = new JWT({
  email: googleCredentials.client_email,
  key: googleCredentials.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})

export const googleAffiliateMasterSpreadsheet = new GoogleSpreadsheet(
  getConfig().googleAffiliateSpreadsheetId,
  serviceAccountAuth
)
