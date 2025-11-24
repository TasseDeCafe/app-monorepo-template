import { Linking, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { BigCard } from '@/components/ui/big-card'
import { Image } from 'expo-image'
import { BLURHASH } from '@yourbestaccent/core/utils/image-utils'
import { Button } from '@/components/ui/button'
import * as Haptics from 'expo-haptics'
import { getConfig } from '@/config/environment-config'
import { useLingui } from '@lingui/react/macro'

export default function LevelExerciseScreen() {
  const { t } = useLingui()
  const handleWebAppNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Linking.openURL(`${getConfig().frontendUrl}/progress/stats/saved-words`)
  }

  return (
    <View className='flex-1 bg-indigo-50 px-4 py-2'>
      <Stack.Screen
        options={{
          title: 'Saved Words',
        }}
      />

      <View className='flex-1 flex-col justify-between'>
        <BigCard className='mb-4 flex-1 flex-col items-center rounded-2xl py-6'>
          <View className='flex-1 items-center justify-center px-4'>
            <Image
              source={require('@/assets/images/coming_soon.png')}
              style={{ width: 400, height: 300 }}
              contentFit='contain'
              placeholder={BLURHASH}
              transition={1000}
              className='bg-gray-100'
            />

            <Text className='mt-6 text-center text-xl font-semibold text-gray-800'>{t`Coming Soon to the App!`}</Text>

            <Text className='mt-3 text-center text-base text-gray-600'>
              {t`This feature is still in development for the mobile app.`}
            </Text>

            <Text className='mt-6 text-center text-sm text-gray-700'>
              {t`You can use this feature today on our web platform.`}
            </Text>
          </View>
        </BigCard>

        <View className='pb-10 pt-2'>
          <Button
            variant='default'
            size='lg'
            onPress={handleWebAppNavigation}
            className='bg-indigo-600'
            textClassName='text-lg'
          >
            {t`Continue on the Web App`}
          </Button>
        </View>
      </View>
    </View>
  )
}
