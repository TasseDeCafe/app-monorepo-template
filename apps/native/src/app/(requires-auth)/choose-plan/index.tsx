import { Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import colors from 'tailwindcss/colors'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TitleWithGradient } from '@/components/ui/title-with-gradient'
import { ArrowLeft } from 'lucide-react-native'
import { useAuthStore } from '@/stores/auth-store'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePaywall } from '@/components/billing/hooks/use-paywall'
import { useEffect } from 'react'
import { useLingui } from '@lingui/react/macro'

const ChoosePlan = () => {
  const { t } = useLingui()

  const { presentPaywallIfNeeded } = usePaywall()
  const signOut = useAuthStore((state) => state.signOut)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    presentPaywallIfNeeded().then()
    // todo: this entire file is not compiled by the react compiler, see eslint.config.js
    // ideally we shouldn't do this at all
    // we should not put the paywall in the dependency list, because it makes it impossible to close it on the choose-plan page
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we need to run this effect on every render
  }, [])

  const handleShowPlans = async () => {
    await presentPaywallIfNeeded()
  }

  const handleBack = async () => {
    await signOut()
    router.replace('/')
  }

  return (
    <LinearGradient
      colors={[colors.indigo[600], colors.purple[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      {/* Back button */}
      <TouchableOpacity onPress={handleBack} className='absolute left-4 top-16 z-10 flex-row items-center'>
        <ArrowLeft size={24} color='white' />
        <Text className='ml-2 text-lg font-medium text-white'>{t`Sign out`}</Text>
      </TouchableOpacity>
      <View className='flex-1 items-center justify-center px-4'>
        <Card className='w-full max-w-md p-6'>
          <View className='mb-8'>
            <TitleWithGradient>{t`Try for Free`}</TitleWithGradient>
          </View>

          <View className='mb-6'>
            <Text className='text-center text-lg leading-relaxed text-gray-600'>{t`To continue using the app and access all features, see our plans. All of them provide a free trial.`}</Text>
          </View>

          <View className='gap-4'>
            <Button
              variant='default'
              size='lg'
              onPress={handleShowPlans}
              className='h-16 w-full items-center justify-center bg-indigo-600'
              textClassName='text-2xl font-medium h-full'
            >
              Show Plans
            </Button>
          </View>
        </Card>
      </View>
    </LinearGradient>
  )
}

export default ChoosePlan
