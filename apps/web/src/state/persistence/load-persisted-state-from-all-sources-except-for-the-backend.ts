import { store } from '../store'
import { accountActions } from '../slices/account-slice'
import { localStorageWrapper } from '@/local-storage/local-storage-wrapper'
import { ALLOWED_REFERRALS } from '@template-app/core/constants/referral-constants.ts'

// Loads persisted state from localStorage, cookies, and URL parameters synchronously before the app renders.
// This makes Redux the single source of truth from the very beginning.
export const loadPersistedStateFromAllSourcesExceptForTheBackend = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const urlPartnerId = urlParams.get('partnerId')
  const urlCreatorId = urlParams.get('c')
  const urlUtmSource = urlParams.get('utm_source')
  const urlUtmMedium = urlParams.get('utm_medium')
  const urlUtmCampaign = urlParams.get('utm_campaign')
  const urlUtmTerm = urlParams.get('utm_term')
  const urlUtmContent = urlParams.get('utm_content')

  // Use localStorage values if they exist, otherwise fall back to URL parameters
  // This preserves existing tracking data and only uses URL params to fill gaps
  const referral: string = localStorageWrapper.getReferral() || urlPartnerId || urlCreatorId || ''
  const userDetails = {
    referral: ALLOWED_REFERRALS.includes(referral) ? referral : null,
    utmSource: localStorageWrapper.getUtmSource() || urlUtmSource,
    utmMedium: localStorageWrapper.getUtmMedium() || urlUtmMedium,
    utmCampaign: localStorageWrapper.getUtmCampaign() || urlUtmCampaign,
    utmTerm: localStorageWrapper.getUtmTerm() || urlUtmTerm,
    utmContent: localStorageWrapper.getUtmContent() || urlUtmContent,
  }

  store.dispatch(
    accountActions.initializeFromLocalStorage({
      userDetails,
    })
  )
}
