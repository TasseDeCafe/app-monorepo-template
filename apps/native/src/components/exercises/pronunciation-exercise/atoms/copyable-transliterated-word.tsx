import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { toast } from 'sonner-native'
import * as Haptics from 'expo-haptics'

type Props = {
  text: string
}

export const CopyableTransliteratedWord = ({ text }: Props) => {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(text)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then()
    toast.info(`"${text}" copied to clipboard`)
  }

  return (
    <TouchableOpacity onPress={handleCopy}>
      <Text className='text-center text-sm text-gray-400'>{text}</Text>
    </TouchableOpacity>
  )
}
