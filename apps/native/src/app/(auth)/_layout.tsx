import { Stack } from 'expo-router'
import { BackButton } from '@/components/ui/back-button'

const AuthLayout = () => {
  return (
    <Stack initialRouteName='login/index' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='login/index' options={{ animation: 'none' }} />
      <Stack.Screen
        name='login/email/index'
        options={{
          title: '',
          headerLeft: () => <BackButton />,
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name='login/email/sent'
        options={{
          title: '',
          headerLeft: () => <BackButton />,
          headerShown: true,
          headerTransparent: true,
        }}
      />
    </Stack>
  )
}
export default AuthLayout
