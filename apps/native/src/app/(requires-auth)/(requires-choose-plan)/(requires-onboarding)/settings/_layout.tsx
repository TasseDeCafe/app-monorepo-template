import { Stack } from 'expo-router'
import { BackButton } from '@/components/ui/back-button'
import colors from 'tailwindcss/colors'
import { Platform } from 'react-native'

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.indigo[50] },
        headerStyle: {
          backgroundColor: colors.indigo[50],
        },
        headerLeft: () => <BackButton />,
        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'fade',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name='index' options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name='dialect' options={{ title: 'Dialect' }} />
    </Stack>
  )
}
