import { ActivityIndicator, Alert, Linking, Switch, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { toast } from 'sonner-native'
import { BigCard } from '@/components/ui/big-card'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar } from '@/components/avatar'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useCallback, useEffect, useState } from 'react'
import {
  useGetMarketingPreferences,
  useUpdateMarketingPreferences,
} from '@/hooks/api/user-marketing-preferences/user-marketing-preferences-hooks'
import RevenueCatUI from 'react-native-purchases-ui'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { SettingsItem } from '@/components/ui/settings-item'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'
import { useLocaleStore } from '@/stores/locale-store'
import { POLISH_LOCALE } from '@yourbestaccent/i18n/i18n-config'
import { SUPPORTED_STRIPE_CURRENCY } from '@yourbestaccent/core/constants/pricing-constants'
import { getConfig } from '@/config/environment-config'
import { User } from '@supabase/supabase-js'
import { useLingui } from '@lingui/react/macro'

export const ToggleSettingsItem = ({
  title,
  value,
  onValueChange,
  disabled,
}: {
  title: string
  value: boolean
  onValueChange: (newValue: boolean) => void
  disabled?: boolean
}) => {
  return (
    <View className={`flex-row items-center justify-between px-2 py-4`}>
      <Text className='text-lg font-medium'>{title}</Text>
      <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  )
}

export default function ProfileScreen() {
  const { t } = useLingui()

  const router = useRouter()
  const session = useAuthStore((state) => state.session)
  const { defaultedUserData } = useGetUser()
  const { data: marketingPreferences } = useGetMarketingPreferences()
  const { mutate: updateMarketingPreferences, isPending: isMarketingPending } = useUpdateMarketingPreferences()
  const [receiveMarketingEmails, setReceiveMarketingEmails] = useState(false)
  const openSheet = useBottomSheetStore((state) => state.open)
  const locale = useLocaleStore((state) => state.locale)

  const currency = locale === POLISH_LOCALE ? SUPPORTED_STRIPE_CURRENCY.PLN : SUPPORTED_STRIPE_CURRENCY.EUR
  const { data: subscriptionDetailsData, isLoading: isSubscriptionLoading } = useGetSubscriptionDetails(currency)

  const subscriptionInfo = subscriptionDetailsData

  const currentNickname = defaultedUserData.nickname || ''

  const handlePressNickname = useCallback(() => {
    openSheet(IndividualSheetName.NICKNAME, { currentNickname })
  }, [currentNickname, openSheet])

  useEffect(() => {
    if (marketingPreferences) {
      setReceiveMarketingEmails(marketingPreferences.shouldReceiveMarketingEmails)
    }
  }, [marketingPreferences])

  const user: User | undefined = session?.user
  const email = user?.email || ''
  const name: string = user?.user_metadata?.name || ''
  const avatarUrl = user?.user_metadata?.avatar_url || ''
  const displayNickname = currentNickname || 'No nickname set'

  const getInitials = () => {
    if (name) {
      return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }
    return email.substring(0, 2).toUpperCase()
  }

  const handleMarketingToggle = (newValue: boolean) => {
    setReceiveMarketingEmails(newValue)
    updateMarketingPreferences({ shouldReceiveMarketingEmails: newValue })
  }

  const handlePressCustomerCenter = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter()
    } catch (error) {
      logWithSentry('Error presenting customer center', error)
      Alert.alert('Error', t`Could not open customer center.`)
    }
  }

  const handlePressUpgrade = async () => {
    try {
      await RevenueCatUI.presentPaywall({ displayCloseButton: true })
    } catch (error) {
      logWithSentry('Error presenting paywall from account', error)
      Alert.alert('Error', t`Could not open upgrade screen.`)
    }
  }

  const handlePressManageWebSubscription = async () => {
    const webAccountUrl = `${getConfig().frontendUrl}/dashboard#account`
    try {
      const supported = await Linking.canOpenURL(webAccountUrl)
      if (supported) {
        await Linking.openURL(webAccountUrl)
      } else {
        Alert.alert('Info', t`Please manage your subscription on our website: ${webAccountUrl}`)
      }
    } catch (error) {
      logWithSentry('Error opening web account url', error)
      Alert.alert('Error', t`Could not open the link. Please visit our website to manage your subscription.`)
    }
  }

  const renderBillingItem = () => {
    if (isSubscriptionLoading) {
      return (
        <View className='flex-row items-center justify-center px-2 py-4'>
          <ActivityIndicator />
        </View>
      )
    }

    if (subscriptionInfo?.isPremiumUser && !subscriptionInfo.billingPlatform) {
      return (
        <SettingsItem
          title={t`Customer Center`}
          value=''
          onPress={() => {
            toast.info(t`You are a special user with free access. You have no active subscription.`)
          }}
          disabled
        />
      )
    }

    if (!subscriptionInfo?.isPremiumUser) {
      return <SettingsItem title={t`Upgrade to Premium`} value='' onPress={handlePressUpgrade} />
    }

    switch (subscriptionInfo.billingPlatform) {
      case 'app_store':
      case 'play_store':
        return <SettingsItem title={t`Customer Center`} value='' onPress={handlePressCustomerCenter} />
      case 'stripe':
        return <SettingsItem title={t`Manage Subscription`} value='Web' onPress={handlePressManageWebSubscription} />
      default:
        logWithSentry('Unexpected billing state in AccountScreen', { subscriptionInfo })
        return null
    }
  }

  return (
    <View className='mt-8 px-4'>
      {/* User profile section */}
      <View className='mb-8 flex-row items-center px-2'>
        <Avatar initials={getInitials()} url={avatarUrl} size={60} />
        <View className='ml-4'>
          <Text className='text-xl font-bold'>{name || 'User'}</Text>
          <Text className='text-gray-500'>{email}</Text>
        </View>
      </View>
      {/* Account settings */}
      <BigCard className='mb-1'>
        <SettingsItem title={t`Public nickname`} value={displayNickname} onPress={handlePressNickname} />

        <ToggleSettingsItem
          title={t`Product updates`}
          value={receiveMarketingEmails}
          onValueChange={handleMarketingToggle}
          disabled={isMarketingPending}
        />

        {renderBillingItem()}

        <SettingsItem
          title={t`Danger Zone`}
          value=''
          onPress={() => router.push('/profile/danger-zone')}
          variant='destructive'
        />
      </BigCard>
    </View>
  )
}
