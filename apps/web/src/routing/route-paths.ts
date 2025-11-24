import { PlanInterval } from '@yourbestaccent/core/constants/pricing-constants.ts'

export const ROUTE_PATHS = {
  ONBOARDING_MOTHER_LANGUAGE: '/onboarding/mother-language',
  ONBOARDING_STUDY_LANGUAGE: '/onboarding/study-language',
  ONBOARDING_DIALECT: '/onboarding/dialect',
  ONBOARDING_DAILY_STUDY_TIME: '/onboarding/daily-study-time',
  ONBOARDING_TERMS_AND_CONDITIONS: '/onboarding/terms-and-conditions',
  ONBOARDING_CLONE_VOICE: '/onboarding/clone-voice',
  ONBOARDING_TOPICS: '/onboarding/topics',
  ONBOARDING_SUCCESS: '/onboarding/success',

  DASHBOARD: '/dashboard',
  CONVERSATION_EXERCISE: '/exercises/conversation',
  STRESS_EXERCISE: '/exercises/stress',
  TRANSLATION_EXERCISE_START: '/exercises/translation/start',
  TRANSLATION_EXERCISE_BY_ID: '/exercises/translation/:id',
  PRONUNCIATION_EVALUATION_CUSTOM_EXERCISE_START: '/exercises/pronunciation-evaluation/custom/start',
  PRONUNCIATION_EVALUATION_STANDARD_EXERCISE_START: '/exercises/pronunciation-evaluation/standard/start',
  PRONUNCIATION_EVALUATION_EXERCISE_BY_ID: '/exercises/pronunciation-evaluation/:id',
  PROGRESS: '/progress',
  PROGRESS_STREAK: '/progress/streak',
  PROGRESS_BADGES: '/progress/badges',
  PROGRESS_BADGES_ALL: '/progress/badges/all',
  PROGRESS_BADGES_STREAK: '/progress/badges/streak',
  PROGRESS_BADGES_WORDS: '/progress/badges/words',
  PROGRESS_BADGES_LANGUAGES: '/progress/badges/languages',
  PROGRESS_STATS: '/progress/stats',
  PROGRESS_STATS_LEARNED_WORDS: '/progress/stats/learned-words',
  PROGRESS_STATS_SAVED_WORDS: '/progress/stats/saved-words',
  PROGRESS_HISTORY: '/progress/history',
  PRICING: '/pricing',
  PRICING_FREE_TRIAL: '/pricing/free-trial',

  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SIGN_IN_EMAIL: '/sign-in/email',
  SIGN_UP_EMAIL: '/sign-up/email',
  SIGN_IN_EMAIL_VERIFICATION_SENT: '/sign-in/email/verification-sent',
  SIGN_UP_EMAIL_VERIFICATION_SENT: '/sign-up/email/verification-sent',
  SIGN_IN_UP_EMAIL_VERIFY: '/sign-in-up/email/verify',

  ACCOUNT_REMOVED: '/account/removed',
  ADMIN_SETTINGS: '/top-secret-admin-settings',
  REDIRECT_TO_CHECK_OUT: '/redirect-to-check-out/:planInterval',
  FROM_LANDING: '/from-landing',
  CHECKOUT_SUCCESS: '/checkout-success',

  CHOOSE_NICKNAME: '/choose-nickname',
  LEADERBOARD: '/leaderboard',
  IPA_CONVERTER: '/ipa-converter',
}

export const ONBOARDING_PATHS = [
  ROUTE_PATHS.ONBOARDING_MOTHER_LANGUAGE,
  ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE,
  ROUTE_PATHS.ONBOARDING_DIALECT,
  ROUTE_PATHS.ONBOARDING_DAILY_STUDY_TIME,
  ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS,
  ROUTE_PATHS.ONBOARDING_CLONE_VOICE,
  ROUTE_PATHS.ONBOARDING_SUCCESS,
] as const

export const buildCheckOutRightAfterSignUpPath = (planInterval: string) => {
  return `/redirect-to-check-out/${planInterval}`
}

export const buildPricingFreeTrialPath = (plan: PlanInterval) => {
  return `${ROUTE_PATHS.PRICING_FREE_TRIAL}?planInterval=${plan}`
}

export type PronunciationEvaluationExerciseSubtype = 'standard' | 'custom'

export const EXERCISE_SUBTYPE_QUERY_PARAM = 'exerciseSubtype'

export const buildPronunciationEvaluationExercisePath = (
  exerciseId: string,
  subtype: PronunciationEvaluationExerciseSubtype
) => {
  return (
    ROUTE_PATHS.PRONUNCIATION_EVALUATION_EXERCISE_BY_ID.replace(':id', exerciseId) +
    `?${EXERCISE_SUBTYPE_QUERY_PARAM}=${subtype}`
  )
}

export const buildTranslationExercisePath = (exerciseId: string) => {
  return ROUTE_PATHS.TRANSLATION_EXERCISE_BY_ID.replace(':id', exerciseId)
}
