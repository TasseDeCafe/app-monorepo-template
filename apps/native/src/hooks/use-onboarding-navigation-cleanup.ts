import { useFocusEffect, useNavigation, usePathname, useRouter } from 'expo-router'
import { useCallback, useEffect } from 'react'
import { useIsOnboarded } from '@/hooks/use-is-onboarded'
import { ONBOARDING_PATHS } from '@/constants/route-paths'

// note that this hook is responsible for moving to the next step only,
// for moving the user backwards we just let the user to do it manually
// our onboarding flow is quite complex, for moving to the next step we control the flow programmatically from this hook,
// that is: we use push.router...
export const useRedirectToNextOnboardingStep = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { missingOnboardingStepRoute } = useIsOnboarded()

  useFocusEffect(
    useCallback(() => {
      if (
        missingOnboardingStepRoute !== null &&
        pathname !== missingOnboardingStepRoute &&
        // this condition makes sure that this hook is responsible for moving forward only
        ONBOARDING_PATHS.indexOf(pathname) < ONBOARDING_PATHS.indexOf(missingOnboardingStepRoute)
      ) {
        router.push(missingOnboardingStepRoute)
      }
    }, [missingOnboardingStepRoute, pathname, router])
  )
}

//... while for moving backwards (through use swipe gesture on iOS or back button on iOS/Android) we just
// let the user to do it manually. But we need to reset the onboarding store state to the previous step's state

export const useOnboardingNavigationCleanup = (onNavigateBack: () => void, dependencies: unknown[] = []) => {
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
        onNavigateBack()
      }
    })

    return unsubscribe
    // todo: this entire file is not compiled by the react compiler, see eslint.config.js
    // ideally we shouldn't do this at all
    // this comment below allows us to pass a spread operator to the dependencies array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, onNavigateBack, ...dependencies])
}
