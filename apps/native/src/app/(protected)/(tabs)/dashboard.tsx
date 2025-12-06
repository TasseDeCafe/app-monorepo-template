import { View, Text } from 'react-native'
import { useTabBarHeight } from '@/hooks/use-tab-bar-height'
import { ScrollView } from 'react-native-gesture-handler'
import { Button } from '@/components/ui/button'
import { router } from 'expo-router'
import { useNeedsSubscription } from '@/hooks/use-needs-subscription'
import { useLingui } from '@lingui/react/macro'
import { usePaywall } from '@/components/billing/hooks/use-paywall'

export default function DashboardScreen() {
  const { t } = useLingui()
  const tabBarHeight = useTabBarHeight()
  const { needsSubscription, isFetching } = useNeedsSubscription()
  const { presentPaywallIfNeeded } = usePaywall()

  const isSubscribed = !needsSubscription && !isFetching

  const handlePremiumPress = async () => {
    if (isSubscribed) {
      router.push('/premium-demo')
    } else {
      await presentPaywallIfNeeded()
    }
  }

  return (
    <View className='flex-1'>
      <ScrollView className='flex-1 px-4 py-2' style={{ paddingBottom: tabBarHeight + 20 }}>
        <Text className='mb-4 text-xl font-bold'>{t`Dashboard`}</Text>

        <View className='rounded-lg bg-indigo-50 p-4'>
          <Text className='mb-2 text-lg font-semibold text-indigo-700'>
            {isSubscribed ? t`Premium Features` : t`Unlock Premium`}
          </Text>
          <Text className='mb-4 text-gray-600'>
            {isSubscribed
              ? t`Access exclusive premium features available to subscribers.`
              : t`Subscribe to unlock premium features and get the most out of the app.`}
          </Text>
          <Button variant='default' onPress={handlePremiumPress}>
            {isSubscribed ? t`View Premium Demo` : t`Subscribe Now`}
          </Button>
        </View>
      </ScrollView>
    </View>
  )
}
