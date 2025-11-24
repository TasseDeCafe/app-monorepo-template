import React, { useState } from 'react'
import { Keyboard, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { ChevronDown, CircleHelp, GraduationCap } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import * as Haptics from 'expo-haptics'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { DEFAULT_DIALECTS, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { BigCard } from '@/components/ui/big-card'
import { Button } from '@/components/ui/button'
import { TextForExercise } from '@/components/exercises/pronunciation-exercise/text-for-exercise'
import { Exercise } from '@/components/exercises/pronunciation-exercise/exercise'
import { useGetUser, usePatchStudyLanguageAndDialect } from '@/hooks/api/user/user-hooks'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import { ScrollView as GestureHandlerScrollView } from 'react-native-gesture-handler'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useDetectStudyLanguage } from '@/hooks/api/language-detection/language-detection-hooks'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { CustomPronunciationEvaluationExerciseControls } from '@/components/exercises/pronunciation-exercise/controls/custom-pronunciation-evaluation-exercise-controls'
import { useTranslateText } from '@/hooks/api/translation/translation-hooks'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  useGenerateCustomPronunciationEvaluationExerciseMutation,
  useRetrievePronunciationEvaluationExercise,
} from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import colors from 'tailwindcss/colors'
import { CustomCircularFlag } from '@/components/ui/custom-circular-flag'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { useAudioPlayerStore } from '@/stores/audio-player-store'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

// Schema factory function that accepts translated error messages
const createFormSchema = (tooShortMsg: string, tooLongMsg: string) =>
  z.object({
    customText: z
      .string()
      .transform((val) => val.trim())
      .pipe(z.string().min(2, { message: tooShortMsg }).max(400, { message: tooLongMsg })),
  })

type FormInputs = {
  customText: string
}

