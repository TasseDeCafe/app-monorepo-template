import { Copy, Download, FileText, Globe, Languages, Loader2, MoreVertical } from 'lucide-react'
import { LanguageWithTransliteration } from '@yourbestaccent/core/constants/lang-codes'
import { toast } from 'sonner'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys.ts'
import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry.ts'
import { AudioPlayerInstance, PLAYER_TYPE } from '../../audio-player/audio-player-types'
import { HeadlessAudioPlayer } from '../../audio-player/headless-audio-player'
import { MessageActionButton } from './message-action-button'
import { PlayMessageButton } from './play-message-button'
import { DropdownMenu, DropdownMenuTrigger } from '../../shadcn/dropdown.tsx'
import { MessageDropdown } from './atoms/message-dropdown.tsx'
import { NonDeletedBotMessage } from '@yourbestaccent/api-client/orpc-contracts/messages-contract.ts'
import { GetGenerateAudioData } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract.ts'
import { selectVoiceOption } from '@/state/slices/conversation-exercise-slice.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { base64ToBlob } from '../../audio-player/audio-player-utils.ts'
import { isLanguageWithTransliteration } from '@yourbestaccent/core/utils/lang-codes-utils'
import { useConvertAudioToMp3 } from '@/hooks/api/audio/audio-hooks'
import { useGenerateIpaForBotMessage } from '@/hooks/api/ipa-transcription/ipa-transcription-hooks'
import { useTransliterateBotMessage } from '@/hooks/api/transliteration/transliteration-hooks'
import { useGenerateAudioForBotMessage } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { useTranslateBotMessage } from '@/hooks/api/translation/translation-hooks'
import { useLingui } from '@lingui/react/macro'

interface MessageActionsProps {
  botMessage: NonDeletedBotMessage
}

