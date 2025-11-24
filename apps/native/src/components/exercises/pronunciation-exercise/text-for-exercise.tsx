import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { splitTextIntoWords } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'
import { useTranslateWord } from '@/hooks/api/translation/translation-hooks'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useIpaTranscription } from '@/hooks/api/ipa-transcription/ipa-transcription-hooks'
import { useTransliteration } from '@/hooks/api/transliteration/transliteration-hooks'
import { NarrowSkeleton } from './atoms/narrow-skeleton'
import { useAddSavedWord, useIsWordSaved, useRemoveSavedWord } from '@/hooks/api/saved-words/saved-words-hooks'
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuItemTitle,
  ContextMenuRoot,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../../ui/context-menu'
import * as Haptics from 'expo-haptics'
import * as Clipboard from 'expo-clipboard'
import { toast } from 'sonner-native'
import { PlayExpectedWordButton } from '@/components/exercises/pronunciation-exercise/atoms/play-expected-word-button'
import { DownloadButton } from '@/components/exercises/pronunciation-exercise/atoms/download-button'
import { useGenerateAudioWord } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { CopyableIpaWord } from '@/components/exercises/pronunciation-exercise/atoms/copyable-ipa-word'
import { CopyableTransliteratedWord } from '@/components/exercises/pronunciation-exercise/atoms/copyable-transliterated-word'
import { usePreferencesStore } from '@/stores/preferences-store'
import { isLanguageWithTransliteration } from '@yourbestaccent/core/utils/lang-codes-utils'
import { useLingui } from '@lingui/react/macro'

type Props = {
  text: string
  studyLanguage: SupportedStudyLanguage
}

