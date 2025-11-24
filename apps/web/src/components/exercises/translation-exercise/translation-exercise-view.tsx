import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleHelp, Eye, SkipForward } from 'lucide-react'
import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice'
import { buildTranslationExercisePath, ROUTE_PATHS } from '@/routing/route-paths'
import { Button } from '@/components/design-system/button'
import { Toggle } from '@/components/design-system/toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/popover'
import { ExercisePhase, GrammarPattern } from './types'
import { SelectableText } from './components/organisms/selectable-text'
import { GrammarPatternButtons } from './components/molecules/grammar-pattern-buttons'
import { TranslationInput } from './components/molecules/translation-input'
import { GrammarPatternButtonsSkeleton } from './components/atoms/grammar-pattern-buttons-skeleton'
import { TranslationAudioPlayer } from '@/components/audio-player/translation-audio-player'
import { useSelection } from './hooks/use-selection'
import { BigCard } from '@/components/design-system/big-card'
import { WithFixedNavbar } from '@/components/navbar/with-fixed-navbar'
import { useSimpleAudioRecorder } from '@/hooks/audio/use-simple-audio-recorder'
import { SelectableTextCard } from '@/components/exercises/translation-exercise/components/atoms/selectable-text-card'
import { SelectableTextSkeleton } from '@/components/exercises/translation-exercise/components/atoms/selectable-text-skeleton'
import { GrammarPatternButtonsCard } from '@/components/exercises/translation-exercise/components/atoms/grammar-pattern-buttons-card'
import {
  useCompleteTranslationExercise,
  useGrammarPatterns,
  useStartTranslationExercise,
} from '@/hooks/api/translation-exercise/translation-exercise-hooks'
import { useTranscribeAudioToText } from '@/hooks/api/audio-transcription/audio-transcription-hooks'
import { TranslationExercise } from '@/hooks/api/translation/translation-hooks'
import { modalActions } from '@/state/slices/modal-slice'
import { AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID } from '@/components/modal/modal-ids'
import { toast } from 'sonner'
import { ORPCError } from '@orpc/client'
import { isAudioTooShortErrorPayload } from '@yourbestaccent/api-client/utils/audio-error-utils'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'
import { useLingui } from '@lingui/react/macro'

interface TranslationExerciseViewProps {
  currentExercise?: TranslationExercise
  isLoading?: boolean
}