export default function PronunciationEvaluationCustomStartScreen() {
  const { t, i18n } = useLingui()

  const FormSchema = createFormSchema(
    t`Text is too short (minimum 2 characters)`,
    t`Text is too long (maximum 400 characters)`
  )

  const { defaultedUserData: user } = useGetUser()
  const openSheet = useBottomSheetStore((state) => state.open)
  const queryClient = useQueryClient()

  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [selectedStudyLanguage, setSelectedStudyLanguage] = useState<SupportedStudyLanguage>(user.studyLanguage)
  const dialect = DEFAULT_DIALECTS[selectedStudyLanguage]
  const motherLanguage = user.motherLanguage
  const pauseAllPlayers = useAudioPlayerStore((state) => state.pauseAllPlayers)

  const { data: exerciseData } = useRetrievePronunciationEvaluationExercise(exerciseId)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      customText: '',
    },
    mode: 'onChange',
  })

  const customTextValue = watch('customText')

  const { data: languageDetectionData, isFetching: isFetchingLanguageDetection } =
    useDetectStudyLanguage(customTextValue)

  const expectedText: string = exerciseData?.text ?? ''

  useTranslateText(expectedText, dialect, motherLanguage)

  const hasDetectedAStudyLanguage = languageDetectionData?.hasDetectedAStudyLanguage ?? false
  const confidence = languageDetectionData?.confidence ?? 0
  const detectedStudyLanguage = languageDetectionData?.studyLanguage

  const shouldProposeToSwitchLanguage =
    !isFetchingLanguageDetection &&
    hasDetectedAStudyLanguage &&
    confidence > 0.3 &&
    detectedStudyLanguage &&
    detectedStudyLanguage !== selectedStudyLanguage

  const updateStudyLanguageMutation = usePatchStudyLanguageAndDialect()

  const { mutate: generateExercise, isPending: isGeneratingExercise } =
    useGenerateCustomPronunciationEvaluationExerciseMutation({
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

  const handleSwitchToDetectedLanguage = () => {
    if (detectedStudyLanguage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {})
      const newDialect = DEFAULT_DIALECTS[detectedStudyLanguage]

      setSelectedStudyLanguage(detectedStudyLanguage)
      updateStudyLanguageMutation.mutate({
        studyLanguage: detectedStudyLanguage,
        studyDialect: newDialect,
      })
    }
  }

  const handleOpenLanguageSelector = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {})

    openSheet(IndividualSheetName.CUSTOM_EXERCISE_STUDY_LANGUAGE_SELECTOR, {
      onLanguageSelect: (language: SupportedStudyLanguage) => {
        setSelectedStudyLanguage(language)
      },
      initialLanguage: selectedStudyLanguage,
    })
  }

  const onSubmit = (data: FormInputs) => {
    Keyboard.dismiss()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {})
    generateExercise({
      text: data.customText.trim(),
      language: selectedStudyLanguage,
      dialect,
    })
  }

  const handleTryAnotherText = () => {
    pauseAllPlayers()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {})
    setExerciseId(null)
    reset()
  }

  return (
    <SafeAreaView className='flex-1 bg-indigo-50' edges={['left', 'right', 'bottom']}>
      <Stack.Screen
        options={{
          title: t`Custom pronunciation practice`,
          headerShown: true,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <View className='flex-1'>
          <View className='flex-1 px-4 py-2'>
            {!exerciseData ? (
              <>
                <Text className='mb-8 mt-4 text-center text-3xl font-bold'>{t`Enter text to practice`}</Text>

                <View className='mb-4'>
                  <TouchableOpacity
                    onPress={handleOpenLanguageSelector}
                    className='h-14 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4'
                  >
                    <View className='flex-row items-center gap-2'>
                      <CustomCircularFlag languageOrDialectCode={selectedStudyLanguage} size={20} />
                      <Text className='text-lg'>{i18n._(langNameMessages[selectedStudyLanguage])}</Text>
                    </View>
                    <ChevronDown size={20} color='#6b7280' />
                  </TouchableOpacity>

                  <View className='mt-2 h-6'>
                    {shouldProposeToSwitchLanguage ? (
                      <View className='ml-1 flex-row items-center gap-x-1'>
                        <Text className='text-sm text-gray-500'>{t`switch to:`} </Text>
                        <TouchableOpacity onPress={handleSwitchToDetectedLanguage}>
                          <View className='flex-row items-center'>
                            <Text className='text-sm font-medium text-indigo-600'>
                              {i18n._(langNameMessages[detectedStudyLanguage])}
                            </Text>
                          </View>
                        </TouchableOpacity>
                        <Popover>
                          <PopoverTrigger asChild>
                            <TouchableOpacity className='text-gray-400' onLongPress={() => {}}>
                              <CircleHelp color={colors.gray[400]} height={16} width={16} />
                            </TouchableOpacity>
                          </PopoverTrigger>
                          <PopoverContent side='bottom' avoidCollisions={true} className='rounded-lg p-4'>
                            <Text className='text-center text-sm text-slate-600'>
                              {t`We will try to detect the language of your text automatically but it's better if you select it manually.`}
                            </Text>
                          </PopoverContent>
                        </Popover>
                      </View>
                    ) : null}
                  </View>
                </View>

                <GestureHandlerScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps='handled'
                  className='flex-1'
                >
                  {errors.customText && <Text className='mb-1 text-sm text-red-500'>{errors.customText.message}</Text>}
                  <Controller
                    control={control}
                    name='customText'
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder={t`Type your text to practice here. Use the language chosen above`}
                        multiline
                        numberOfLines={10}
                        className='min-h-[200px] rounded-xl border border-gray-200 bg-white p-4 text-base leading-5'
                        textAlignVertical='top'
                      />
                    )}
                  />
                </GestureHandlerScrollView>
              </>
            ) : (
              <>
                <BigCard className='mb-6 flex-1'>
                  <CustomPronunciationEvaluationExerciseControls />
                  <Exercise
                    expectedText={expectedText}
                    studyLanguage={selectedStudyLanguage}
                    dialect={dialect}
                    exerciseId={exerciseData.id}
                  >
                    <TextForExercise text={expectedText} studyLanguage={selectedStudyLanguage} />
                  </Exercise>
                </BigCard>
              </>
            )}

            <View className='mb-6 mt-auto pt-4'>
              {!exerciseData ? (
                <Button
                  onPress={handleSubmit(onSubmit)}
                  disabled={!customTextValue || customTextValue.length < 2 || !isValid}
                  variant='default'
                  className='h-16 w-full'
                  textClassName='text-lg'
                  startIcon={<GraduationCap size={24} color='white' />}
                  loading={isGeneratingExercise}
                >
                  {t`Start practicing`}
                </Button>
              ) : (
                <Button
                  onPress={handleTryAnotherText}
                  variant='default'
                  className='h-16 w-full'
                  textClassName='text-lg'
                  loading={isGeneratingExercise}
                >
                  Try different text
                </Button>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
