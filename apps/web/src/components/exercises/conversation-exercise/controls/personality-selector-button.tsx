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
import { useState } from 'react'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { X } from 'lucide-react'
import { Button } from '../../../design-system/button'
import { useDispatch, useSelector } from 'react-redux'
import { conversationExerciseActions, selectPersonality } from '@/state/slices/conversation-exercise-slice'
import { personalityMessages } from '@yourbestaccent/i18n/personality-translation-utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useLingui } from '@lingui/react/macro'

const PERSONALITY_TO_EMOJI_MAP: Record<PersonalityCode, string> = {
  [PersonalityCode.FRIENDLY]: '😊',
  [PersonalityCode.PROFESSIONAL]: '👔',
  [PersonalityCode.HUMOROUS]: '😄',
  [PersonalityCode.STRICT]: '🧐',
  [PersonalityCode.ENCOURAGING]: '🌟',
  [PersonalityCode.MISCHIEVOUS]: '😈',
  [PersonalityCode.JOKER]: '🃏',
  [PersonalityCode.ANGRY]: '😠',
  [PersonalityCode.SAD]: '😔',
  [PersonalityCode.CUTE]: '🥺',
  [PersonalityCode.INTROVERT]: '🤐',
  [PersonalityCode.CRAZY]: '😜',
}

const PersonalityTriggerContent = ({ selectedPersonality }: { selectedPersonality: PersonalityCode | null }) => {
  const { t, i18n } = useLingui()

  if (!selectedPersonality) {
    return (
      <div className='rounded-xl border px-2 py-1 text-base font-semibold text-slate-800 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white'>
        <span className='hidden text-lg md:flex'>{t`Select Personality`}</span>
        <span className='flex text-sm md:hidden'>{t`Select Personality`}</span>
      </div>
    )
  }

  const personalityName = i18n._(personalityMessages[selectedPersonality])

  return (
    <div className='flex items-center gap-1 rounded-xl px-2 py-1 text-lg font-semibold text-slate-800 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white md:gap-1.5'>
      <span className='text-xl'>{PERSONALITY_TO_EMOJI_MAP[selectedPersonality]}</span>
      <span className='hidden text-lg sm:flex'>{personalityName}</span>
      <span className='flex text-sm sm:hidden'>{personalityName}</span>
    </div>
  )
}

export const PersonalitySelectorButton = () => {
  const { t, i18n } = useLingui()

  const dispatch = useDispatch()
  const isMdOrLarger = useMediaQuery('(min-width: 768px)')
  const [isOpen, setIsOpen] = useState(false)
  const personality: PersonalityCode | null = useSelector(selectPersonality)
  const [temporaryPersonality, setTemporaryPersonality] = useState<PersonalityCode | null>(personality)

  const handlePersonalityChange = (personality: PersonalityCode | null) => {
    setTemporaryPersonality(temporaryPersonality === personality ? null : personality)
    dispatch(conversationExerciseActions.setPersonality(temporaryPersonality === personality ? null : personality))
  }

  const PersonalitySelector = () => (
    <div className='flex w-full flex-col gap-y-6 p-2'>
      <div className='flex flex-wrap gap-2'>
        {Object.values(PersonalityCode).map((personality: PersonalityCode) => (
          <Button
            key={personality}
            onClick={() => handlePersonalityChange(personality)}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-xl border px-3 shadow-sm transition-all sm:h-10 sm:gap-2 sm:px-4',
              'text-sm sm:text-lg',
              temporaryPersonality === personality
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-100'
            )}
          >
            <span className='text-lg'>{PERSONALITY_TO_EMOJI_MAP[personality]}</span>
            <span>{i18n._(personalityMessages[personality])}</span>
          </Button>
        ))}
      </div>
      <div className='flex w-full flex-row gap-x-2'>
        <button
          onClick={() => handlePersonalityChange(null)}
          className='flex items-center gap-1.5 rounded-xl px-4 py-1 text-sm text-gray-500 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-200'
          disabled={!temporaryPersonality}
        >
          {t`Clear Personality`}
        </button>
      </div>
    </div>
  )

  if (isMdOrLarger) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <PersonalityTriggerContent selectedPersonality={personality} />
        </PopoverTrigger>
        <PopoverContent className='p-0 sm:w-96' align='center'>
          <div className='relative'>
            <button
              onClick={() => setIsOpen(false)}
              className='absolute right-2 top-2 text-gray-400 hover:text-gray-600'
            >
              <X className='h-5 w-5' />
            </button>
            <h2 className='pb-1 pt-4 text-center text-lg font-semibold'>{t`Choose Tutor Personality`}</h2>
          </div>
          <PersonalitySelector />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} autoFocus={true}>
      <DrawerTrigger>
        <PersonalityTriggerContent selectedPersonality={personality} />
      </DrawerTrigger>
      <DrawerContent className='bg-white pb-10'>
        <div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' />
        <DrawerHeader>
          <DrawerTitle className='flex w-full justify-between'>
            {t`Choose Tutor Personality`}
            <button onClick={() => setIsOpen(false)} className='text-gray-400 hover:text-gray-600'>
              <X className='h-5 w-5' />
            </button>
          </DrawerTitle>
          {/* Add hidden description for accessibility and to prevent "Missing Description" warning */}
          <VisuallyHidden>
            <DrawerDescription>{t`Choose Tutor Personality`}</DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>
        <PersonalitySelector />
      </DrawerContent>
    </Drawer>
  )
}
