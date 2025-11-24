import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { AudioRecorder } from '@/components/audio-recorder'
import { VisibleAudioPlayer } from '@/components/ui/audio-player/visible-audio-player'
import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { Skeleton } from '@/components/ui/skeleton'
import { WordPairWithAlignment } from '@yourbestaccent/core/exercises/types/evaluation-types'
import { Evaluation } from './evaluation/evaluation'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'
import { useGenerateAudio } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import * as Haptics from 'expo-haptics'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { toast } from 'sonner-native'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import * as FileSystem from 'expo-file-system/legacy'
import { useCompletePronunciationExercise } from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import { addTimeStampsOfExpectedWordsToPairs } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/exercise-utils'
import { ORPCError } from '@orpc/client'
import { isAudioTooShortErrorPayload } from '@yourbestaccent/api-client/utils/audio-error-utils'
import { MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS } from '@yourbestaccent/core/constants/pronunciation-evaluation-exercise-constants'
import { PLAYER_TYPE } from '@/components/ui/audio-player/audio-player-types'
import { useLingui } from '@lingui/react/macro'

type ExerciseProps = {
  expectedText: string
  children: React.ReactNode
  studyLanguage: SupportedStudyLanguage
  dialect: DialectCode
  exerciseId: string
}

export const Exercise = ({ expectedText, children, studyLanguage, dialect, exerciseId }: ExerciseProps) => {
  const { t } = useLingui()

  const { isRecording, audioUri, toggleRecording, isPermissionLoading } = useAudioRecorder()
  const [recordings, setRecordings] = useState<string[]>([])
  const [mostRecentRecording, setMostRecentRecording] = useState<string | null>(null)
  const [processedRecording, setProcessedRecording] = useState<string | null>(null)

  const { data: generateAudioData, isFetching: isGeneratingAudio } = useGenerateAudio(
    expectedText,
    studyLanguage,
    dialect
  )

  const {
    mutate: evaluatePronunciation,
    data: pronunciationEvaluationData,
    isPending: isFetchingPronunciationEvaluation,
  } = useCompletePronunciationExercise({
    onSuccess: () => {
      setProcessedRecording(mostRecentRecording)
    },
    onError: (error) => {
      setProcessedRecording(mostRecentRecording)

      if (
        error instanceof ORPCError &&
        error.code === 'AUDIO_VALIDATION_ERROR' &&
        isAudioTooShortErrorPayload(error.data)
      ) {
        Alert.alert(
          t`Too short`,
          t`Your audio is too short, it has to be at least ${MIN_LENGTH_OF_AUDIO_FOR_PRONUNCIATION_EVAlUATION_IN_SECONDS} second(s) long. Please record your voice again.`
        )
        return
      }

      toast.error(t`Failed to evaluate pronunciation`)
    },
  })

  const handleRecordPress = async () => {
    POSTHOG_EVENTS.recordAudio(0)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then()
    await toggleRecording()
  }

  useEffect(() => {
    // Check if audioUri is not null and is different from the most recent recording
    // The isRecording check prevents updating state immediately after starting recording (when audioUri might briefly become null)
    if (audioUri && audioUri !== mostRecentRecording && !isRecording) {
      setRecordings((prev) => [...prev, audioUri])
      setMostRecentRecording(audioUri)
    }
    // We only want this effect to run when audioUri changes.
    // Adding mostRecentRecording dependency prevents adding the same URI multiple times if the hook value somehow triggers effect again without changing.
    // Adding isRecording ensures we only process a finished recording URI.
  }, [audioUri, mostRecentRecording, isRecording])

  useEffect(() => {
    if (mostRecentRecording && mostRecentRecording !== processedRecording) {
      const submitAudio = async () => {
        try {
          // Read the file content using Expo FileSystem
          const base64 = await FileSystem.readAsStringAsync(mostRecentRecording, {
            encoding: 'base64',
          })

          evaluatePronunciation({
            exerciseId,
            audio: {
              // React Native lacks fetch Blob support, so send base64 payload instead
              base64,
              mimeType: 'audio/mp3',
              name: 'user-audio.mp3',
            },
          })
        } catch (error) {
          logWithSentry('Failed to read audio file', error)
          toast.error(t`Failed to process audio recording`)
        }
      }

      submitAudio()
    }
  }, [mostRecentRecording, processedRecording, evaluatePronunciation, exerciseId, t])

  const resetAudioRecorder = useCallback(() => {
    setRecordings([])
    setMostRecentRecording(null)
    setProcessedRecording(null)
  }, [])

  const generatedAudio: string | null = generateAudioData?.audio ?? null

  const wordPairsWithAlignment: WordPairWithAlignment[] | null = useMemo(() => {
    if (!pronunciationEvaluationData || !generateAudioData) {
      return null
    }

    const pairs = pronunciationEvaluationData.data.evaluation.wordPairs

    if (!generateAudioData.hasAlignment) {
      return pairs.map((pair) => ({
        ...pair,
        expectedStartTimeInMs: null,
        expectedEndTimeInMs: null,
      }))
    }

    return addTimeStampsOfExpectedWordsToPairs(pairs, generateAudioData.alignment)
  }, [pronunciationEvaluationData, generateAudioData])

  const isEvaluationLoading = (isFetchingPronunciationEvaluation || isGeneratingAudio) && recordings.length > 0

  useEffect(() => {
    return () => {
      resetAudioRecorder()
    }
  }, [resetAudioRecorder])

  return (
    <View className='flex-1 flex-col justify-between p-1'>
      <View className='w-full flex-1 items-center'>
        {isEvaluationLoading && (
          <View className='w-full items-center'>
            <Skeleton className='h-8 w-[80px] rounded-xl' />
          </View>
        )}
        <MaskedView
          style={{ flex: 1, width: '100%' }}
          maskElement={
            <LinearGradient
              style={{ flex: 1 }}
              colors={['white', 'white', 'transparent']}
              locations={[0, 0.85, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
          }
        >
          <ScrollView
            className='w-full flex-1'
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={true}
            indicatorStyle='black'
            persistentScrollbar={true}
          >
            {generatedAudio &&
            wordPairsWithAlignment &&
            pronunciationEvaluationData &&
            !isFetchingPronunciationEvaluation &&
            !isRecording ? (
              <Evaluation
                wordPairsWithAlignment={wordPairsWithAlignment}
                expectedText={expectedText}
                scoreInPercentage={pronunciationEvaluationData.data.evaluation.score * 100}
              />
            ) : (
              <>{children}</>
            )}
          </ScrollView>
        </MaskedView>
      </View>
      {/* Bottom Section - Recording Controls */}
      <View className='mt-auto w-full items-center'>
        {recordings.length === 0 && (
          <Text className='mb-4 text-center text-xs text-gray-400'>{t`Click the record button and read the above text aloud. When you're done, click stop and we'll analyze your pronunciation.`}</Text>
        )}

        <AudioRecorder isRecording={isRecording} onRecordPress={handleRecordPress} disabled={isPermissionLoading} />

        {recordings.length > 0 && generatedAudio && (
          <View className='w-full items-center'>
            {mostRecentRecording && (
              <View className='w-full items-center'>
                <VisibleAudioPlayer
                  audioSource={mostRecentRecording}
                  fileName={`user-recording-${recordings.length}`}
                  title={t`Your pronunciation`}
                  audioSpeedType='userPronunciation'
                  playerType={PLAYER_TYPE.USER_PRONUNCIATION}
                />
              </View>
            )}
            <VisibleAudioPlayer
              audioSource={generatedAudio}
              fileName={`generated-pronunciation-${studyLanguage}`}
              title={t`Your better pronunciation`}
              audioSpeedType='clonePronunciation'
              playerType={PLAYER_TYPE.USER_CLONED_PRONUNCIATION}
            />
          </View>
        )}
      </View>
    </View>
  )
}
