import type { Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../app-reducer'
import { localStorageWrapper } from '@/local-storage/local-storage-wrapper'

// Redux middleware that automatically persists specific state changes to local storage.
// This makes Redux the single source of truth while keeping local storage in sync.
// there's no need to sync other local storage values that can't be changed by the user, for example referral
export const localStorageMiddleware: Middleware<unknown, RootState> = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()

  localStorageWrapper.setUtmSource(state.account.utmSource)
  localStorageWrapper.setUtmMedium(state.account.utmMedium)
  localStorageWrapper.setUtmCampaign(state.account.utmCampaign)
  localStorageWrapper.setUtmTerm(state.account.utmTerm)
  localStorageWrapper.setUtmContent(state.account.utmContent)
  localStorageWrapper.setReferral(state.account.referral)

  return result
}