export const TextForExercise = ({ text, studyLanguage }: Props) => {
  const { t } = useLingui()
  const { defaultedUserData } = useGetUser()
  const dialect = defaultedUserData.studyDialect
  const motherLanguage = defaultedUserData.motherLanguage
  const words: string[] = splitTextIntoWords(text, studyLanguage)

  const shouldShowIpa = usePreferencesStore((state) => state.shouldShowIpa)
  const shouldShowTransliteration = usePreferencesStore((state) => state.shouldShowTransliteration)

  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0)

  const { data: translationData, isLoading: isTranslating } = useTranslateWord(
    selectedWord,
    dialect,
    motherLanguage,
    words,
    selectedWordIndex
  )

  const { data: ipaTranscriptionData, isFetching: isFetchingIpa } = useIpaTranscription(text, studyLanguage, dialect)
  const { data: transliterationData, isFetching: isFetchingTransliteration } = useTransliteration(text, studyLanguage)

  const translation = translationData?.translation.trim()
  const ipaTranscriptionWords: string[] = ipaTranscriptionData?.ipaTranscription || []
  const transliterationWords: string[] = splitTextIntoWords(transliterationData?.transliteration || '', studyLanguage)

  const { data: audioIndividualWordData } = useGenerateAudioWord(selectedWord, studyLanguage, dialect)

  const audioIndividualWord = audioIndividualWordData?.audio || null

  const { data: isSaved } = useIsWordSaved(selectedWord, studyLanguage)
  const { mutate: addSavedWord } = useAddSavedWord(selectedWord, studyLanguage)
  const { mutate: removeSavedWord } = useRemoveSavedWord(selectedWord, studyLanguage)

  const handleTap = (word: string | null, wordIndex: number) => {
    if (word) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
      setSelectedWord(word)
      setSelectedWordIndex(wordIndex)
    }
  }

  const handleLongPress = (word: string | null, wordIndex: number) => {
    if (word) {
      setSelectedWord(word)
      setSelectedWordIndex(wordIndex)
    }
  }

  const handleCopyWord = async () => {
    if (selectedWord) {
      await Clipboard.setStringAsync(selectedWord)
      toast.info(`"${selectedWord}" copied to clipboard`)
    }
  }

  const handleCopyTranslation = async () => {
    if (translation) {
      await Clipboard.setStringAsync(translation)
      toast.info(`"${translation}" copied to clipboard`)
    }
  }

  const handleToggleSavedStatus = () => {
    if (!selectedWord) return

    if (isSaved) {
      removeSavedWord({
        language: studyLanguage,
        contextWords: words,
        wordIndex: selectedWordIndex,
      })
    } else {
      addSavedWord({
        language: studyLanguage,
        contextWords: words,
        wordIndex: selectedWordIndex,
      })
    }
  }

  return (
    <View className='w-full items-center'>
      <View className='mb-4 mt-4 flex-row flex-wrap justify-center gap-2'>
        {words.map((word: string, index: number) => (
          <View key={`word-interaction-${index}`} className='flex-col items-center'>
            {/* Transliteration row - only for languages with transliteration support */}
            {isLanguageWithTransliteration(studyLanguage) && !shouldShowTransliteration && <View className='h-6' />}
            {isLanguageWithTransliteration(studyLanguage) && shouldShowTransliteration && isFetchingTransliteration && (
              <NarrowSkeleton />
            )}
            {isLanguageWithTransliteration(studyLanguage) &&
              shouldShowTransliteration &&
              !isFetchingTransliteration &&
              transliterationWords[index] && <CopyableTransliteratedWord text={transliterationWords[index]} />}
            {isLanguageWithTransliteration(studyLanguage) &&
              shouldShowTransliteration &&
              !isFetchingTransliteration &&
              !transliterationWords[index] && <View className='h-6' />}

            {/* IPA row - always render space to maintain vertical alignment */}
            {!shouldShowIpa && <View className='h-6' />}
            {shouldShowIpa && isFetchingIpa && <NarrowSkeleton />}
            {shouldShowIpa && !isFetchingIpa && ipaTranscriptionWords[index] && (
              <CopyableIpaWord text={ipaTranscriptionWords[index]} />
            )}
            {shouldShowIpa && !isFetchingIpa && !ipaTranscriptionWords[index] && (
              <Text className='text-center text-sm text-transparent'>{'\u200B'}</Text>
            )}

            <ContextMenuRoot>
              <ContextMenuTrigger>
                <Popover>
                  <PopoverTrigger asChild>
                    <TouchableOpacity
                      onPress={() => handleTap(word, index)}
                      onLongPress={() => handleLongPress(word, index)}
                      delayLongPress={150}
                    >
                      <View className='h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4'>
                        <Text className='text-lg text-gray-700'>{word}</Text>
                      </View>
                    </TouchableOpacity>
                  </PopoverTrigger>
                  <PopoverContent side='bottom' avoidCollisions={true} className='rounded-lg p-4'>
                    <View className='w-full gap-2'>
                      <View className='h-8 w-full items-center justify-center'>
                        {translation ? (
                          <Text className='text-center text-base text-gray-800'>{translation}</Text>
                        ) : (
                          <Text className='text-center text-base text-gray-400'>
                            {isTranslating ? t`Translating...` : t`Loading...`}
                          </Text>
                        )}
                      </View>
                      <View className='h-[1px] w-full bg-gray-200' />
                      <View className='w-full flex-row items-center justify-between'>
                        <View className='flex-row items-center gap-2'>
                          <PlayExpectedWordButton audioIndividualWord={audioIndividualWord} />
                          <Text className='text-sm text-gray-700'>{t`Your better pronunciation`}</Text>
                        </View>

                        <DownloadButton audioUri={audioIndividualWord} fileName={`word--${selectedWord || 'word'}`} />
                      </View>
                    </View>
                  </PopoverContent>
                </Popover>
              </ContextMenuTrigger>

              <ContextMenuContent className='rounded-xl bg-white p-2 shadow-md'>
                <ContextMenuItem key='copy-word' onSelect={handleCopyWord}>
                  <ContextMenuItemIcon ios={{ name: 'doc.on.doc' }} />
                  <ContextMenuItemTitle>{t`Copy Word`}</ContextMenuItemTitle>
                </ContextMenuItem>
                <ContextMenuItem key='copy-translation' onSelect={handleCopyTranslation}>
                  <ContextMenuItemIcon ios={{ name: 'doc.on.doc' }} />
                  <ContextMenuItemTitle>{t`Copy Translation`}</ContextMenuItemTitle>
                </ContextMenuItem>
                <ContextMenuSeparator className='my-1 h-[1px] bg-gray-200' />
                <ContextMenuItem key='save' onSelect={handleToggleSavedStatus}>
                  <ContextMenuItemIcon ios={{ name: isSaved ? 'bookmark.fill' : 'bookmark' }} />
                  <ContextMenuItemTitle>{isSaved ? t`Unsave Word` : t`Save Word`}</ContextMenuItemTitle>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenuRoot>
          </View>
        ))}
      </View>
    </View>
  )
}
