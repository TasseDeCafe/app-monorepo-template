import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../app-reducer'
import {
  DEFAULT_DIALECTS,
  DialectCode,
  LangCode,
  LANGUAGES_WITH_MULTIPLE_DIALECTS,
  SupportedMotherLanguage,
  SupportedStudyLanguage,
} from '@template-app/core/constants/lang-codes.ts'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
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
  hasVoice: boolean
  motherLanguage: SupportedMotherLanguage | null
  hasChosenMotherLanguage: boolean
  studyLanguage: SupportedStudyLanguage | null
  dialect: DialectCode | null
  dailyStudyMinutes: number | null
  referral: string | null
  hasAcceptedTermsAndConditionsAndClickedNext: boolean
  isUserInfoLoaded: boolean
  hasJustClonedVoice: boolean
  // analytics do not include error logging tools, we assume we need error logging tools to make the app work properly
  analyticsCookiesAccepted: boolean
  essentialCookiesAccepted: boolean
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
  hasVoice: false,
  motherLanguage: null,
  hasChosenMotherLanguage: false,
  studyLanguage: null,
  dialect: null,
  dailyStudyMinutes: null,
  referral: '',
  hasAcceptedTermsAndConditionsAndClickedNext: false,
  isUserInfoLoaded: false,
  hasJustClonedVoice: false,
  analyticsCookiesAccepted: false,
  essentialCookiesAccepted: false,
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
    setLocalStorageUserDetails: (state, { payload }: PayloadAction<SetLocalStorageUserDetailsPayload>) => {
      // if by this time we already have a referral and utm params retrieved from the backend, we don't want to override it
      if (!state.isBackendUserInfoLoaded) {
        state.referral = payload.referral
        state.utmSource = payload.utmSource
        state.utmMedium = payload.utmMedium
        state.utmCampaign = payload.utmCampaign
        state.utmTerm = payload.utmTerm
        state.utmContent = payload.utmContent
      }
    },
    setBackendUserInfo: (
      state,
      {
        payload,
      }: PayloadAction<{
        referral: string | null
        hasVoice: boolean
        motherLanguage: LangCode | null
        studyLanguage: SupportedStudyLanguage | null
        studyDialect: DialectCode | null
        dailyStudyMinutes: number | null
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
      state.hasVoice = payload.hasVoice
      if (payload.motherLanguage) {
        state.hasChosenMotherLanguage = true
      }
      state.motherLanguage = payload.motherLanguage
      state.studyLanguage = payload.studyLanguage
      state.dialect = payload.studyDialect
      state.dailyStudyMinutes = payload.dailyStudyMinutes
    },
    setHasVoice: (state) => {
      state.hasVoice = true
      state.hasJustClonedVoice = true
    },
    setHasNoVoice: (state) => {
      state.hasVoice = false
    },
    setIsSupabaseSignInStateLoaded: (state, { payload }: PayloadAction<boolean>) => {
      state.isSupabaseSignInStateLoaded = payload
    },
    setMotherLanguage: (state, { payload }: PayloadAction<SupportedMotherLanguage | null>) => {
      state.motherLanguage = payload
      state.hasChosenMotherLanguage = true
    },
    resetMotherLanguage: (state) => {
      state.motherLanguage = null
      state.hasChosenMotherLanguage = false
    },
    resetStudyLanguage: (state) => {
      state.studyLanguage = null
    },
    setHasChosenNoneOfPossibleMotherLanguages: (state) => {
      state.motherLanguage = null
      state.hasChosenMotherLanguage = true
    },
    setHasAcceptedTermsAndConditionsAndClickedNext: (state, { payload }: PayloadAction<boolean>) => {
      state.hasAcceptedTermsAndConditionsAndClickedNext = payload
    },
    setStudyLanguage: (state, { payload }: PayloadAction<SupportedStudyLanguage | null>) => {
      state.studyLanguage = payload
    },
    setStudyLanguageAndDefaultDialect: (state, { payload }: PayloadAction<SupportedStudyLanguage | null>) => {
      state.studyLanguage = payload
      const language = payload
      if (language) {
        state.dialect = DEFAULT_DIALECTS[language]
      }
    },
    setDialect: (state, { payload }: PayloadAction<DialectCode | null>) => {
      state.dialect = payload
    },
    setDailyStudyMinutes: (state, { payload }: PayloadAction<number | null>) => {
      state.dailyStudyMinutes = payload
    },
    setHasJustClonedVoice: (state, { payload }: PayloadAction<boolean>) => {
      state.hasJustClonedVoice = payload
    },
    clearUserDetails: () => ({
      ...initialState,
      isSupabaseSignInStateLoaded: true,
      isBackendUserInfoLoaded: false,
    }),
    setAllCookiesAccepted: (state) => {
      state.analyticsCookiesAccepted = true
      state.essentialCookiesAccepted = true
    },
    setEssentialCookiesAccepted: (state) => {
      state.essentialCookiesAccepted = true
    },
    setCookiesAreEmpty: (state) => {
      state.analyticsCookiesAccepted = false
      state.essentialCookiesAccepted = false
    },

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

      // Load cookies state
      if (payload.cookiesState === 'all') {
        state.analyticsCookiesAccepted = true
        state.essentialCookiesAccepted = true
      } else if (payload.cookiesState === 'essential') {
        state.analyticsCookiesAccepted = false
        state.essentialCookiesAccepted = true
      } else {
        state.analyticsCookiesAccepted = false
        state.essentialCookiesAccepted = false
      }
    },
  },
})

