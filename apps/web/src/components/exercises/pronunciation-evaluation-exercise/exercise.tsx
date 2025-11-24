import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { UseQueryResult } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { useAudioRecorder } from '@/hooks/audio/use-audio-recorder.ts'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectHasVoice,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { AudioRecorder } from '../../audio-recorder/audio-recorder.tsx'
import { Button as DesignSystemButton } from '../../design-system/button.tsx'
import { Evaluation } from './evaluation/evaluation.tsx'
import { PronunciationComparison } from './evaluation/organisms/pronunciation-comparison.tsx'
import { ScoreSkeleton } from './evaluation/score-skeleton.tsx'
import { AudioPlayerInstance } from '../../audio-player/audio-player-types.ts'
import { ExerciseProps } from './types.ts'
import { GetGenerateAudioData } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract.ts'
import { WordPair, WordPairWithAlignment } from '@yourbestaccent/core/exercises/types/evaluation-types'
import { useGeneratedAudioText } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { useEvaluatePronunciation } from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import { addTimeStampsOfExpectedWordsToPairs } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/exercise-utils'
import { modalActions } from '@/state/slices/modal-slice'
import { AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID } from '@/components/modal/modal-ids'
import { toast } from 'sonner'
import { ORPCError } from '@orpc/client'
import { isAudioTooShortErrorPayload } from '@yourbestaccent/api-client/utils/audio-error-utils'
import { useLingui } from '@lingui/react/macro'

export const Exercise = ({
  expectedText,
  onTryAnotherTextClick,
  children,
  textOnTryAnotherTextButton,
  exerciseId,
}: ExerciseProps) => {
  const { t } = useLingui()

  const {
    isRecording,
    recordings,
    mostRecentRecording,
    resetAudioRecorder,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder()
  const dispatch = useDispatch()
  const hasVoice: boolean = useSelector(selectHasVoice)
  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const [processedRecording, setProcessedRecording] = useState<Blob | null>(null)
  const { data: getGenerateAudioData, isFetching: isGeneratingAudio }: UseQueryResult<GetGenerateAudioData> =
    useGeneratedAudioText(expectedText, studyLanguage, dialect, hasVoice)

  const {
    mutate: evaluatePronunciation,
    data: pronunciationEvaluationData,
    isPending: isFetchingPronunciationEvaluation,
  } = useEvaluatePronunciation(exerciseId)

  // Handle success - set processed recording after evaluation completes
  useEffect(() => {
    if (pronunciationEvaluationData && mostRecentRecording && mostRecentRecording !== processedRecording) {
      setProcessedRecording(mostRecentRecording)
    }
  }, [pronunciationEvaluationData, mostRecentRecording, processedRecording])

  useEffect(() => {
    if (mostRecentRecording && mostRecentRecording !== processedRecording && hasVoice && dialect && studyLanguage) {
      evaluatePronunciation(mostRecentRecording, {
        onError: (error, audioBlob) => {
          setProcessedRecording(audioBlob)

          if (
            error instanceof ORPCError &&
            error.code === 'AUDIO_VALIDATION_ERROR' &&
            isAudioTooShortErrorPayload(error.data)
          ) {
            dispatch(modalActions.openModal(AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID))
            return
          }

          toast.error(t`Failed to evaluate pronunciation. Please try again.`)
        },
      })
    }
  }, [mostRecentRecording, processedRecording, evaluatePronunciation, hasVoice, dialect, studyLanguage, dispatch, t])

  const isFetchingEvaluation = isFetchingPronunciationEvaluation

  useEffect(() => {
    return () => {
      resetAudioRecorder()
      setProcessedRecording(null)
    }
  }, [resetAudioRecorder])

  const handleTryAnotherTextClick = useCallback(() => {
    POSTHOG_EVENTS.click('try_another_text')
    resetAudioRecorder()
    setProcessedRecording(null)
    onTryAnotherTextClick()
  }, [resetAudioRecorder, onTryAnotherTextClick])

  const generatedAudio: string | null = getGenerateAudioData?.audio ?? null

  const generatedAudioPlayerRef = useRef<AudioPlayerInstance>(null)

  const pairs: WordPair[] = useMemo(() => {
    return pronunciationEvaluationData?.evaluation.wordPairs || []
  }, [pronunciationEvaluationData])

  const wordPairsWithAlignment: WordPairWithAlignment[] | null = useMemo(() => {
    if (!getGenerateAudioData) {
      return null
    }

    if (!getGenerateAudioData.hasAlignment) {
      // For gpt-audio languages, just return pairs without alignment
      return pairs.map((pair) => ({
        ...pair,
        expectedStartTimeInMs: null,
        expectedEndTimeInMs: null,
      }))
    }

    // For languages with alignment data
    return addTimeStampsOfExpectedWordsToPairs(pairs, getGenerateAudioData.alignment)
  }, [pairs, getGenerateAudioData])

  // we cannot show evaluation properly until we have audio alignment data. On the other hand we don't want to show
  // the loader to the user if he didn't even record his voice yet
  const isEvaluationLoading: boolean = ((isFetchingEvaluation || isGeneratingAudio) && recordings.length > 0) as boolean
  return (
    <div className='mt-2 flex w-full flex-1 flex-col items-center justify-between gap-y-4 p-1 text-center md:mt-4 md:p-2'>
      <div className='flex w-full flex-col items-center lg:pb-0'>
        {isEvaluationLoading && (
          <div className='flex w-full flex-col items-center gap-2 md:max-w-4xl md:gap-4 lg:max-w-6xl'>
            <ScoreSkeleton />
          </div>
        )}
        <div className='mb-4 flex w-full flex-col items-center md:max-w-4xl lg:max-w-6xl'>
          {generatedAudio &&
          wordPairsWithAlignment &&
          pronunciationEvaluationData &&
          !isFetchingEvaluation &&
          !isRecording ? (
            <Evaluation
              wordPairsWithAlignment={wordPairsWithAlignment}
              generatedAudioPlayerRef={generatedAudioPlayerRef}
              text={expectedText}
              scoreInPercentage={pronunciationEvaluationData.evaluation.score * 100}
              recordedAudioBlob={mostRecentRecording}
            />
          ) : (
            <>{children}</>
          )}
        </div>
        {recordings.length === 0 && (
          <p className='hidden w-80 text-center text-xs text-gray-400 md:block'>{t`Click the record button and read the above text aloud. When you're done, click stop and we'll analyze your pronunciation.`}</p>
        )}
        <AudioRecorder
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
          cancelRecording={cancelRecording}
        />
        {recordings.length > 0 && (
          <div className='w-full md:max-w-screen-xl'>
            <PronunciationComparison
              generatedAudio={generatedAudio}
              generatedAudioPlayerRef={generatedAudioPlayerRef}
              recordings={recordings}
              text={expectedText}
            />
          </div>
        )}
      </div>
      <div className='flex w-full flex-col gap-y-3 md:gap-2 lg:flex-row xl:max-w-screen-md'>
        <DesignSystemButton onClick={handleTryAnotherTextClick} className='w-full border border-slate-300'>
          <ChevronRight className='mr-1 h-5' />
          <span>{textOnTryAnotherTextButton}</span>
        </DesignSystemButton>
      </div>
    </div>
  )
}
