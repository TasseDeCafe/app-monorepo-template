import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import * as Haptics from 'expo-haptics'

import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { BigCard } from '@/components/ui/big-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TextForExercise } from '@/components/exercises/pronunciation-exercise/text-for-exercise'
import { Exercise } from '@/components/exercises/pronunciation-exercise/exercise'
import { PronunciationEvaluationExerciseControls } from '@/components/exercises/pronunciation-exercise/controls/pronunciation-evaluation-exercise-controls'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import {
  useGeneratePronunciationEvaluationExerciseMutation,
  useRetrievePronunciationEvaluationExercise,
} from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import { SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { useTranslateText } from '@/hooks/api/translation/translation-hooks'
import { useFrequencySliderPosition, useFrequencyWordLength } from '@/hooks/api/user-settings/user-settings-hooks'
import { useAudioPlayerStore } from '@/stores/audio-player-store'
import { useLingui } from '@lingui/react/macro'

export default function PronunciationEvaluationStandardStartScreen() {
  const { t } = useLingui()

  const { defaultedUserData: user } = useGetUser()
  const studyLanguage: SupportedStudyLanguage = user.studyLanguage
  const dialect = user.studyDialect
  const motherLanguage = user.motherLanguage
  const queryClient = useQueryClient()
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const pauseAllPlayers = useAudioPlayerStore((state) => state.pauseAllPlayers)

  const { data: exerciseData } = useRetrievePronunciationEvaluationExercise(exerciseId)

  const currentExerciseTopic = user.topics?.[0] ?? null
  const frequencyListPosition = useFrequencySliderPosition(studyLanguage)
  const wordLength = useFrequencyWordLength(studyLanguage)

  const { mutate: generateExercise, isPending: isGeneratingExercise } =
    useGeneratePronunciationEvaluationExerciseMutation({
      onSuccess: (response) => {
        const data = response.data
        queryClient.setQueryData([QUERY_KEYS.PRONUNCIATION_EVALUATION_EXERCISE, data.id], response)
        queryClient.setQueryData([QUERY_KEYS.EXERCISE_TEXT], data.text)

        if (data.wordsFromExerciseThatAreSaved) {
          data.wordsFromExerciseThatAreSaved.forEach(({ word, language }) => {
            if (word) {
              queryClient.setQueryData<boolean>([QUERY_KEYS.SAVED_WORDS, word, language], true)
            }
          })
        }

        setExerciseId(data.id)
      },
      onError: () => {
        router.replace(ROUTE_PATHS.DASHBOARD)
      },
    })

  const expectedText: string = exerciseData?.text ?? ''

  useTranslateText(expectedText, dialect, motherLanguage)

  useEffect(() => {
    generateExercise({
      language: studyLanguage,
      position: frequencyListPosition,
      wordLength,
      dialect,
      topics: currentExerciseTopic ? [currentExerciseTopic] : undefined,
    })
  }, [currentExerciseTopic, dialect, frequencyListPosition, generateExercise, studyLanguage, wordLength])

  const handleTryAnotherText = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {})
    pauseAllPlayers()
    setExerciseId(null)
    generateExercise({
      language: studyLanguage,
      position: frequencyListPosition,
      wordLength,
      dialect,
      topics: currentExerciseTopic ? [currentExerciseTopic] : undefined,
    })
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className='flex-1 bg-indigo-50'>
      <Stack.Screen
        options={{
          title: t`Pronunciation practice`,
        }}
      />
      <View className='flex-1 px-2 py-2'>
        <BigCard className='mb-2 flex-1'>
          {isGeneratingExercise || !exerciseData ? (
            <View className='mb-5 flex-1 justify-between p-4'>
              <View>
                <View className='mb-4 flex w-full flex-row flex-wrap justify-center gap-2 px-1'>
                  <Skeleton className='h-10 w-[80px] rounded-xl' />
                  <Skeleton className='h-10 w-[60px] rounded-xl' />
                  <Skeleton className='h-10 w-[100px] rounded-xl' />
                  <Skeleton className='h-10 w-[70px] rounded-xl' />
                  <Skeleton className='h-10 w-[90px] rounded-xl' />
                  <Skeleton className='h-10 w-[50px] rounded-xl' />
                  <Skeleton className='h-10 w-[120px] rounded-xl' />
                  <Skeleton className='h-10 w-[85px] rounded-xl' />
                </View>
              </View>

              <View className='items-center'>
                <Skeleton className='h-16 w-16 rounded-full' />
              </View>
            </View>
          ) : (
            <>
              <PronunciationEvaluationExerciseControls />
              <Exercise
                expectedText={expectedText}
                studyLanguage={studyLanguage}
                dialect={dialect}
                exerciseId={exerciseData.id}
              >
                <TextForExercise text={expectedText} studyLanguage={studyLanguage} />
              </Exercise>
            </>
          )}
        </BigCard>
        {exerciseData && (
          <View>
            <Button
              onPress={handleTryAnotherText}
              size='lg'
              textClassName='text-lg font-semibold text-white text-center'
              loading={isGeneratingExercise}
            >
              {t`Try another sentence`}
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
