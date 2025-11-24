import { useEffect } from 'react'
import { router } from 'expo-router'
import { useIsOnboarded } from '@/hooks/use-is-onboarded'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useLingui } from '@lingui/react/macro'

// we land here by default whenever user is redirected to /onboarding
// only here we decide which onboarding step to show
export default function OnboardingIndex() {
  const { t } = useLingui()
  const { missingOnboardingStepRoute } = useIsOnboarded()

  useEffect(() => {
    if (missingOnboardingStepRoute) {
      router.replace(missingOnboardingStepRoute)
    }
  }, [missingOnboardingStepRoute])

  return <LoadingScreen message={t`Preparing your onboarding...`} />
}
