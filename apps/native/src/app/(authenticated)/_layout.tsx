import { Stack } from 'expo-router'
import { RevenuecatInitializer } from '@/features/auth/components/revenuecat-initializer'
import { ForceUpdateGate } from '@/components/gates/force-update-gate'

const ProtectedLayout = () => {
  return (
    <RevenuecatInitializer>
      <ForceUpdateGate>
        <Stack
          screenOptions={{
            headerShown: false,
            headerShadowVisible: false,
            animation: 'slide_from_right',
            headerTitleAlign: 'center',
          }}
        >
          <Stack.Screen
            name='(tabs)'
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
            name='admin-settings'
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
      </ForceUpdateGate>
    </RevenuecatInitializer>
  )
}

export default ProtectedLayout
