import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { WordPairWithAlignment } from '@yourbestaccent/core/exercises/types/evaluation-types'
import { BaseExpectedWord } from '@/components/exercises/pronunciation-exercise/atoms/expected-word-base'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PlayExpectedWordButton } from './play-expected-word-button'
import { DownloadButton } from './download-button'
import * as Clipboard from 'expo-clipboard'
import { toast } from 'sonner-native'
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuItemTitle,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useLingui } from '@lingui/react/macro'

type ExpectedWordProps = {
  wordPairWithAlignment: WordPairWithAlignment
  onPress?: () => void
  translation?: string
  audioIndividualWord: string | null
}

export const ExpectedWord = ({
  wordPairWithAlignment,
  onPress,
  translation,
  audioIndividualWord,
}: ExpectedWordProps) => {
  const { t } = useLingui()
  const { expectedWord } = wordPairWithAlignment

  const handleCopyWord = async () => {
    if (expectedWord) {
      await Clipboard.setStringAsync(expectedWord)
      toast.info(`"${expectedWord}" copied to clipboard`)
    }
  }

  const handleCopyTranslation = async () => {
    if (translation) {
      await Clipboard.setStringAsync(translation)
      toast.info(`"${translation}" copied to clipboard`)
    }
  }

  return (
    <ContextMenuRoot>
      <ContextMenuTrigger>
        <Popover>
          <PopoverTrigger asChild>
            {/* Explicitly handle long press to avoid triggering a regular press when long pressing*/}
            <TouchableOpacity
              className='relative h-10 items-center justify-center rounded-xl border-l border-r border-t border-gray-200 bg-white'
              onPress={onPress}
              onLongPress={() => {}}
              delayLongPress={150}
            >
              <BaseExpectedWord wordPair={wordPairWithAlignment} />
            </TouchableOpacity>
          </PopoverTrigger>
          <PopoverContent side='bottom' avoidCollisions={true} className='rounded-lg p-4'>
            <View className='w-full gap-2'>
              <View className='h-8 w-full items-center justify-center'>
                {translation ? (
                  <Text className='text-center text-base text-gray-800'>{translation}</Text>
                ) : (
                  <Text className='text-center text-base text-gray-400'>{t`Loading...`}</Text>
                )}
              </View>

              {/* Separator line */}
              <View className='h-[1px] w-full bg-gray-200' />

              <View className='w-full flex-row items-center justify-between'>
                <View className='flex-row items-center gap-2'>
                  <PlayExpectedWordButton audioIndividualWord={audioIndividualWord} />
                  <Text className='text-sm text-gray-700'>{t`Your better pronunciation`}</Text>
                </View>

                <DownloadButton audioUri={audioIndividualWord} fileName={`word--${expectedWord || 'word'}`} />
              </View>
            </View>
          </PopoverContent>
        </Popover>
      </ContextMenuTrigger>
      <ContextMenuContent className='rounded-lg bg-white p-2 shadow-md'>
        <ContextMenuItem key='copy-word' onSelect={handleCopyWord}>
          <ContextMenuItemIcon ios={{ name: 'doc.on.doc' }} />
          <ContextMenuItemTitle>{t`Copy Word`}</ContextMenuItemTitle>
        </ContextMenuItem>
        <ContextMenuItem key='copy-translation' onSelect={handleCopyTranslation}>
          <ContextMenuItemIcon ios={{ name: 'doc.on.doc' }} />
          <ContextMenuItemTitle>{t`Copy Translation`}</ContextMenuItemTitle>
        </ContextMenuItem>
        <ContextMenuSeparator className='my-1 h-[1px] bg-gray-200' />
        <ContextMenuItem key='save'>
          <ContextMenuItemIcon ios={{ name: 'bookmark' }} androidIconName='bookmark' />
          <ContextMenuItemTitle>{t`Save Word`}</ContextMenuItemTitle>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenuRoot>
  )
}
