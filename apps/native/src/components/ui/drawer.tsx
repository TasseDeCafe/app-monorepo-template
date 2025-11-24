import React, { useCallback } from 'react'
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Href } from 'expo-router'
import { useRouter } from 'expo-router'
import { Avatar } from '../avatar'
import { useAuthStore } from '@/stores/auth-store'
import { useDrawerStore } from '@/stores/drawer-store'
import * as Haptics from 'expo-haptics'
import {
  CircleHelp,
  CircleUserRound,
  CreditCard,
  Dumbbell,
  Home,
  LogOut,
  Mail,
  Settings,
  TrendingUp,
  Trophy,
} from 'lucide-react-native'
import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links'
import colors from 'tailwindcss/colors'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import RevenueCatUI from 'react-native-purchases-ui'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { checkIsTestUser } from '@/utils/test-users-utils'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { useLingui } from '@lingui/react/macro'

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  onPress: () => void
}

const MenuItem = React.memo(({ icon, label, onPress }: MenuItemProps) => {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then()
    onPress()
  }, [onPress])

  return (
    <TouchableOpacity className='flex-row items-center px-5 py-3' onPress={handlePress}>
      <View className='w-7'>{icon}</View>
      <Text className='ml-3 text-2xl text-stone-900'>{label}</Text>
    </TouchableOpacity>
  )
})
MenuItem.displayName = 'MenuItem'

const FooterLink = React.memo(({ label, onPress }: { label: string; onPress: () => void }) => {
  return (
    <TouchableOpacity className='py-2' onPress={onPress}>
      <Text className='text-xs text-indigo-600'>{label}</Text>
    </TouchableOpacity>
  )
})
FooterLink.displayName = 'FooterLink'

