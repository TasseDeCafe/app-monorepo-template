import { Button } from '../../../shadcn/button.tsx'
import { Slider } from '../../../shadcn/slider.tsx'
import cloneDeep from 'lodash.clonedeep'
import { useSelector } from 'react-redux'
import { selectAccountAccessToken } from '@/state/slices/account-slice'
import { useState } from 'react'

import { AudioSpeedType } from '../../audio-player-types.ts'
import { UserSettings } from '@template-app/api-client/orpc-contracts/user-settings-contract.ts'
import { useUpdateAudioSpeedMutation, useUserSettings } from '@/hooks/api/user-settings/user-settings-hooks'
import { MAX_AUDIO_SPEED, MIN_AUDIO_SPEED } from '@template-app/api-client/orpc-contracts/user-settings-contract'

type SpeedControlProps = {
  currentSpeed: number
  onSpeedChange: (speed: number) => void
}

type SpeedSettingsContentProps = {
  audioSpeedType?: AudioSpeedType
  currentSpeed: number
  onSpeedChange: (speed: number) => void
}

const SpeedSlider = ({ currentSpeed, onSpeedChange }: SpeedControlProps) => {
  const [localSpeed, setLocalSpeed] = useState(currentSpeed)

  const speedToPercentage = (speed: number) => {
    return ((speed - MIN_AUDIO_SPEED) / (MAX_AUDIO_SPEED - MIN_AUDIO_SPEED)) * 100
  }

  const percentageToSpeed = (percentage: number) => {
    const rawSpeed = (percentage / 100) * (MAX_AUDIO_SPEED - MIN_AUDIO_SPEED) + MIN_AUDIO_SPEED
    const step = 0.05
    return Math.round(rawSpeed / step) * step
  }

  return (
    <div className='relative pb-4 pt-8'>
      <div className='absolute left-1/2 top-0 -translate-x-1/2 transform'>
        <div className='text-sm font-medium text-stone-900'>{localSpeed.toFixed(2)}x</div>
      </div>

      <Slider
        value={[speedToPercentage(localSpeed)]}
        min={0}
        max={100}
        step={5}
        onValueChange={(values) => {
          setLocalSpeed(percentageToSpeed(values[0]))
        }}
        onValueCommit={(values) => {
          const committedSpeed = percentageToSpeed(values[0])
          setLocalSpeed(committedSpeed)
          onSpeedChange(committedSpeed)
        }}
      />
    </div>
  )
}

export const SpeedSettingsContent = ({ audioSpeedType, currentSpeed, onSpeedChange }: SpeedSettingsContentProps) => {
  const accessToken = useSelector(selectAccountAccessToken)
  const { data: userSettings } = useUserSettings()
  const { mutate } = useUpdateAudioSpeedMutation()

  const handleSpeedChange = (speed: number) => {
    onSpeedChange(speed)
    if (accessToken && audioSpeedType && userSettings) {
      const updatedSettings: UserSettings = cloneDeep(userSettings)
      updatedSettings.preferences.exercises.audioSpeed[audioSpeedType] = speed
      mutate(updatedSettings)
    }
  }

  const speeds = [0.8, 0.85, 0.9, 0.95, 1]

  return (
    <div className='flex flex-col gap-6'>
      <SpeedSlider
        key={`speed-slider-${audioSpeedType ?? 'userPronunciation'}-${currentSpeed.toFixed(2)}`}
        currentSpeed={currentSpeed}
        onSpeedChange={handleSpeedChange}
      />

      <div className='flex justify-center gap-4'>
        {speeds.map((speed) => {
          const isSelected = Math.abs(speed - currentSpeed) < 0.001
          return (
            <Button
              key={speed}
              className={`h-10 w-10 rounded-full ${
                isSelected
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600 active:bg-indigo-700'
                  : 'bg-gray-200 text-stone-900 hover:bg-gray-300 hover:text-white active:bg-gray-400 active:text-white'
              }`}
              variant='ghost'
              onClick={() => handleSpeedChange(speed)}
            >
              <span className='flex h-10 w-10 items-center justify-center'>{speed}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
