import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  // since no initial screen is specified we will land in the index.tsx
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
}
