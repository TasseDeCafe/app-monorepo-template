import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectHasVoice,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice'
import { DialectCode, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { sanitizeTextForFileName } from './audio-player-utils'
import { useAudioPlayer } from './hooks/use-audio-player'
import { AudioPlayerControls } from './components/audio-player-controls'
import { Slider } from '../shadcn/slider'
import { useMediaQuery } from 'usehooks-ts'
import { PLAYER_TYPE, TranslationAudioPlayerProps } from './audio-player-types'
import { useGeneratedAudioTranslatedSentence } from '@/hooks/api/audio-generation/audio-generation-hooks'

export const TranslationAudioPlayer = ({
  translationText,
  playerType = PLAYER_TYPE.TRANSLATED_SENTENCE,
  playbackRate = 1,
  fileName,
  title,
  className,
  audioSpeedType,
  ref,
}: TranslationAudioPlayerProps) => {
  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const hasVoice: boolean = useSelector(selectHasVoice)
  const isSmOrLarger = useMediaQuery('(min-width: 640px)')

  const [pendingAction, setPendingAction] = useState<'play' | 'download' | null>(null)
  const {
    data: audioData,
    error: audioError,
    isFetching,
  } = useGeneratedAudioTranslatedSentence(translationText, studyLanguage, dialect, hasVoice, pendingAction)

  const audioPlayerHook = useAudioPlayer({
    audioSource: audioData?.audio,
    sourceType: 'base64',
    playerType,
    playbackRate,
    fileName: fileName || sanitizeTextForFileName(translationText),
    ref,
  })

  useEffect(() => {
    if (audioError) {
      setPendingAction(null)
    }
  }, [audioError])

  // Custom toggle play that handles lazy loading
  const handleTogglePlay = () => {
    if (audioData?.audio) {
      audioPlayerHook.togglePlay()
    } else {
      setPendingAction('play')
    }
  }

  // Custom download that handles lazy loading
  const handleDownloadClick = () => {
    if (audioData?.audio) {
      audioPlayerHook.handleDownload().catch(console.error)
    } else {
      setPendingAction('download')
    }
  }

  // Handle auto-play and auto-download after audio is generated
  useEffect(() => {
    if (audioData?.audio && pendingAction) {
      if (pendingAction === 'play') {
        if (!audioPlayerHook.isPlaying) {
          audioPlayerHook.togglePlay()
        }
      } else if (pendingAction === 'download') {
        audioPlayerHook.handleDownload().catch(console.error)
      }
      setPendingAction(null)
    }
  }, [audioData?.audio, pendingAction, audioPlayerHook])

  if (!translationText || !translationText.trim()) {
    return null
  }

  return (
    <div className={`flex w-full flex-col gap-2 rounded-lg px-2 py-2 md:px-4 md:py-4 ${className || ''}`}>
      <audio ref={audioPlayerHook.audioRef} preload='metadata' playsInline />

      <Slider
        value={[audioPlayerHook.calculateSliderValue(audioPlayerHook.currentTime, audioPlayerHook.duration)]}
        max={100}
        step={1}
        onValueChange={audioPlayerHook.handleSliderChange}
        className='w-full [&_[role=slider]]:border-indigo-300 [&_[role=slider]]:bg-white'
      />

      <AudioPlayerControls
        title={title}
        isSmOrLarger={isSmOrLarger}
        togglePlay={handleTogglePlay}
        isPlaying={audioPlayerHook.isPlaying}
        audioRef={audioPlayerHook.audioRef}
        isMuted={audioPlayerHook.isMuted}
        setIsMuted={audioPlayerHook.setIsMuted}
        currentTime={audioPlayerHook.currentTime}
        duration={audioPlayerHook.duration}
        playbackRate={audioPlayerHook.currentPlaybackRate}
        audioSpeedType={audioSpeedType}
        handleDownload={handleDownloadClick}
        fileName={fileName || sanitizeTextForFileName(translationText)}
        onSpeedChange={audioPlayerHook.setCurrentPlaybackRate}
        isPlayLoading={isFetching && pendingAction === 'play'}
        isDownloadLoading={isFetching && pendingAction === 'download'}
      />
    </div>
  )
}
