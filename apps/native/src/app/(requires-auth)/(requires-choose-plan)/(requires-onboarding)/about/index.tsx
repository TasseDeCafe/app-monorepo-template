import { Linking, Text, View } from 'react-native'
import { Image } from 'expo-image'
import * as Haptics from 'expo-haptics'
import { Button } from '@/components/ui/button'
import { BigCard } from '@/components/ui/big-card'
import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links'
import { BLURHASH } from '@template-app/core/utils/image-utils'
import { isUsingPolishLanguage } from '@/utils/locale-utils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLingui } from '@lingui/react/macro'

export default function AboutScreen() {
  const { t } = useLingui()

  const handleOpenForm = () => {
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {})
    }, 10)

    const formUrl = isUsingPolishLanguage()
      ? EXTERNAL_LINKS.BETA_VERSION_FEEDBACK_FORM_IN_POLISH
      : EXTERNAL_LINKS.BETA_VERSION_FEEDBACK_FORM_IN_ENGLISH

    Linking.openURL(formUrl).then(() => {})
  }

  return (
    <SafeAreaView className='flex-1 bg-indigo-50' edges={['left', 'right', 'bottom']}>
      <View className='flex-1 px-4 py-2'>
        <View className='flex-1 flex-col justify-between'>
          <BigCard className='mb-4 flex-1 flex-col items-center rounded-2xl py-6'>
            <View className='flex-1 items-center justify-center px-4'>
              <Image
                source={require('@/assets/images/sebastien-and-kamil.jpg')}
                style={{ width: 150, height: 150, borderRadius: 9999 }}
                contentFit='contain'
                placeholder={BLURHASH}
              />

              <Text className='mt-6 text-center text-base text-gray-700'>{t`Hey there! It's Kamil and Sébastien here, the creators of template-app.com. We've been pouring our hearts into developing this app and your feedback is crucial for us. We're excited to roll out new features soon.`}</Text>
              <Text className='mt-2 text-center text-base text-gray-700'>{t`Please let us know what you think about the app by filling out our feedback form!`}</Text>
            </View>
          </BigCard>

          <View className='pb-10 pt-2'>
            <Button onPress={handleOpenForm} size='lg'>
              {t`Open the form`}
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
