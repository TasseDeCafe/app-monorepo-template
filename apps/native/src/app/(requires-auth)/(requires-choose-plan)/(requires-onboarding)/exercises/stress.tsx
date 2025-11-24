import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack } from 'expo-router'
import { Check, Settings, X } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { BigCard } from '@/components/ui/big-card'
import { Button } from '@/components/ui/button'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import { useGetStressExercises } from '@/hooks/api/stress-exercise/stress-exercise-hooks'
import { useFrequencySliderPosition } from '@/hooks/api/user-settings/user-settings-hooks'
import { StressExerciseSkeleton } from '@/components/exercises/stress-exercise/stress-exercise-skeleton'
import { Trans, useLingui } from '@lingui/react/macro'

export default function StressExerciseScreen() {
  const { t } = useLingui()

  const { defaultedUserData: user } = useGetUser()
  const studyLanguage = user.studyLanguage
  const studyDialect = user.studyDialect
  const position = useFrequencySliderPosition(studyLanguage)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [selectedSyllable, setSelectedSyllable] = useState<number | null>(null)
  const [isEvaluated, setIsEvaluated] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const openSheet = useBottomSheetStore((state) => state.open)

  const { data, fetchNextPage, isLoading, isFetchingNextPage } = useGetStressExercises()

  const allExercises = data?.pages.flat() ?? []
  const currentExercise = allExercises[currentExerciseIndex]

  const stressedSyllable = currentExercise?.syllables[currentExercise.stressIndex]?.text

  useEffect(() => {
    setCurrentExerciseIndex(0)
    setSelectedSyllable(null)
    setIsEvaluated(false)
    setIsCorrect(false)
  }, [studyLanguage, studyDialect, position])

  const handleSyllableClick = (index: number) => {
    if (!isEvaluated) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
      setSelectedSyllable(index)
    }
  }

  const handleEvaluate = () => {
    if (selectedSyllable !== null) {
      const isAnswerCorrect = selectedSyllable === currentExercise.stressIndex
      setIsCorrect(isAnswerCorrect)
      setIsEvaluated(true)

      if (isAnswerCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      }
    }
  }

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {})
    // If we're 4 exercises away from the end, fetch more
    // We don't fetch the next page if a request is already in flight.
    if (currentExerciseIndex >= allExercises.length - 4 && !isFetchingNextPage) {
      fetchNextPage()
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    setCurrentExerciseIndex((prev) => prev + 1)
    setSelectedSyllable(null)
    setIsEvaluated(false)
    setIsCorrect(false)
  }

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})
    openSheet(IndividualSheetName.STRESS_EXERCISE_SETTINGS)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className='flex-1 bg-indigo-50'>
      <Stack.Screen
        options={{
          title: t`Choose the stressed syllable`,
          headerRight: () => (
            <TouchableOpacity className='px-2' onPress={handleOpenSettings}>
              <Settings size={24} color='#4b5563' />
            </TouchableOpacity>
          ),
        }}
      />
      <View className='flex-1 px-4 py-2'>
        <BigCard className='mb-6 flex-1'>
          {isLoading || !currentExercise ? (
            <StressExerciseSkeleton />
          ) : (
            <View className='flex-1 p-6'>
              {/* Main content */}
              <View className='flex-1'>
                <View className='flex-1 gap-8'>
                  <View className='items-center'>
                    <Text className='text-2xl font-semibold'>{t`Choose the stressed syllable`}</Text>
                  </View>

                  <View className='gap-4'>
                    <Text className='text-center text-lg'>{currentExercise.sentence}</Text>

                    <View className='items-center'>
                      <Text className='my-4 text-2xl font-bold'>{currentExercise.word}</Text>
                    </View>

                    <View className='gap-4'>
                      {/* Syllable buttons */}
                      <View className='flex-row flex-wrap justify-center gap-3'>
                        {currentExercise.syllables.map((syllable, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleSyllableClick(index)}
                            disabled={isEvaluated}
                            className={`h-12 items-center justify-center rounded-xl border px-4 ${
                              !isEvaluated
                                ? selectedSyllable === index
                                  ? 'border-indigo-500 bg-indigo-500'
                                  : 'border-gray-200'
                                : index === currentExercise.stressIndex
                                  ? 'border-green-500 bg-green-500'
                                  : selectedSyllable === index
                                    ? 'border-red-500 bg-red-500'
                                    : 'border-gray-200'
                            } `}
                          >
                            <Text
                              className={`text-xl ${
                                !isEvaluated
                                  ? selectedSyllable === index
                                    ? 'text-white'
                                    : 'text-gray-700'
                                  : index === currentExercise.stressIndex || (selectedSyllable === index && !isCorrect)
                                    ? 'text-white'
                                    : 'text-gray-700'
                              }`}
                            >
                              {syllable.text}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Fixed-height feedback container */}
                      <View className='h-8 items-center justify-center'>
                        {isEvaluated &&
                          (isCorrect ? (
                            <View className='flex-row items-center gap-2'>
                              <Check size={24} color='#22c55e' />
                              <Text className='text-green-500'>{t`Correct!`}</Text>
                            </View>
                          ) : (
                            <View className='flex-row items-center gap-2'>
                              <X size={24} color='#ef4444' />
                              <Text className='text-red-500'>
                                <Trans>Try again! The stress is on &ldquo;{stressedSyllable}&rdquo;</Trans>
                              </Text>
                            </View>
                          ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </BigCard>

        <View className='mb-4'>
          {!isEvaluated ? (
            <Button
              onPress={handleEvaluate}
              disabled={isLoading || !currentExercise || selectedSyllable === null}
              variant='default'
              className='h-16 w-full'
              textClassName='text-lg'
            >
              {isLoading || !currentExercise ? <ActivityIndicator color='white' /> : t`Show Answer`}
            </Button>
          ) : (
            <Button
              onPress={handleNext}
              variant='default'
              className='h-16 w-full'
              textClassName='text-lg'
              disabled={isLoading}
            >
              {isLoading && !currentExercise ? <ActivityIndicator color='white' /> : t`Next Word`}
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}
