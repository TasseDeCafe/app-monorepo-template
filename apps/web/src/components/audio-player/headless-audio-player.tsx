import { HeadlessAudioPlayerProps } from './audio-player-types.ts'
import { useAudioPlayer } from './hooks/use-audio-player.ts'

export const HeadlessAudioPlayer = ({
  audioSource,
  sourceType,
  playerType,
  playbackRate,
  fileName,
  onPlayRequest,
  onDownloadRequest,
  ref,
}: HeadlessAudioPlayerProps) => {
  const { audioRef, audioUrl } = useAudioPlayer({
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

  return <audio ref={audioRef} src={audioUrl || undefined} preload='metadata' playsInline />
}
