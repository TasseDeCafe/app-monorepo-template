import { Stack } from 'expo-router'
import { BackButton } from '@/components/ui/back-button'
import colors from 'tailwindcss/colors'
import { Platform } from 'react-native'

export default function AccountLayout() {
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
      <Stack.Screen
        name='danger-zone'
        options={{ title: 'Danger Zone', headerStyle: { backgroundColor: colors.red[50] } }}
      />
    </Stack>
  )
}