export const BotMessageActions = ({ botMessage }: MessageActionsProps) => {
  const { t } = useLingui()

  const audioPlayerRef = useRef<AudioPlayerInstance>(null)
  const messageLanguage = botMessage.language
  const showTransliteration = messageLanguage && isLanguageWithTransliteration(messageLanguage)
  const [isPlaying, setIsPlaying] = useState(false)

  const dialect = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const motherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const voiceOption = useSelector(selectVoiceOption)

  const text: string = botMessage.content
  const translationKey = [QUERY_KEYS.TRANSLATE_TEXT, text, motherLanguage, dialect]
  const ipaTranscriptionKey = [QUERY_KEYS.IPA_TRANSCRIPTION, text, messageLanguage, dialect]
  const transliterationKey = [QUERY_KEYS.TRANSLITERATION, text, messageLanguage]
  const audioGenerationKey: string[] = [QUERY_KEYS.AUDIO_WITH_ALIGNMENT, text, messageLanguage, dialect, voiceOption]

  const queryClient: QueryClient = useQueryClient()
  const translation: string | undefined = queryClient.getQueryData<string>(translationKey)
  const ipaTranscription: string[] | undefined = queryClient.getQueryData<string[]>(ipaTranscriptionKey)
  const transliteration: string | undefined = queryClient.getQueryData<string>(transliterationKey)
  const getGenerateAudioData: GetGenerateAudioData | undefined = queryClient.getQueryData(audioGenerationKey)

  const { mutate: translate, isPending: isTranslating } = useTranslateBotMessage(
    text,
    messageLanguage,
    motherLanguage,
    translationKey,
    studyLanguage
  )

  const { mutate: generateIpa, isPending: isGeneratingIpa } = useGenerateIpaForBotMessage(
    ipaTranscriptionKey,
    studyLanguage
  )

  const { mutate: transliterate, isPending: isTransliterating } = useTransliterateBotMessage(
    text,
    messageLanguage as LanguageWithTransliteration,
    transliterationKey,
    studyLanguage
  )

  const convertAudioMutation = useConvertAudioToMp3()

  const playGeneratedText = () => {
    if (!audioPlayerRef.current) {
      return
    }

    try {
      setIsPlaying(true)
      audioPlayerRef.current.play().then(() => {
        const duration = audioPlayerRef.current?.getDuration() || 0
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

  const { mutate: generateAudio, isPending: isGeneratingAudio } = useGenerateAudioForBotMessage(
    audioGenerationKey,
    studyLanguage,
    playGeneratedText
  )

  const handlePlay = async () => {
    POSTHOG_EVENTS.click('play_bot_message')
    if (getGenerateAudioData) {
      playGeneratedText()
    } else {
      generateAudio({ text, language: messageLanguage, dialect, voiceOption })
    }
  }

  const handleTranslate = () => {
    POSTHOG_EVENTS.click('translate_bot_message')
    translate()
  }

  const handleIpaTranscription = () => {
    POSTHOG_EVENTS.click('transcribe_ipa_bot_message')
    generateIpa({ text, language: messageLanguage, dialect })
  }

  const handleTransliterate = () => {
    POSTHOG_EVENTS.click('transliterate_bot_message')
    transliterate()
  }

  const handleCopyMessage = async () => {
    POSTHOG_EVENTS.click('copy_message')
    try {
      await navigator.clipboard.writeText(text)
      toast.info(t`Translation copied to clipboard`)
    } catch (err) {
      logWithSentry('Failed to copy translation', err)
    }
  }

  const handleCopyIpa = async () => {
    try {
      if (ipaTranscription) {
        await navigator.clipboard.writeText(ipaTranscription.join(' '))
        toast.info(t`Ipa transcription copied to clipboard`)
      }
    } catch (err) {
      logWithSentry('Failed to copy IPA', err)
    }
  }

  const handleCopyTransliteration = async () => {
    try {
      if (transliteration) {
        await navigator.clipboard.writeText(transliteration)
        toast.info(t`Transliteration copied to clipboard`)
      }
    } catch (err) {
      logWithSentry('Failed to copy transliteration', err)
    }
  }

  const handleDownload = async () => {
    POSTHOG_EVENTS.click('download_generated_text_audio')

    if (getGenerateAudioData?.audio) {
      try {
        const result = await convertAudioMutation.mutateAsync({
          audio: getGenerateAudioData.audio,
          fromFormat: 'mp3', // Assuming the generated audio is in mp3 format
          toFormat: 'mp3',
        })

        const blob = base64ToBlob(result.data.convertedAudio)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `message_audio_${botMessage.id}.${result.data.format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        logWithSentry('Error downloading audio', error)
        toast.error(t`Failed to download audio, try again later`)
      }
    }
  }

  return (
    <>
      {/*{getGenerateAudioData?.audio && (*/}
      <HeadlessAudioPlayer
        playerType={PLAYER_TYPE.MESSAGE_AUDIO}
        audioSource={getGenerateAudioData?.audio || null}
        sourceType='base64'
        ref={audioPlayerRef}
      />
      {/*)}*/}
      {translation && (
        <div
          onClick={handleCopyMessage}
          className='ml-4 mt-1 cursor-pointer text-xs text-gray-500 hover:text-gray-700'
          title={t`Click to copy message`}
        >
          {isTranslating ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='h-3 w-3 animate-spin' />
              <span>{t`Translating...`}</span>
            </div>
          ) : (
            translation
          )}
        </div>
      )}
      {ipaTranscription && (
        <div
          onClick={handleCopyIpa}
          className='ml-4 mt-1 cursor-pointer text-xs text-gray-500 hover:text-gray-700'
          title={t`Click to copy IPA transcription`}
        >
          {isGeneratingIpa ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='h-3 w-3 animate-spin' />
              <span>{t`Generating IPA...`}</span>
            </div>
          ) : (
            ipaTranscription.join(' ')
          )}
        </div>
      )}
      {transliteration && (
        <div
          onClick={handleCopyTransliteration}
          className='ml-4 mt-1 cursor-pointer text-xs text-gray-500 hover:text-gray-700'
          title={t`Click to copy transliteration`}
        >
          {isTransliterating ? (
            <div className='flex items-center gap-2'>
              <Loader2 className='h-3 w-3 animate-spin' />
              <span>{t`Transliterating...`}</span>
            </div>
          ) : (
            transliteration
          )}
        </div>
      )}
      <div className='mt-1 flex flex-row justify-start gap-x-1 md:mt-2 md:gap-x-2'>
        <PlayMessageButton onClick={handlePlay} isLoading={isGeneratingAudio} isPlaying={isPlaying} />
        <MessageActionButton onClick={handleCopyMessage} title={t`Copy message`} Icon={Copy} />
        <MessageActionButton
          onClick={handleTranslate}
          title={translation ? t`Hide translation` : t`Show translation`}
          Icon={Languages}
          isLoading={isTranslating}
        />
        <MessageActionButton
          onClick={handleIpaTranscription}
          title={ipaTranscription ? t`Hide IPA` : t`Show IPA`}
          Icon={FileText}
          isLoading={isGeneratingIpa}
        />
        {showTransliteration && (
          <MessageActionButton
            onClick={handleTransliterate}
            title={transliteration ? t`Hide transliteration` : t`Show transliteration`}
            Icon={Globe}
            isLoading={isTransliterating}
          />
        )}
        <div className={`transition-opacity duration-300 ${getGenerateAudioData ? 'opacity-100' : 'opacity-0'}`}>
          {getGenerateAudioData && (
            <MessageActionButton
              onClick={handleDownload}
              title={t`Download audio`}
              Icon={Download}
              isLoading={convertAudioMutation.isPending}
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex h-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
              <MoreVertical className='h-4 w-4' />
            </button>
          </DropdownMenuTrigger>
          <MessageDropdown messageId={botMessage.id} />
        </DropdownMenu>
      </div>
    </>
  )
}
