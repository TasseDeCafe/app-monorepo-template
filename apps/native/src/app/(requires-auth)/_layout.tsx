import { Stack } from 'expo-router'
import { RevenuecatInitializer } from '@/components/gates/auth/revenuecat-initializer'
import { ForceUpdateGate } from '@/components/gates/force-update-gate'

const RequiresAuthLayout = () => {
  return (
    <RevenuecatInitializer>
      <ForceUpdateGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name='(main)' />
        </Stack>
      </ForceUpdateGate>
    </RevenuecatInitializer>
  )
}

export default RequiresAuthLayout
