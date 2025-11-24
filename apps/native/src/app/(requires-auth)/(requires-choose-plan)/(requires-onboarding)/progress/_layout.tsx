import { Stack } from 'expo-router'
import { BackButton } from '@/components/ui/back-button'
import colors from 'tailwindcss/colors'

export default function ProgressLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton />,
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.indigo[50],
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
      }}
    />
  )
}