export const selectIsSignedIn = (state: RootState): boolean => !!state.account.accessToken
export const selectImageUrl = (state: RootState): string => state.account.imageUrl

export const selectFullName = (state: RootState): string => state.account.fullName

export const selectInitials = (state: RootState): string => {
  const { fullName, name, email } = state.account

  const nameBase: string = fullName || name
  if (!nameBase) {
    return email.substring(0, 1).toUpperCase()
  }

  const nameBaseSplit: string[] = nameBase.split(/\s+/)
  if (nameBaseSplit.length > 1) {
    return `${nameBaseSplit[0].charAt(0)}${nameBaseSplit[1].charAt(0)}`.toUpperCase()
  }
  if (1 < nameBase.length) {
    return nameBase.substring(0, 2).toUpperCase()
  }
  return nameBase.charAt(0).toUpperCase()
}

export const selectEmail = (state: RootState): string => state.account.email
export const selectName = (state: RootState): string => state.account.name

export const selectIsSupabaseSignInStateLoading = (state: RootState): boolean =>
  !state.account.isSupabaseSignInStateLoaded
export const selectIsBackendUserInfoLoading = (state: RootState): boolean => !state.account.isBackendUserInfoLoaded
export const selectIsBackendUserInfoLoaded = (state: RootState): boolean => state.account.isBackendUserInfoLoaded
export const selectAccountAccessToken = (state: RootState): string => state.account.accessToken
export const selectHasVoice = (state: RootState): boolean => state.account.hasVoice
export const selectUserId = (state: RootState) => state.account.id
export const selectMotherLanguageOrEnglish = (state: RootState): SupportedMotherLanguage =>
  state.account.motherLanguage || LangCode.ENGLISH
export const selectStudyLanguageOrEnglish = (state: RootState): SupportedStudyLanguage =>
  state.account.studyLanguage || LangCode.ENGLISH
export const selectReferral = (state: RootState): string | null => {
  return state.account.referral
}
export const selectDialectOrDefaultDialectOrEnglishDefaultDialect = (state: RootState): DialectCode => {
  if (state.account.dialect) {
    return state.account.dialect
  }
  return DEFAULT_DIALECTS[selectStudyLanguageOrEnglish(state)]
}

