import { AudioRecorderState, useAudioRecorder } from '@/hooks/audio/use-audio-recorder'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { accountActions, selectHasVoice, selectMotherLanguageOrEnglish } from '@/state/slices/account-slice'
import { modalActions } from '@/state/slices/modal-slice'
import { AUDIO_TOO_SHORT_FOR_CLONING_MODAL_ID } from '../../../modal/modal-ids.ts'
import { USER_FACING_ERROR_CODE } from '../../../modal/modal-contents/something-went-wrong/types'
import { LANG_TO_TEXT_FOR_CLONING } from '@yourbestaccent/core/constants/voice-cloning-constants.ts'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { AudioRecorder } from '../../../audio-recorder/audio-recorder.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { useNavigate } from 'react-router-dom'
import { SquaresLoader } from '../../../loader/squares-loader.tsx'
import { ArrowLeft } from 'lucide-react'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { BigCard } from '../../../design-system/big-card.tsx'
import { usePatchUser } from '@/hooks/api/user/user-hooks'
import { ORPCError } from '@orpc/client'
import { AUDIO_TOO_SHORT_MESSAGE } from '@yourbestaccent/api-client/orpc-contracts/user-contract'
import type { BackendErrorResponse } from '@yourbestaccent/api-client/orpc-contracts/common/error-response-schema'
import { useLingui } from '@lingui/react/macro'

export const CloneVoiceView = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const motherLanguage: LangCode | null = useSelector(selectMotherLanguageOrEnglish)
  const hasVoice: boolean = useSelector(selectHasVoice)
  const navigate = useNavigate()
  const {
    isRecording,
    mostRecentRecording,
    resetAudioRecorder,
    startRecording,
    stopRecording,
    cancelRecording,
  }: AudioRecorderState = useAudioRecorder()

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { mutate: patchUser, isPending } = usePatchUser({
    onSuccess: (response) => {
      if (response.data.hasVoice) {
        dispatch(accountActions.setHasVoice())
        navigate(ROUTE_PATHS.ONBOARDING_SUCCESS)
      }
    },
    onError: (error) => {
      if (error instanceof ORPCError && error.code === 'AUDIO_VALIDATION_ERROR') {
        const backendErrors = (error.data as BackendErrorResponse | undefined)?.errors ?? []
        if (backendErrors.some(({ message }) => message === AUDIO_TOO_SHORT_MESSAGE)) {
          dispatch(modalActions.openModal(AUDIO_TOO_SHORT_FOR_CLONING_MODAL_ID))
          return
        }
      }

      dispatch(modalActions.openErrorModal(USER_FACING_ERROR_CODE.CLONE_VOICE_ERROR))
    },
    meta: {
      showErrorToast: false,
    },
  })

  useEffect(() => {
    if (mostRecentRecording !== null && !!motherLanguage && !hasVoice) {
      // Convert Blob to File for oRPC
      const audioFile = new File([mostRecentRecording], 'recording.webm', {
        type: mostRecentRecording.type || 'audio/webm',
      })

      patchUser({
        audio: audioFile,
        langCode: motherLanguage,
      })
    }
  }, [mostRecentRecording, motherLanguage, hasVoice, patchUser])

  const onPreviousClick = () => {
    resetAudioRecorder()
    dispatch(accountActions.setHasAcceptedTermsAndConditionsAndClickedNext(false))
    navigate(ROUTE_PATHS.ONBOARDING_TERMS_AND_CONDITIONS)
  }

  const textForCloning = LANG_TO_TEXT_FOR_CLONING[motherLanguage]

  return (
    <WithNavbar>
      <div className='flex w-full flex-col items-center p-2 py-4'>
        <div className='w-full md:w-3/4 lg:w-2/3 3xl:w-1/3'>
          <BigCard className='flex flex-col items-center gap-2 p-6 md:gap-6'>
            <div className='flex w-full items-center'>
              <button onClick={onPreviousClick} className='text-gray-500 hover:text-gray-700' disabled={isPending}>
                <ArrowLeft size={24} />
              </button>
            </div>

            {isPending ? (
              <div className='flex h-full w-full flex-col items-center justify-center gap-10 text-2xl'>
                <h1 className='text-center text-3xl font-bold text-gray-700'>{t`Cloning your voice...`}</h1>
                <SquaresLoader />
              </div>
            ) : (
              <div className='flex w-full flex-grow flex-col items-center gap-6'>
                <div className='flex w-full flex-col items-center gap-2'>
                  <h1 className='text-center text-2xl font-bold tracking-tighter text-gray-800 md:text-3xl'>
                    {t`Push the record button and`}
                  </h1>
                  <h1 className='text-center text-2xl font-bold tracking-tighter text-gray-800 md:text-3xl'>
                    {t`record the text slowly:`}
                  </h1>
                </div>

                <div className='w-full max-w-[500px] text-center text-sm text-gray-500'>
                  {t`When you're done, click stop and we'll clone your voice.`}
                </div>

                <div className='flex w-full items-center justify-center'>
                  <AudioRecorder
                    isRecording={isRecording}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    cancelRecording={cancelRecording}
                  />
                </div>

                <div className='w-full max-w-[400px] rounded-xl bg-gray-50 px-2 py-4 text-center text-lg text-gray-700'>
                  {textForCloning}
                </div>
              </div>
            )}
          </BigCard>
        </div>
      </div>
    </WithNavbar>
  )
}
