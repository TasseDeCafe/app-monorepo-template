import { PersonalitySelectorButton } from './personality-selector-button'
import { VoiceSelectorButton } from './voice-selector-button.tsx'

export const ConversationExerciseControls = () => {
  return (
    <div className='flex w-full flex-row justify-center gap-x-2 pb-2 pt-0 md:gap-x-4'>
      <PersonalitySelectorButton />
      <VoiceSelectorButton />
    </div>
  )
}
