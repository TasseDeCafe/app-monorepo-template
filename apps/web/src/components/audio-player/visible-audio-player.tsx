import { AudioPlayerControls } from './components/audio-player-controls.tsx'
import { Slider } from '../shadcn/slider.tsx'
import { useMediaQuery } from 'usehooks-ts'
import { VisibleAudioPlayerProps } from './audio-player-types.ts'
import { useAudioPlayer } from './hooks/use-audio-player.ts'

export const VisibleAudioPlayer = ({
  title,
  audioSource,
  sourceType,
  playerType,
  playbackRate,
  fileName,
  onPlayRequest,
  onDownloadRequest,
  className = '',
  audioSpeedType,
  ref,
}: VisibleAudioPlayerProps) => {
  const isSmOrLarger = useMediaQuery('(min-width: 640px)')

  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    isMuted,
    setIsMuted,
    audioUrl,
    currentPlaybackRate,
    setCurrentPlaybackRate,
    togglePlay,
    handleDownload,
    handleSliderChange,
    calculateSliderValue,
  } = useAudioPlayer({
    audioSource,
    sourceType,
    playerType,
    playbackRate,
    fileName,
    onPlayRequest,
    onDownloadRequest,
    ref,
  })

  if (!audioUrl) {
    return null
  }

  return (
    <div className={`flex w-full flex-col gap-2 rounded-lg px-2 py-2 md:px-4 md:py-4 ${className}`}>
      {/* Preload metadata is necessary *on iOS Safari* to set the currentTime if the audio hasn't loaded metadata yet.
      See GRAM-1070/fix/dragging-before-playing-a-player-breaks-it-forever */}
      {/* Use "playsInline" in iOS Safari to prevent fullscreen playback, ensuring media stays inline with custom controls and UI.*/}
      <audio ref={audioRef} src={audioUrl || undefined} preload='metadata' playsInline />

      <Slider
        value={[calculateSliderValue(currentTime, duration)]}
        max={100}
        step={1}
        onValueChange={handleSliderChange}
        className='w-full [&_[role=slider]]:border-indigo-300 [&_[role=slider]]:bg-white'
      />

      <AudioPlayerControls
        title={title}
        isSmOrLarger={isSmOrLarger}
        togglePlay={togglePlay}
        isPlaying={isPlaying}
        audioRef={audioRef}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        currentTime={currentTime}
        duration={duration}
        playbackRate={currentPlaybackRate}
        audioSpeedType={audioSpeedType}
        handleDownload={handleDownload}
        fileName={fileName}
        onSpeedChange={setCurrentPlaybackRate}
      />
    </div>
  )
}
