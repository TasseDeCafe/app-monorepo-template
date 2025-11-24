import { Stack } from 'expo-router'
import { BackButton } from '@/components/ui/back-button'
import colors from 'tailwindcss/colors'

export default function ExercisesLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton />,
        headerShown: true,
        contentStyle: { backgroundColor: 'white' },
        headerStyle: {
          backgroundColor: colors.indigo[50],
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}
    />
  )
}
