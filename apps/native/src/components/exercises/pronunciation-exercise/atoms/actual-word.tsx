import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { WordPair } from '@yourbestaccent/core/exercises/types/evaluation-types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLingui } from '@lingui/react/macro'

type ActualWordProps = {
  pair: WordPair
  onPress: () => void
}

export const ActualWord = ({ pair, onPress }: ActualWordProps) => {
  const { t } = useLingui()
  const insets = useSafeAreaInsets()
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <TouchableOpacity onPress={onPress}>
          <Text className='h-6 rounded px-2 text-sm text-gray-400'>{pair.actualWord}</Text>
        </TouchableOpacity>
      </PopoverTrigger>
      <PopoverContent side='bottom' insets={contentInsets} avoidCollisions={true}>
        <Text className='text-sm text-gray-500'>{t`Word details will be available in a future update`}</Text>
      </PopoverContent>
    </Popover>
  )
}
