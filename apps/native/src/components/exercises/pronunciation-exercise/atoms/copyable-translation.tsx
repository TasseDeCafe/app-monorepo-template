import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { toast } from 'sonner-native'
import { useLingui } from '@lingui/react/macro'

type CopyableTranslationProps = {
  translation: string | undefined
}

export const CopyableTranslation = ({ translation }: CopyableTranslationProps) => {
  const { t } = useLingui()
  const handleCopy = async () => {
    if (translation) {
      await Clipboard.setStringAsync(translation)
      toast.info(`"${translation}" copied to clipboard`)
    }
  }

  return (
    <View className='h-8 w-full items-center justify-center'>
      {translation ? (
        <TouchableOpacity onPress={handleCopy}>
          <Text className='text-center text-base text-gray-800'>{translation}</Text>
        </TouchableOpacity>
      ) : (
        <Text className='text-center text-base text-gray-400'>{t`Loading...`}</Text>
      )}
    </View>
  )
}
