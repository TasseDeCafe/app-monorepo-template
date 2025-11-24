import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/popover.tsx'
import { useSelector } from 'react-redux'
import { selectHasVoice, selectMotherLanguageOrEnglish } from '../../../../state/slices/account-slice.ts'
import { PlayMessageButton } from '../play-message-button.tsx'
import { useRef, useState } from 'react'
import { AudioPlayerInstance, PLAYER_TYPE } from '../../../audio-player/audio-player-types.ts'
import { HeadlessAudioPlayer } from '../../../audio-player/headless-audio-player.tsx'
import { logWithSentry } from '../../../../analytics/sentry/log-with-sentry.ts'
import { Separator } from '../../../design-system/separator.tsx'
import { CopyableTranslation } from '@/components/exercises/pronunciation-evaluation-exercise/atoms/copyable-translation.tsx'
import { selectVoiceOption } from '../../../../state/slices/conversation-exercise-slice.ts'
import { DEFAULT_DIALECTS, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes.ts'
import { Download } from 'lucide-react'
import { handleDownload, sanitizeTextForFileName } from '../../../audio-player/audio-player-utils.ts'
import { POSTHOG_EVENTS } from '../../../../analytics/posthog/posthog-events.ts'
import { toast } from 'sonner'
import { Button } from '../../../design-system/button.tsx'
import { useConversationWordTranslation } from '@/hooks/api/translation/translation-hooks'
import { useGeneratedAudioIndividualWordOnDemand } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { useLingui } from '@lingui/react/macro'

interface ClickableWordProps {
  word: string
  contextWords: string[]
  wordIndex: number
  messageLanguage: SupportedStudyLanguage
}

export const ClickableBotMessageWord = ({ word, contextWords, wordIndex, messageLanguage }: ClickableWordProps) => {
  const { t } = useLingui()

  const [isPlaying, setIsPlaying] = useState(false)
  const [hasClickedOnWord, setShouldFetchAudio] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const audioPlayerRef = useRef<AudioPlayerInstance>(null)

  const messageDialect = DEFAULT_DIALECTS[messageLanguage] // todo: think if the message should store dialect too
  const motherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const voiceOption = useSelector(selectVoiceOption)
  const hasVoice = useSelector(selectHasVoice)

  const { data: translateWordData } = useConversationWordTranslation(
    word,
    messageDialect,
    motherLanguage,
    contextWords,
    wordIndex,
    isOpen
  )

  const {
    data: audioData,
    isFetching: isGeneratingAudio,
    refetch: refetchAudio,
  } = useGeneratedAudioIndividualWordOnDemand(
    word,
    messageLanguage,
    messageDialect,
    hasVoice,
    hasClickedOnWord,
    voiceOption
  )

  const handlePlay = async () => {
    if (!audioPlayerRef.current || audioData?.audio === null) {
      return
    }

    const duration = audioPlayerRef.current?.getDuration() || 0
    if (duration > 0) {
      try {
        setIsPlaying(true)
        await audioPlayerRef.current.play().then(() => {
          if (duration > 0) {
            setTimeout(() => {
              setIsPlaying(false)
            }, duration * 1000)
          }
        })
      } catch (error) {
        logWithSentry('Error playing audio', error)
        setIsPlaying(false)
      }
    }
  }

  const handleClick = () => {
    setShouldFetchAudio(true)
  }

  const onDownload = async () => {
    POSTHOG_EVENTS.click('download_generated_word_audio')

    if (audioData?.audio) {
      // If we already have the audio, download it immediately
      handleDownload(audioData.audio, `word--${sanitizeTextForFileName(word)}`)
    } else {
      // If we don't have the audio yet, trigger the download and show loading state

      try {
        // Trigger audio generation
        const result = await refetchAudio()

        if (result.data?.audio) {
          // Once we have the audio, download it
          handleDownload(result.data.audio, `word--${sanitizeTextForFileName(word)}`)
        } else {
          toast.error(t`Failed to generate audio, try again later`)
        }
      } catch (error) {
        logWithSentry('Error downloading audio', error)
        toast.error(t`Failed to download audio, try again later`)
      }
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className='inline-block' onClick={handleClick}>
        <span className='cursor-pointer rounded-sm hover:bg-indigo-100 hover:text-gray-600 active:bg-indigo-200'>
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent className='min-w-[19rem] max-w-[24rem] bg-white shadow-lg'>
        <div
          className='flex flex-col items-start gap-2'
          // we need this, because otherwise any underlying tooltip would be opened immediately after opening the popover
          // more here: https://github.com/radix-ui/primitives/issues/2248#issuecomment-2607009642
          onFocusCapture={(e) => {
            e.stopPropagation()
          }}
        >
          <CopyableTranslation translation={translateWordData?.translation} />
          <Separator className='my-2' />
          <div className='flex w-full items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <PlayMessageButton onClick={handlePlay} isLoading={isGeneratingAudio} isPlaying={isPlaying} />
              <span className='whitespace-nowrap text-sm'>{t`Listen to pronunciation`}</span>
            </div>
            <Button
              onClick={onDownload}
              disabled={isGeneratingAudio}
              className='flex h-8 w-8 items-center justify-center rounded-xl border bg-white p-0 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              title={t`Download audio`}
            >
              <Download className='h-4 w-4 md:h-5 md:w-5' />
            </Button>
          </div>
        </div>
      </PopoverContent>
      {audioData?.audio && (
        <HeadlessAudioPlayer
          playerType={PLAYER_TYPE.MESSAGE_WORD_AUDIO}
          audioSource={audioData.audio}
          sourceType='base64'
          ref={audioPlayerRef}
        />
      )}
    </Popover>
  )
}
