export const ROUTE_PATHS = {
  ONBOARDING_MOTHER_LANGUAGE: '/onboarding/mother-language',
  ONBOARDING_STUDY_LANGUAGE: '/onboarding/study-language',
  ONBOARDING_DIALECT: '/onboarding/dialect',
  ONBOARDING_TOPICS: '/onboarding/topics',
  ONBOARDING_DAILY_STUDY_MINUTES: '/onboarding/daily-study-minutes',
  ONBOARDING_TERMS_AND_CONDITIONS: '/onboarding/terms-and-conditions',
  ONBOARDING_CLONE_VOICE: '/onboarding/clone-voice',
  ONBOARDING_SUCCESS: '/onboarding/success',
  DASHBOARD: '/dashboard',
  PRONUNCIATION_EVALUATION_STANDARD_EXERCISE_START: '/exercises/pronunciation-evaluation-standard-start',
  PRONUNCIATION_EVALUATION_CUSTOM_EXERCISE_START: '/exercises/pronunciation-evaluation-custom-start',
  CONVERSATION_EXERCISE: '/exercises/conversation',
  STRESS_EXERCISE: '/exercises/stress',
  PROGRESS: '/progress',
  PRICING: '/pricing',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  SIGN_IN_EMAIL: '/sign-in/email',
  SIGN_UP_EMAIL: '/sign-up/email',
  SIGN_IN_EMAIL_VERIFICATION_SENT: '/sign-in/email/verification-sent',
  SIGN_UP_EMAIL_VERIFICATION_SENT: '/sign-up/email/verification-sent',
  SIGN_IN_UP_EMAIL_VERIFY: '/sign-in-up/email/verify',

  ACCOUNT_REMOVED: '/account/removed',
  ADMIN_SETTINGS: '/top-secret-admin-settings',
  LEADERBOARD: '/leaderboard',

  // the ones below do not exist in the frontend
  SEE_PLANS: '/choose-plan',
} as const

export const ONBOARDING_PATHS: string[] = [
  ROUTE_PATHS.ONBOARDING_MOTHER_LANGUAGE,
  ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE,
  ROUTE_PATHS.ONBOARDING_DIALECT,
  ROUTE_PATHS.ONBOARDING_TOPICS,
  ROUTE_PATHS.ONBOARDING_DAILY_STUDY_MINUTES,
  ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS,
  ROUTE_PATHS.ONBOARDING_CLONE_VOICE,
  ROUTE_PATHS.ONBOARDING_SUCCESS,
]
