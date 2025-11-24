import { ROUTE_PATHS } from '@/constants/route-paths'
import { LANGUAGES_WITH_MULTIPLE_DIALECTS } from '@yourbestaccent/core/constants/lang-codes'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import { Route } from 'expo-router'

export const useIsOnboarded = () => {
  const motherLanguage = useUserOnboardingStore((state) => state.motherLanguage)
  const studyLanguage = useUserOnboardingStore((state) => state.studyLanguage)
  const dialect = useUserOnboardingStore((state) => state.dialect)
  const dailyStudyMinutes = useUserOnboardingStore((state) => state.dailyStudyMinutes)
  const hasVoice = useUserOnboardingStore((state) => state.hasVoice)
  const hasJustClonedVoice = useUserOnboardingStore((state) => state.hasJustClonedVoice)
  const hasJustAcceptedTerms = useUserOnboardingStore((state) => state.hasJustAcceptedTerms)
  const hasJustSelectedTopics = useUserOnboardingStore((state) => state.hasJustSelectedTopics)

  const getMissingOnboardingStep = (): Route | null => {
    if (!motherLanguage) {
      return ROUTE_PATHS.ONBOARDING_MOTHER_LANGUAGE
    }

    if (!studyLanguage) {
      return ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE
    }

    const needsDialectSelection = studyLanguage && LANGUAGES_WITH_MULTIPLE_DIALECTS.includes(studyLanguage) && !dialect

    if (needsDialectSelection) {
      return ROUTE_PATHS.ONBOARDING_DIALECT
    }

    if (!hasVoice && !hasJustSelectedTopics) {
      return ROUTE_PATHS.ONBOARDING_TOPICS
    }

    if (dailyStudyMinutes === null) {
      return ROUTE_PATHS.ONBOARDING_DAILY_STUDY_MINUTES
    }

    if (!hasVoice && !hasJustAcceptedTerms) {
      return ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS
    }

    if (!hasVoice && !hasJustClonedVoice) {
      return ROUTE_PATHS.ONBOARDING_CLONE_VOICE
    }

    return null
  }

  const missingOnboardingStepRoute = getMissingOnboardingStep()

  return {
    isOnboarded: missingOnboardingStepRoute === null,
    missingOnboardingStepRoute: missingOnboardingStepRoute,
  }
}
