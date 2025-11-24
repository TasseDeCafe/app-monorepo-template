import { Stack } from 'expo-router'
import { useIsOnboarded } from '@/hooks/use-is-onboarded'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'

export default function RequiresChoosePlanLayout() {
  const { isOnboarded } = useIsOnboarded()
  const hasJustClonedVoice = useUserOnboardingStore((state) => state.hasJustClonedVoice)

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasJustClonedVoice}>
        {/* note that a user who has just cloned voice is considered onboarded, and yet we allow them to enter a path
        starting with /onboarding..., we do that to keep our mobile and web paths as similar as possible */}
        <Stack.Screen name='(has-just-cloned-voice)/onboarding/success' />
      </Stack.Protected>
      <Stack.Protected guard={!hasJustClonedVoice}>
        <Stack.Protected guard={isOnboarded}>
          <Stack.Screen name='(requires-onboarding)' />
        </Stack.Protected>
        <Stack.Protected guard={!isOnboarded}>
          <Stack.Screen name='onboarding' />
        </Stack.Protected>
      </Stack.Protected>
    </Stack>
  )
}
