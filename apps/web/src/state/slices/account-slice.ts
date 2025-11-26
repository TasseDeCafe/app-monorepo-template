import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../app-reducer'
import { ALLOWED_REFERRALS } from '@template-app/core/constants/referral-constants.ts'

export interface AccountState {
  id: string
  accessToken: string
  email: string
  name: string
  fullName: string
  imageUrl: string
  isSupabaseSignInStateLoaded: boolean
  isBackendUserInfoLoaded: boolean
  referral: string | null
  isUserInfoLoaded: boolean
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
}

const initialState: AccountState = {
  id: '',
  accessToken: '',
  email: '',
  name: '',
  fullName: '',
  imageUrl: '',
  isSupabaseSignInStateLoaded: false,
  isBackendUserInfoLoaded: false,
  referral: '',
  isUserInfoLoaded: false,
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmTerm: null,
  utmContent: null,
}

export type SetUserDetailsPayload = {
  id: string
  accessToken: string
  email: string
  name: string
  fullName: string
  imageUrl: string
}

export type SetLocalStorageUserDetailsPayload = {
  referral: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
}

// these are the params that the landing page can send to the frontend
export type ParamsFromLanding = {
  referral: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmTerm: string | null
  utmContent: string | null
}

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setSupabaseAuthUserDetails: (state, action: PayloadAction<SetUserDetailsPayload>) => {
      state.accessToken = action.payload.accessToken
      state.email = action.payload.email
      state.name = action.payload.name
      state.fullName = action.payload.fullName
      state.id = action.payload.id
      state.imageUrl = action.payload.imageUrl
      state.isSupabaseSignInStateLoaded = true
    },
    setBackendUserInfo: (
      state,
      {
        payload,
      }: PayloadAction<{
        referral: string | null
        utmSource: string | null
        utmMedium: string | null
        utmCampaign: string | null
        utmTerm: string | null
        utmContent: string | null
      }>
    ) => {
      state.isBackendUserInfoLoaded = true
      if (payload.referral) {
        state.referral = payload.referral
      }
      if (payload.utmSource) {
        state.utmSource = payload.utmSource
      }
      if (payload.utmMedium) {
        state.utmMedium = payload.utmMedium
      }
      if (payload.utmCampaign) {
        state.utmCampaign = payload.utmCampaign
      }
      if (payload.utmTerm) {
        state.utmTerm = payload.utmTerm
      }
      if (payload.utmContent) {
        state.utmContent = payload.utmContent
      }
    },
    setIsSupabaseSignInStateLoaded: (state, { payload }: PayloadAction<boolean>) => {
      state.isSupabaseSignInStateLoaded = payload
    },
    clearUserDetails: () => ({
      ...initialState,
      isSupabaseSignInStateLoaded: true,
      isBackendUserInfoLoaded: false,
    }),

    initializeFromLocalStorage: (
      state,
      {
        payload,
      }: PayloadAction<{
        userDetails: {
          referral: string | null
          utmSource: string | null
          utmMedium: string | null
          utmCampaign: string | null
          utmTerm: string | null
          utmContent: string | null
        }
        cookiesState: 'all' | 'essential' | 'none'
      }>
    ) => {
      // Load user details (only if not already loaded from backend)
      if (!state.isBackendUserInfoLoaded) {
        state.referral = payload.userDetails.referral
        state.utmSource = payload.userDetails.utmSource
        state.utmMedium = payload.userDetails.utmMedium
        state.utmCampaign = payload.userDetails.utmCampaign
        state.utmTerm = payload.userDetails.utmTerm
        state.utmContent = payload.userDetails.utmContent
      }
    },
  },
})

export const selectIsSignedIn = (state: RootState): boolean => !!state.account.accessToken

export const selectFullName = (state: RootState): string => state.account.fullName

export const selectEmail = (state: RootState): string => state.account.email
export const selectName = (state: RootState): string => state.account.name

export const selectIsSupabaseSignInStateLoading = (state: RootState): boolean =>
  !state.account.isSupabaseSignInStateLoaded
export const selectIsBackendUserInfoLoading = (state: RootState): boolean => !state.account.isBackendUserInfoLoaded
export const selectIsBackendUserInfoLoaded = (state: RootState): boolean => state.account.isBackendUserInfoLoaded
export const selectAccountAccessToken = (state: RootState): string => state.account.accessToken
export const selectUserId = (state: RootState) => state.account.id
export const selectReferral = (state: RootState): string | null => {
  return state.account.referral
}

export const selectHasAllowedReferral = (state: RootState): boolean => {
  const referral = state.account.referral
  return referral !== null && ALLOWED_REFERRALS.includes(referral)
}

export const selectParamsThatHadOriginallyCameFromLanding = createSelector(
  (state: RootState) => state.account,
  (accountState: AccountState): ParamsFromLanding => {
    return {
      referral: accountState.referral,
      utmSource: accountState.utmSource,
      utmMedium: accountState.utmMedium,
      utmCampaign: accountState.utmCampaign,
      utmTerm: accountState.utmTerm,
      utmContent: accountState.utmContent,
    }
  }
)
export const accountActions = accountSlice.actions

export default accountSlice.reducer
