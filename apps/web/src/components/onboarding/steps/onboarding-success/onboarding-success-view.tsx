import { Button } from '../../../design-system/button.tsx'
import { useDispatch, useSelector } from 'react-redux'
import {
  accountActions,
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectHasVoice,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { VisibleAudioPlayer } from '../../../audio-player/visible-audio-player.tsx'

import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { Skeleton } from '../../../shadcn/skeleton.tsx'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'

import { createFilename } from '../../../audio-player/audio-player-utils.ts'
import { PLAYER_TYPE } from '../../../audio-player/audio-player-types.ts'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { GetGenerateAudioData } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract.ts'
import {
  ONBOARDING_SUCCESS_DEMO_DATA_OBJECTS,
  OnboardingSuccessDemoDataObjects,
} from '@yourbestaccent/core/constants/onboarding-success-demo-data-objects'
import { useAudioSpeedOfClonePronunciation } from '@/hooks/api/user-settings/user-settings-hooks'
import { useGeneratedAudioText } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { useLingui } from '@lingui/react/macro'

type DemoCardProps = {
  demoData: OnboardingSuccessDemoDataObjects
  audioData: GetGenerateAudioData | undefined
  isGeneratingAudio: boolean
}

const DemoCard = ({ demoData, audioData, isGeneratingAudio }: DemoCardProps) => {
  const { t } = useLingui()

  const clonePronunciationAudioSpeed = useAudioSpeedOfClonePronunciation()

  return (
    <div className='flex h-full max-w-screen-md flex-col items-center rounded-lg bg-white p-4 shadow-md md:p-8 md:px-16'>
      <div className='flex w-full flex-col items-center md:mb-6'>
        <h3 className='mb-1 text-xl font-semibold'>{t`Your Voice Clone`}</h3>
        <p className='text-md mb-3 text-gray-600'>{t`In your target language`}</p>
        <p className='mb-4 text-lg italic text-gray-600'>"{demoData.text}"</p>
        <p className='text-md mb-4 text-gray-500'>- {demoData.author}</p>
      </div>
      {isGeneratingAudio ? (
        <div className='flex w-full flex-col justify-center gap-y-2'>
          <Skeleton className='h-4 w-full' />
          <div className='flex w-full flex-row justify-between'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-52' />
          </div>
        </div>
      ) : (
        <VisibleAudioPlayer
          playerType={PLAYER_TYPE.USER_CLONED_VOICE_DEMO_ON_ONBOARDING}
          audioSource={audioData?.audio ?? null}
          sourceType='base64'
          fileName={createFilename('your-better-pronunciation', demoData.text)}
          playbackRate={clonePronunciationAudioSpeed}
          audioSpeedType='clonePronunciation'
        />
      )}
    </div>
  )
}

export const OnboardingSuccessView = () => {
  const { t } = useLingui()

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const hasVoice: boolean = useSelector(selectHasVoice)

  const demoData = ONBOARDING_SUCCESS_DEMO_DATA_OBJECTS[studyLanguage]

  const { data: audioData, isFetching: isGeneratingAudio1 } = useGeneratedAudioText(
    demoData.text,
    studyLanguage,
    dialect,
    hasVoice
  )

  const handleStartPracticing = () => {
    dispatch(accountActions.setHasJustClonedVoice(false))
    navigate(ROUTE_PATHS.DASHBOARD)
  }

  return (
    <WithNavbar>
      <div className='flex h-full w-full flex-col items-center space-y-6 px-4 py-4 text-center transition-all md:py-8'>
        <div className='mb-52 flex flex-grow flex-col items-center'>
          <h1 className='max-w-md text-4xl font-bold leading-tight'>{t`Successfully Cloned`}</h1>
          <p className='mb-6 max-w-md text-lg text-gray-500'>{t`Get familiar with your new voice clone, from now on you can practice with it!`}</p>
          <div
            className={cn(
              'duration-2000 flex w-full justify-center gap-8 ease-in-out animate-in md:grid-cols-2 lg:grid-cols-3',
              'fade-in-0 slide-in-from-bottom-8'
            )}
          >
            <DemoCard demoData={demoData} audioData={audioData} isGeneratingAudio={isGeneratingAudio1} />
          </div>
        </div>

        <div className='fixed bottom-0 w-full bg-gray-50'>
          <div className='pointer-events-none absolute bottom-full left-0 right-0 h-40 bg-gradient-to-b from-transparent to-gray-50' />
          <div className='lg:w-2/2 mx-auto flex w-full px-4 pb-8 pt-4 md:w-3/4 3xl:w-1/3'>
            <Button
              onClick={handleStartPracticing}
              className='w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
            >
              {t`Start Practicing`}
            </Button>
          </div>
        </div>
      </div>
    </WithNavbar>
  )
}