const ProfileSection = React.memo(
  ({
    name,
    email,
    avatarUrl,
    initials,
    onPress,
  }: {
    name: string
    email: string
    avatarUrl: string
    initials: string
    onPress: () => void
  }) => {
    const { t } = useLingui()

    return (
      <TouchableOpacity className='mb-6 flex-row items-center px-5' onPress={onPress}>
        <Avatar initials={initials} url={avatarUrl} size={52} />
        <View className='ml-3 flex-1'>
          <Text className='text-xl font-bold'>{name || t`User`}</Text>
          <Text className='text-gray-500' numberOfLines={1} ellipsizeMode='tail'>
            {email}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
)
ProfileSection.displayName = 'ProfileSection'

const Divider = React.memo(() => <View className='mx-auto my-2 w-[90%] border-t border-gray-200' />)
Divider.displayName = 'Divider'

export const Drawer = React.memo(() => {
  const { t } = useLingui()

  const insets = useSafeAreaInsets()
  const router = useRouter()
  const setIsOpen = useDrawerStore((state) => state.setIsOpen)
  const session = useAuthStore((state) => state.session)
  const signOut = useAuthStore((state) => state.signOut)
  const openSheet = useBottomSheetStore((state) => state.open)

  const user = session?.user
  const email = user?.email || ''
  const rawName = user?.user_metadata?.name
  const name = typeof rawName === 'string' ? rawName : ''
  const avatarUrl = user?.user_metadata?.avatar_url || ''
  const isTestUser = checkIsTestUser(email)

  const getInitials = useCallback(() => {
    if (name) {
      return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }

    return email.substring(0, 2).toUpperCase()
  }, [name, email])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const handleProfilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then()
    // todo expo routing: try to use the below navigateTo method instead
    router.push('/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/(drawer)/(tabs)/profile')
    closeDrawer()
  }, [router, closeDrawer])

  const navigateTo = useCallback(
    (path: Href) => {
      router.push(path)
      closeDrawer()
    },
    [router, closeDrawer]
  )

  const handleHomePress = useCallback(() => {
    navigateTo('/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/(drawer)/(tabs)')
  }, [navigateTo])

  const handleAccountPress = useCallback(() => {
    navigateTo('/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/(drawer)/(tabs)/profile')
  }, [navigateTo])

  const handleExercisesPress = useCallback(() => {
    navigateTo('/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/(drawer)/(tabs)/dashboard')
  }, [navigateTo])

  const handleProgressPress = useCallback(() => {
    navigateTo('/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/(drawer)/(tabs)/progress')
  }, [navigateTo])

  const handleLeaderboardPress = useCallback(() => {
    navigateTo('/(requires-auth)/(requires-choose-plan)/(requires-onboarding)/(drawer)/(tabs)/leaderboard')
  }, [navigateTo])

  const handleSettingsPress = useCallback(() => {
    navigateTo('/settings')
  }, [navigateTo])

  const handleContactPress = useCallback(() => {
    openSheet(IndividualSheetName.CONTACT_US)
    closeDrawer()
  }, [openSheet, closeDrawer])

  const handleAboutPress = useCallback(() => {
    navigateTo('/about')
  }, [navigateTo])

  const handlePricingPress = useCallback(() => {
    RevenueCatUI.presentPaywall({ displayCloseButton: false }).catch((paywallError) => {
      logWithSentry('Paywall presentation/dismiss error', paywallError)
    })
  }, [])

  const handleAdminSettingsPress = useCallback(() => {
    navigateTo(ROUTE_PATHS.ADMIN_SETTINGS)
  }, [navigateTo])

  const handleTermsPress = useCallback(() => {
    Linking.openURL(EXTERNAL_LINKS.TERMS_OF_SERVICE_URL).then()
  }, [])

  const handlePrivacyPress = useCallback(() => {
    Linking.openURL(EXTERNAL_LINKS.PRIVACY_POLICY_URL).then()
  }, [])

  const handleSignOutPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then()
    signOut().then(() => {})
    closeDrawer()
  }, [signOut, closeDrawer])

  return (
    <View className='flex-1 border-r border-gray-200 bg-white'>
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top + 20, 20),
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* User Profile Section */}
        <ProfileSection
          name={name}
          email={email}
          avatarUrl={avatarUrl}
          initials={getInitials()}
          onPress={handleProfilePress}
        />

        <Divider />

        {/* Menu Items */}
        <MenuItem icon={<Home size={24} color={colors.stone[900]} />} label={t`Home`} onPress={handleHomePress} />
        <MenuItem
          icon={<Dumbbell size={24} color={colors.stone[900]} />}
          label={t`Practice`}
          onPress={handleExercisesPress}
        />
        <MenuItem
          icon={<TrendingUp size={24} color={colors.stone[900]} />}
          label={t`Progress`}
          onPress={handleProgressPress}
        />
        <MenuItem
          icon={<Trophy size={24} color={colors.stone[900]} />}
          label={t`Leaderboard`}
          onPress={handleLeaderboardPress}
        />

        <MenuItem
          icon={<CreditCard size={24} color={colors.stone[900]} />}
          label={t`Pricing`}
          onPress={handlePricingPress}
        />

        <MenuItem icon={<Mail size={24} color={colors.stone[900]} />} label={t`Contact`} onPress={handleContactPress} />

        <MenuItem
          icon={<CircleHelp size={24} color={colors.stone[900]} />}
          label={t`About`}
          onPress={handleAboutPress}
        />

        <MenuItem
          icon={<CircleUserRound size={24} color={colors.stone[900]} />}
          label={t`Profile`}
          onPress={handleAccountPress}
        />

        <MenuItem
          icon={<Settings size={24} color={colors.stone[900]} />}
          label={t`Settings`}
          onPress={handleSettingsPress}
        />
        {isTestUser && (
          <MenuItem
            icon={<Settings size={24} color={colors.stone[900]} />}
            label={t`Admin Settings`}
            onPress={handleAdminSettingsPress}
          />
        )}

        <Divider />

        <MenuItem
          icon={<LogOut size={24} color={colors.stone[900]} />}
          label={t`Sign out`}
          onPress={handleSignOutPress}
        />

        {/* Footer Links */}
        <View className='mt-4 px-5'>
          <FooterLink label={t`Terms of Service`} onPress={handleTermsPress} />
          <FooterLink label={t`Privacy Policy`} onPress={handlePrivacyPress} />
        </View>
      </ScrollView>
    </View>
  )
})
Drawer.displayName = 'Drawer'
