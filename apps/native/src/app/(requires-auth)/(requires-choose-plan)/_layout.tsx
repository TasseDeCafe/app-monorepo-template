import { Stack } from 'expo-router'

export default function RequiresChoosePlanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(requires-onboarding)' />
    </Stack>
  )
}
