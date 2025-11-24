import { VisibleAudioPlayer } from '../../../../audio-player/visible-audio-player.tsx'
import { PronunciationComparisonProps } from './types.ts'
import { Skeleton } from '../../../../shadcn/skeleton.tsx'
import { createFilename } from '../../../../audio-player/audio-player-utils.ts'

import { PLAYER_TYPE } from '../../../../audio-player/audio-player-types.ts'
import { RecordingsList } from '../atoms/recordings-list.tsx'
import {
  useAudioSpeedOfClonePronunciation,
  useAudioSpeedOfUserPronunciation,
} from '@/hooks/api/user-settings/user-settings-hooks'
import { useLingui } from '@lingui/react/macro'

export const PronunciationComparison = ({
  generatedAudio,
  generatedAudioPlayerRef,
  recordings,
  text,
}: PronunciationComparisonProps) => {
  const { t } = useLingui()

  const userPronunciationAudioSpeed = useAudioSpeedOfUserPronunciation()
  const clonePronunciationAudioSpeed = useAudioSpeedOfClonePronunciation()

  return (
    <div className='flex w-full flex-col items-center gap-5 md:gap-2 xl:gap-12'>
      <RecordingsList recordings={recordings} text={text} playbackRate={userPronunciationAudioSpeed} />
      {generatedAudio ? (
        <VisibleAudioPlayer
          className='w-full max-w-5xl'
          playerType={PLAYER_TYPE.USER_CLONED_PRONUNCIATION}
          title={t`Your better pronunciation`}
          audioSource={generatedAudio}
          sourceType='base64'
          fileName={createFilename('your-better-pronunciation', text)}
          audioSpeedType='clonePronunciation'
          playbackRate={clonePronunciationAudioSpeed}
          ref={generatedAudioPlayerRef}
        />
      ) : (
        <div className='flex w-full max-w-5xl flex-col justify-center gap-y-2'>
          <Skeleton className='h-4 w-full' />
          <div className='flex w-full flex-row justify-between'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-4 w-20' />
          </div>
        </div>
      )}
    </div>
  )
}
