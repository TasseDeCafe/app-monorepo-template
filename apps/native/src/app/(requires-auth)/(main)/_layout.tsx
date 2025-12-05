import { Stack } from 'expo-router'
import colors from 'tailwindcss/colors'

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: colors.indigo[50],
        },
        animation: 'slide_from_right',
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name='(drawer)'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='profile'
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='pricing'
        options={{
          headerShown: true,
          title: 'Pricing',
        }}
      />
      <Stack.Screen
        name='top-secret-admin-settings'
        options={{
          headerShown: true,
          title: 'Admin Settings',
        }}
      />
      <Stack.Screen
        name='premium-demo'
        options={{
          headerShown: true,
          title: 'Premium Demo',
        }}
      />
    </Stack>
  )
}
