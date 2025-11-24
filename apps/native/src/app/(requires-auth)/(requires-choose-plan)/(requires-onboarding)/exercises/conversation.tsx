import { Linking, Text, View } from 'react-native'
import { Stack } from 'expo-router'
import { BigCard } from '@/components/ui/big-card'
import * as Haptics from 'expo-haptics'
import { Button } from '@/components/ui/button'
import { Image } from 'expo-image'
import { BLURHASH } from '@template-app/core/utils/image-utils'
import { getConfig } from '@/config/environment-config'
import { useLingui } from '@lingui/react/macro'

export default function ConversationScreen() {
  const { t } = useLingui()
  const handleWebAppNavigation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Linking.openURL(`${getConfig().frontendUrl}/exercises/stress`)
  }

  return (
    <View className='flex-1 bg-indigo-50 px-4 py-2'>
      <Stack.Screen
        options={{
          title: 'Conversation',
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

            <Text className='mt-6 text-center text-xl font-semibold text-gray-800'>{t`Coming Soon!`}</Text>

            <Text className='mt-3 text-center text-base text-gray-600'>
              {t`Our Conversation feature is currently in development for the mobile app.`}
            </Text>

            <Text className='mt-6 text-center text-sm text-gray-700'>
              {t`Want to try this feature right away? It's available on our web platform.`}
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