export const selectHasFinishedOnboarding = (state: RootState): boolean => selectMissingOnboardingStep(state) === null
export const selectMissingOnboardingStep = (
  state: RootState
):
  | typeof ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE
  | typeof ROUTE_PATHS.ONBOARDING_MOTHER_LANGUAGE
  | typeof ROUTE_PATHS.ONBOARDING_DIALECT
  // todo onboarding: re-add this when we have gamification
  // | typeof ROUTE_PATHS.ONBOARDING_DAILY_STUDY_TIME
  // | typeof ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS
  // | typeof ROUTE_PATHS.ONBOARDING_CLONE_VOICE
  // | typeof ROUTE_PATHS.ONBOARDING_SUCCESS
  | null => {
  const {
    // having motherLanguage set to null or hasChosenMotherLanguage set to false are not equivalent states
    // it's because the user can choose "other" as a mother language, and end up with motherLanguage set to null
    // but chosenMotherLanguage set to true
    hasChosenMotherLanguage,
    studyLanguage,
    dialect,
    // todo onboarding: re-add this when we have gamification
    // dailyStudyMinutes,
    // hasAcceptedTermsAndConditionsAndClickedNext,
    // hasVoice,
    // hasJustClonedVoice,
  } = state.account
  if (!hasChosenMotherLanguage) {
    return ROUTE_PATHS.ONBOARDING_MOTHER_LANGUAGE
  }
  if (!studyLanguage) {
    return ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE
  }
  if (studyLanguage && LANGUAGES_WITH_MULTIPLE_DIALECTS.includes(studyLanguage) && !dialect) {
    return ROUTE_PATHS.ONBOARDING_DIALECT
  }
  // todo onboarding: re-add this when we have gamification
  // todo onboarding: while commenting out this code, we realized that we never return the ONBOARDING_TOPICS,
  // which might be incorrect (see router)
  // if (studyLanguage && !dailyStudyMinutes) {
  //   return ROUTE_PATHS.ONBOARDING_DAILY_STUDY_TIME
  // }
  // if (hasAcceptedTermsAndConditionsAndClickedNext && !hasVoice) {
  //   return ROUTE_PATHS.ONBOARDING_CLONE_VOICE
  // }
  // if (hasChosenMotherLanguage && !hasVoice) {
  //   return ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS
  // }
  // if (hasChosenMotherLanguage && studyLanguage && hasVoice && hasJustClonedVoice) {
  //   return ROUTE_PATHS.ONBOARDING_SUCCESS
  // }
  return null
}

export const selectMissingCloningStep = (
  state: RootState
):
  | typeof ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS
  | typeof ROUTE_PATHS.ONBOARDING_CLONE_VOICE
  | typeof ROUTE_PATHS.ONBOARDING_SUCCESS
  | null => {
  const {
    hasChosenMotherLanguage,
    studyLanguage,
    hasAcceptedTermsAndConditionsAndClickedNext,
    hasVoice,
    hasJustClonedVoice,
  } = state.account
  if (hasAcceptedTermsAndConditionsAndClickedNext && !hasVoice) {
    return ROUTE_PATHS.ONBOARDING_CLONE_VOICE
  }
  if (hasChosenMotherLanguage && !hasVoice) {
    return ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS
  }
  if (hasChosenMotherLanguage && studyLanguage && hasVoice && hasJustClonedVoice) {
    return ROUTE_PATHS.ONBOARDING_SUCCESS
  }
  return null
}

export const selectHasAllowedReferral = (state: RootState): boolean => {
  const referral = state.account.referral
  return referral !== null && ALLOWED_REFERRALS.includes(referral)
}

export const selectAnalyticsCookiesAccepted = (state: RootState): boolean => state.account.analyticsCookiesAccepted

export const selectEssentialCookiesAccepted = (state: RootState): boolean => state.account.essentialCookiesAccepted

export const selectDailyStudyMinutes = (state: RootState): number | null => state.account.dailyStudyMinutes

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
