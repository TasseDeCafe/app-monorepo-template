import { Stack } from 'expo-router'
import { BackButton } from '@/components/ui/back-button'

const AuthLayout = () => {
  return (
    <Stack initialRouteName='sign-in/index' screenOptions={{ headerShown: false }}>
      <Stack.Screen name='sign-in/index' options={{ animation: 'none' }} />
      <Stack.Screen name='sign-up/index' options={{ animation: 'none' }} />
      <Stack.Screen
        name='sign-in/email/index'
        options={{
          title: '',
          headerLeft: () => <BackButton />,
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name='sign-up/email/index'
        options={{
          title: '',
          headerLeft: () => <BackButton />,
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name='sign-in/email/verification-sent'
        options={{
          title: '',
          headerLeft: () => <BackButton />,
          headerShown: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name='sign-up/email/verification-sent'
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
