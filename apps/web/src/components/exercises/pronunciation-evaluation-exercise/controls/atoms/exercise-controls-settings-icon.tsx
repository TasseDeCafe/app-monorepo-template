import { Settings } from 'lucide-react'

export const ExerciseControlsSettingsIcon = () => {
  return (
    <div className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-700 transition-colors duration-100 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white'>
      <Settings className='h-5' />
    </div>
  )
}
