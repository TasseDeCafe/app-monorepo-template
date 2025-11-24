import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/popover'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../../shadcn/drawer'
import { useMediaQuery } from 'usehooks-ts'
import { useCallback, useState } from 'react'
import { X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { conversationExerciseActions, selectVoiceOption } from '../../../../state/slices/conversation-exercise-slice'
import { TutorAvatar } from '../atoms/tutor-avatar.tsx'
import { VoiceOptionButton } from './voice-option-button.tsx'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  CustomVoice,
  VOICE_OF_THE_USER,
  VoiceOption,
} from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { useLingui } from '@lingui/react/macro'

const FEMALE_VOICES = [CustomVoice.NAMI, CustomVoice.WELA] as const
const MALE_VOICES = [CustomVoice.SIME, CustomVoice.LATU] as const

const TutorTriggerContent = ({ selectedTutor }: { selectedTutor: VoiceOption }) => {
  const { t } = useLingui()

  return (
    <div className='flex items-center gap-2 rounded-lg px-3 py-2 text-lg font-semibold text-slate-800 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white md:gap-2.5'>
      {selectedTutor !== VOICE_OF_THE_USER && (
        <div className='h-10 w-10'>
          <TutorAvatar tutorCode={selectedTutor} />
        </div>
      )}
      <span className='hidden text-lg sm:flex'>
        {selectedTutor === VOICE_OF_THE_USER ? t`My Voice` : selectedTutor}
      </span>
      <span className='flex text-sm sm:hidden'>
        {selectedTutor === VOICE_OF_THE_USER ? t`My Voice` : selectedTutor}
      </span>
    </div>
  )
}

export const VoiceSelectorButton = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const isMdOrLarger = useMediaQuery('(min-width: 768px)')
  const [isOpen, setIsOpen] = useState(false)
  const selectedVoiceOption = useSelector(selectVoiceOption)

  const handleVoiceOptionChange = useCallback(
    (tutorCode: VoiceOption) => {
      dispatch(conversationExerciseActions.setTutor(tutorCode))
    },
    [dispatch]
  )

  const TutorSelector = () => (
    <div className='flex w-full flex-col gap-y-1 md:gap-y-2'>
      <div className='flex flex-col gap-1 md:flex-row md:gap-2'>
        {FEMALE_VOICES.map((tutorCode) => (
          <VoiceOptionButton
            key={tutorCode}
            isSelected={selectedVoiceOption === tutorCode}
            voiceOption={tutorCode}
            handleClick={handleVoiceOptionChange}
          />
        ))}
      </div>

      <div className='flex flex-col gap-2 md:flex-row'>
        {MALE_VOICES.map((tutorCode) => (
          <VoiceOptionButton
            key={tutorCode}
            isSelected={selectedVoiceOption === tutorCode}
            voiceOption={tutorCode}
            handleClick={handleVoiceOptionChange}
          />
        ))}
      </div>

      {/* My Voice Row */}
      <div className='flex flex-col gap-2'>
        <div className='flex justify-center'>
          <VoiceOptionButton
            isSelected={selectedVoiceOption === VOICE_OF_THE_USER}
            voiceOption={VOICE_OF_THE_USER}
            handleClick={handleVoiceOptionChange}
          />
        </div>
      </div>
    </div>
  )

  if (isMdOrLarger) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <TutorTriggerContent selectedTutor={selectedVoiceOption} />
        </PopoverTrigger>
        <PopoverContent className='w-[768px] p-2' align='center'>
          <div className='relative'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute right-4 top-4 text-gray-400 hover:text-gray-600'
            >
              <X className='h-5 w-5' />
            </button>
            <h2 className='pb-1 pt-4 text-center text-lg font-semibold'>{t`Choose Voice`}</h2>
          </div>
          <TutorSelector />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} autoFocus={true}>
      <DrawerTrigger>
        <TutorTriggerContent selectedTutor={selectedVoiceOption} />
      </DrawerTrigger>
      <DrawerContent className='bg-white p-1 pb-10'>
        <div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' />
        <DrawerHeader>
          <DrawerTitle className='flex w-full justify-between'>
            {t`Choose Voice`}
            <button onClick={() => setIsOpen(false)} className='text-gray-400 hover:text-gray-600'>
              <X className='h-5 w-5' />
            </button>
          </DrawerTitle>
          {/* Add hidden description for accessibility and to prevent "Missing Description" warning */}
          <VisuallyHidden>
            <DrawerDescription>{t`Choose Voice`}</DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>
        <TutorSelector />
      </DrawerContent>
    </Drawer>
  )
}