export const TranslationExerciseView = ({ currentExercise, isLoading = false }: TranslationExerciseViewProps) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const motherLanguage: LangCode = useSelector(selectMotherLanguageOrEnglish)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)

  const [currentPhase, setCurrentPhase] = useState<ExercisePhase>('display')
  const [userTranslation, setUserTranslation] = useState<string>('')

  const { isRecording, startRecording, stopRecording, recording, resetAudioRecorder } = useSimpleAudioRecorder()

  const [grammarPatternSelection, setGrammarPatternSelection] = useState<{
    selectedGrammarPatterns: GrammarPattern[]
  }>({
    selectedGrammarPatterns: [],
  })

  const { selectionState, toggleSelectionMode, addSelection, clearSelections, getSelectionsForLanguage } =
    useSelection()

  const { mutate: getNextExercise, isPending: isFetchingExercise } = useStartTranslationExercise()

  const { mutate: completeExercise, isPending: isCompletingExercise } = useCompleteTranslationExercise({
    onSuccess: () => {
      getNextExercise(
        { studyLanguage, motherLanguage, dialect },
        {
          onSuccess: (response) => {
            navigate(buildTranslationExercisePath(response.data.id), { replace: true })
          },
        }
      )
    },
  })

  const {
    data: grammarPatternsData,
    isFetching: isFetchingGrammarPatterns,
    isLoading: isLoadingGrammarPatterns,
  } = useGrammarPatterns(
    currentExercise?.id,
    currentExercise?.motherLanguageSentence,
    currentExercise?.studyLanguageSentence,
    studyLanguage,
    motherLanguage,
    isLoading
  )

  const { mutate: transcribe, isPending: isTranscribing } = useTranscribeAudioToText(
    studyLanguage,
    userTranslation,
    setUserTranslation,
    resetAudioRecorder
  )

  const { i18n, t } = useLingui()
  const studyLanguageName = i18n._(langNameMessages[studyLanguage])

  const handleTranscriptionError = useCallback(
    (error: unknown) => {
      resetAudioRecorder()

      if (
        error instanceof ORPCError &&
        error.code === 'AUDIO_VALIDATION_ERROR' &&
        isAudioTooShortErrorPayload(error.data)
      ) {
        dispatch(modalActions.openModal(AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID))
        return
      }

      toast.error(t`Failed to transcribe audio. Please try again.`)
    },
    [dispatch, resetAudioRecorder, t]
  )

  useEffect(() => {
    if (recording) {
      transcribe(recording, {
        onError: handleTranscriptionError,
      })
    }
  }, [recording, transcribe, handleTranscriptionError])

  useEffect(() => {
    return () => {
      resetAudioRecorder()
    }
  }, [resetAudioRecorder])

  const handleGrammarPatternToggle = useCallback((structure: GrammarPattern) => {
    setGrammarPatternSelection((prev) => {
      const isSelected = prev.selectedGrammarPatterns.some(
        (s) => s.structure === structure.structure && s.concept === structure.concept
      )

      return {
        ...prev,
        selectedGrammarPatterns: isSelected
          ? prev.selectedGrammarPatterns.filter(
              (s) => !(s.structure === structure.structure && s.concept === structure.concept)
            )
          : [...prev.selectedGrammarPatterns, structure],
      }
    })
  }, [])

  const handleShowAnswer = useCallback(() => {
    if (isRecording) {
      stopRecording()
    }
    setCurrentPhase('answer')
  }, [isRecording, stopRecording])

  const handleSkip = useCallback(() => {
    if (!currentExercise) return

    setUserTranslation('')
    setGrammarPatternSelection({
      selectedGrammarPatterns: [],
    })
    clearSelections()

    completeExercise({
      exerciseId: currentExercise.id,
      skipped: true,
    })
  }, [currentExercise, completeExercise, clearSelections, setUserTranslation])

  const handleContinue = useCallback(() => {
    if (!currentExercise) return

    setCurrentPhase('display')

    const motherLanguageChunks = getSelectionsForLanguage(motherLanguage)
    const studyLanguageChunks = getSelectionsForLanguage(studyLanguage)
    const allChunks = [...motherLanguageChunks, ...studyLanguageChunks]

    setUserTranslation('')
    setGrammarPatternSelection({
      selectedGrammarPatterns: [],
    })
    clearSelections()

    completeExercise({
      exerciseId: currentExercise.id,
      skipped: false,
      userTranslation: userTranslation || undefined,
      selectedGrammarPatterns: grammarPatternSelection.selectedGrammarPatterns,
      selectedChunks: allChunks.length > 0 ? allChunks : undefined,
    })
  }, [
    currentExercise,
    completeExercise,
    userTranslation,
    grammarPatternSelection,
    getSelectionsForLanguage,
    motherLanguage,
    studyLanguage,
    clearSelections,
  ])

  const isButtonsDisabled = isFetchingExercise || isCompletingExercise || isLoading

  return (
    <WithFixedNavbar>
      <div className='flex h-full w-full flex-col items-center'>
        <BigCard className='container relative flex h-full flex-col overflow-hidden p-2 md:pb-2 md:pt-2 lg:pb-1 lg:pt-2'>
          <Button
            href={ROUTE_PATHS.DASHBOARD}
            className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
          >
            <ArrowLeft className='' />
          </Button>

          <div className='mb-4 flex justify-center md:mt-6'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-2'>
                <Toggle isToggled={selectionState.isSelectionMode} onClick={toggleSelectionMode} size='lg' />
                <button onClick={toggleSelectionMode} className='text-sm font-medium text-gray-700 hover:text-gray-900'>
                  {t`Multi-Word Selection`}
                </button>
              </div>
              <Popover>
                <PopoverTrigger>
                  <CircleHelp className='h-4 w-4 text-stone-400' />
                </PopoverTrigger>
                <PopoverContent className='bg-white text-center text-sm shadow-lg'>
                  {t`Want to translate more than one word? Turn this on to enter the multi-word selection mode, then click on words one by one to select them. When you're done, click on "End Selection" in the menu to save your selection and see the translation. These selected words and phrases will be stored to create new sentences later to help you review expressions and collocations.`}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='flex-1 overflow-y-auto'>
              {currentPhase === 'display' && (
                <div className='space-y-6'>
                  <SelectableTextCard
                    title={t`Translate this sentence`}
                    className='md:p-6'
                    helpText={t`Read the sentence carefully and try to translate it to the best of your ability. You can click on individual words to hear their pronunciation or see translations. We will use the words you clicked on to create new sentences, and you will see those words again later.`}
                  >
                    {isFetchingExercise || isCompletingExercise || isLoading ? (
                      <SelectableTextSkeleton />
                    ) : (
                      <SelectableText
                        text={currentExercise?.motherLanguageSentence || ''}
                        isSelectionMode={selectionState.isSelectionMode}
                        language={motherLanguage}
                        targetLanguage={studyLanguage}
                        translationSentence={currentExercise?.studyLanguageSentence || ''}
                        onSelection={addSelection}
                        onExitSelectionMode={toggleSelectionMode}
                      />
                    )}
                  </SelectableTextCard>
                  <GrammarPatternButtonsCard
                    title={t`Select the difficult grammar patterns`}
                    helpText={t`Select the grammar structures that you find challenging or would like to practice more. This helps us understand what you want to focus on. You can select as many as you like. We will show you new sentences using those patterns in the next exercises.`}
                  >
                    {isFetchingExercise || isFetchingGrammarPatterns || isCompletingExercise || isLoading ? (
                      <GrammarPatternButtonsSkeleton />
                    ) : (
                      <GrammarPatternButtons
                        patterns={grammarPatternsData || []}
                        selectedPatterns={grammarPatternSelection.selectedGrammarPatterns}
                        onPatternToggle={handleGrammarPatternToggle}
                        maxVisible={10}
                      />
                    )}
                  </GrammarPatternButtonsCard>
                </div>
              )}

              {currentPhase === 'answer' && (
                <div className='space-y-6'>
                  <SelectableTextCard title={t`Correct translation`} className='bg-green-50 p-0 pt-3 md:p-6'>
                    <SelectableText
                      text={currentExercise?.studyLanguageSentence || ''}
                      isSelectionMode={selectionState.isSelectionMode}
                      language={studyLanguage}
                      targetLanguage={motherLanguage}
                      translationSentence={currentExercise?.motherLanguageSentence || ''}
                      onSelection={addSelection}
                      onExitSelectionMode={toggleSelectionMode}
                    />
                    <div className='mt-2'>
                      <TranslationAudioPlayer
                        translationText={currentExercise?.studyLanguageSentence || ''}
                        fileName={`sentence--${currentExercise?.studyLanguageSentence || 'translated_sentence_audio'}`}
                      />
                    </div>
                  </SelectableTextCard>
                  {userTranslation && (
                    <SelectableTextCard title={t`Your translation`} className='bg-amber-50 p-4'>
                      <p className='text-lg text-gray-900'>{userTranslation}</p>
                    </SelectableTextCard>
                  )}
                  <SelectableTextCard title={t`Original sentence`} className='bg-indigo-50 p-4'>
                    <p className='text-lg text-gray-900'>{currentExercise?.motherLanguageSentence}</p>
                  </SelectableTextCard>
                  <GrammarPatternButtonsCard
                    title={t`Select the difficult grammar patterns`}
                    helpText={t`Select the grammar structures that you find challenging or would like to practice more. This helps us understand what you want to focus on.`}
                  >
                    {isFetchingExercise || isLoadingGrammarPatterns ? (
                      <GrammarPatternButtonsSkeleton />
                    ) : (
                      <GrammarPatternButtons
                        patterns={grammarPatternsData || []}
                        selectedPatterns={grammarPatternSelection.selectedGrammarPatterns}
                        onPatternToggle={handleGrammarPatternToggle}
                        maxVisible={10}
                      />
                    )}
                  </GrammarPatternButtonsCard>
                </div>
              )}
            </div>

            <div className='flex flex-shrink-0 flex-col gap-2 border-t border-gray-200 pt-2'>
              {currentPhase === 'display' && (
                <>
                  <TranslationInput
                    value={userTranslation}
                    onChange={setUserTranslation}
                    placeholder={t`Try translating this into ${studyLanguageName}...`}
                    isRecording={isRecording}
                    isTranscribing={isTranscribing}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    helpText={t`Try to translate the sentence to the best of your ability. Your translation will be used to create new sentences that focus on what you struggle with. Don't worry about perfect punctuation or minor spelling mistakes. Focus on getting the meaning and main grammar structures right. You can use the microphone to record your translation if you prefer.`}
                  />
                  <div className='flex w-full flex-row justify-center gap-2'>
                    <Button
                      onClick={handleShowAnswer}
                      disabled={isButtonsDisabled}
                      className='w-4/5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 md:w-1/2'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      {t`Show Answer`}
                    </Button>
                    <Button
                      onClick={handleSkip}
                      disabled={isButtonsDisabled}
                      className='w-1/5 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                    >
                      <SkipForward className='h-4 w-4 md:mr-2' />
                      <span className='hidden md:inline'>{t`Skip`}</span>
                    </Button>
                  </div>
                </>
              )}

              {currentPhase === 'answer' && (
                <div className='flex w-full flex-col gap-2 md:flex-row md:justify-center md:gap-2'>
                  <Button
                    onClick={handleContinue}
                    disabled={isButtonsDisabled}
                    className='bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 md:w-1/2'
                  >
                    <ArrowRight className='mr-2 h-4 w-4' />
                    {t`Continue`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </BigCard>
      </div>
    </WithFixedNavbar>
  )
}
