import namiAvatarUrl from '../../../../assets/images/tutors/nami.png'
import welaAvatarUrl from '../../../../assets/images/tutors/wela.png'
import simiAvatarUrl from '../../../../assets/images/tutors/sime.png'
import latuAvatarUrl from '../../../../assets/images/tutors/latu.png'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { useState } from 'react'
import {
  CustomVoice,
  VOICE_OF_THE_USER,
  VoiceOption,
} from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract.ts'

const TUTOR_CODE_TO_AVATAR_MAP: Record<VoiceOption, { url: string }> = {
  [CustomVoice.NAMI]: {
    url: namiAvatarUrl,
  },
  [CustomVoice.WELA]: {
    url: welaAvatarUrl,
  },
  [CustomVoice.SIME]: {
    url: simiAvatarUrl,
  },
  [CustomVoice.LATU]: {
    url: latuAvatarUrl,
  },
  [VOICE_OF_THE_USER]: {
    url: '',
  },
}

type tutorAvatarProps = {
  tutorCode: VoiceOption
}

export const TutorAvatar = ({ tutorCode }: tutorAvatarProps) => {
  const avatarInfo = TUTOR_CODE_TO_AVATAR_MAP[tutorCode]

  const [imageLoaded, setImageLoaded] = useState(false)
  const [hadError, setHadError] = useState(false)

  return (
    <div className='relative flex max-h-full max-w-full flex-col items-center justify-center rounded-xl drop-shadow-sm'>
      {!hadError && (
        <img
          src={avatarInfo.url}
          alt={tutorCode}
          className={cn(`z-10 h-full w-full rounded-xl object-cover transition-opacity duration-300`, {
            hidden: !imageLoaded,
          })}
          onLoad={() => setImageLoaded(true)}
          onError={() => setHadError(true)}
        />
      )}
      {(!imageLoaded || hadError) && (
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-bl from-indigo-500 to-indigo-600 font-medium text-white'>
          {tutorCode}
        </div>
      )}
    </div>
  )
}
