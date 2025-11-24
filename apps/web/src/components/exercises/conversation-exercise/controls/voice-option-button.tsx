import { useMemo } from 'react'
import { TutorAvatar } from '../atoms/tutor-avatar.tsx'
import { Button } from '../../../design-system/button.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import {
  CustomVoice,
  VOICE_OF_THE_USER,
  VoiceOption,
} from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { useLingui } from '@lingui/react/macro'

export const VoiceOptionButton = ({
  isSelected,
  voiceOption,
  handleClick,
}: {
  isSelected: boolean
  voiceOption: VoiceOption
  handleClick: (voiceOption: VoiceOption) => void
}) => {
  const { t } = useLingui()

  const VOICE_DESCRIPTIONS: Record<VoiceOption, string> = useMemo(
    () => ({
      [CustomVoice.NAMI]: t`Warm, friendly voice. Clear pronunciation and natural rhythm.`,
      [CustomVoice.WELA]: t`Confident, nurturing voice. Professional and articulate.`,
      [CustomVoice.SIME]: t`Energetic voice with engaging delivery. Easy to follow and relatable.`,
      [CustomVoice.LATU]: t`Voice with a calm, authoritative manner. Patient and well-paced.`,
      [VOICE_OF_THE_USER]: t`Practice with your own voice (recommended for best results)`,
    }),
    [t]
  )

  return (
    <Button
      key={voiceOption}
      onClick={() => handleClick(voiceOption)}
      className={cn(
        'h-18 flex w-full items-center gap-2 rounded-xl border p-2 px-4 shadow-sm transition-all md:h-24 md:w-1/2',
        isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'
      )}
    >
      <div className='flex h-14 w-14 items-center justify-center md:h-20 md:w-20'>
        {voiceOption === VOICE_OF_THE_USER ? (
          <span className='text-base md:text-xl'>{t`My Voice`}</span>
        ) : (
          <TutorAvatar tutorCode={voiceOption} />
        )}
      </div>
      <span className={cn('flex-1 text-sm md:text-base')}>
        {voiceOption === VOICE_OF_THE_USER ? (
          <>{VOICE_DESCRIPTIONS[voiceOption]}</>
        ) : (
          <>
            {voiceOption}: {VOICE_DESCRIPTIONS[voiceOption]}
          </>
        )}
      </span>
    </Button>
  )
}
