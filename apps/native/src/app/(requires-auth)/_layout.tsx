import { router, Stack } from 'expo-router'
import { useAuthStore } from '@/stores/auth-store'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { useNeedsSubscription } from '@/hooks/use-needs-subscription'
import { RevenuecatInitializer } from '@/components/gates/auth/revenuecat-initializer'
import { Alert } from 'react-native'
import { ForceUpdateGate } from '@/components/gates/force-update-gate'
import { useLingui } from '@lingui/react/macro'

const RequiresAuthLayout = () => {
  const { t } = useLingui()

  const signOut = useAuthStore((state) => state.signOut)
  const {
    needsSubscription,
    isFetching: isFetchingNeedsSubscription,
    isError: isNeedsSubscriptionError,
  } = useNeedsSubscription()

  if (isFetchingNeedsSubscription) {
    return <LoadingScreen message={t`Checking plan...`} />
  }

  if (isNeedsSubscriptionError) {
    Alert.alert('Error', t`Failed to retrieve payment system. Please restart the app.`, [
      { text: 'OK', onPress: () => signOut().then(() => router.replace('/')) },
    ])
    return <LoadingScreen message={t`Error checking plan...`} />
  }

  return (
    <RevenuecatInitializer>
      <ForceUpdateGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={needsSubscription}>
            <Stack.Screen name='choose-plan/index' />
          </Stack.Protected>
          <Stack.Protected guard={!needsSubscription}>
            <Stack.Screen name='(requires-choose-plan)' />
          </Stack.Protected>
        </Stack>
      </ForceUpdateGate>
    </RevenuecatInitializer>
  )
}

export default RequiresAuthLayout
