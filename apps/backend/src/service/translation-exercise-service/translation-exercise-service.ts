import { LangCode, SupportedStudyLanguage, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { CrypticCodeConstants } from '../../constants/cryptic-code-constants'
import { GenericLlmApi } from '../../transport/third-party/llms/generic-llm/generic-llm-api'
import {
  TranslationExercisesRepositoryInterface,
  mapGrammarPatternsToDbGrammarPatterns,
} from '../../transport/database/translation-exercises/translation-exercises-repository'
import { PreviousExerciseWithLearningData } from '../../transport/third-party/llms/generic-llm/generate-translation-exercises/generate-translation-exercise'
import { FrequencyLists } from '../../utils/frequency-list-utils'
import {
  StartTranslationExerciseResult,
  RetrieveTranslationExerciseResult,
  RetrieveTranslationExerciseHistoryResult,
  CompleteExerciseResult,
  GenerateExerciseResult,
  GenerateGrammarPatternsResult,
  CompleteExerciseParams,
  TranslationExercisesServiceInterface,
  TranslationExercise,
  TranslationExerciseHistoryItem,
} from './translation-exercise-service-types'
import { logWithSentry } from '../../transport/third-party/sentry/error-monitoring'

export const TranslationExerciseService = (
  genericLlmApi: GenericLlmApi,
  translationExercisesRepository: TranslationExercisesRepositoryInterface,
  frequencyLists: FrequencyLists
): TranslationExercisesServiceInterface => {
  const startTranslationExercise = async (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode
  ): Promise<StartTranslationExerciseResult> => {
    // First, check if there's an incomplete exercise
    const incompleteExercise = await translationExercisesRepository.getIncompleteExercise(
      userId,
      studyLanguage,
      dialect
    )

    if (incompleteExercise) {
      return {
        isSuccess: true,
        exercise: {
          id: incompleteExercise.id,
          motherLanguageSentence: incompleteExercise.mother_language_sentence,
          studyLanguageSentence: incompleteExercise.study_language_sentence,
          studyLanguage: incompleteExercise.study_language,
          motherLanguage: incompleteExercise.mother_language,
          dialect: incompleteExercise.dialect,
          createdAt: incompleteExercise.created_at.toISOString(),
          userTranslation: incompleteExercise.user_translation,
          skipped: incompleteExercise.skipped,
        },
      }
    }

    // If no incomplete exercise, generate a new one
    const generateResult = await generateExercise(userId, studyLanguage, motherLanguage, dialect)
    if (!generateResult.isSuccess) {
      return {
        isSuccess: false,
        crypticCode: generateResult.crypticCode,
      }
    }

    // Then get the first newly created exercise
    const newIncompleteExercise = await translationExercisesRepository.getIncompleteExercise(
      userId,
      studyLanguage,
      dialect
    )
    if (!newIncompleteExercise) {
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.TRANSLATION_NO_EXERCISE_AFTER_GENERATION,
      }
    }

    return {
      isSuccess: true,
      exercise: {
        id: newIncompleteExercise.id,
        motherLanguageSentence: newIncompleteExercise.mother_language_sentence,
        studyLanguageSentence: newIncompleteExercise.study_language_sentence,
        studyLanguage: newIncompleteExercise.study_language,
        motherLanguage: newIncompleteExercise.mother_language,
        dialect: newIncompleteExercise.dialect,
        createdAt: newIncompleteExercise.created_at.toISOString(),
        userTranslation: newIncompleteExercise.user_translation,
        skipped: newIncompleteExercise.skipped,
      },
    }
  }

  const completeExercise = async (params: CompleteExerciseParams): Promise<CompleteExerciseResult> => {
    const success = await translationExercisesRepository.completeTranslationExercise({
      exerciseId: params.exerciseId,
      userTranslation: params.userTranslation,
      skipped: params.skipped || false,
      // Convert GrammarPattern[] to DbGrammarPattern[], filtering out hints
      selectedGrammarPatterns: params.selectedGrammarPatterns
        ? mapGrammarPatternsToDbGrammarPatterns(params.selectedGrammarPatterns)
        : undefined,
    })

    if (!success) {
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.TRANSLATION_FAILED_TO_COMPLETE_EXERCISE,
      }
    }

    // Save chunk selections if provided
    if (params.selectedChunks && params.selectedChunks.length > 0) {
      await translationExercisesRepository.createSelections({
        translationExerciseId: params.exerciseId,
        selections: params.selectedChunks.map((chunk) => ({
          selection_chunks: chunk.chunk,
          selection_positions: chunk.chunk_position,
          language: chunk.language,
        })),
      })
    }

    return {
      isSuccess: true,
    }
  }

  const generateExercise = async (
    userId: string,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode
  ): Promise<GenerateExerciseResult> => {
    // Selection strategy:
    // 1. Get latest 100 exercises
    // 2. Randomly select 30 of them
    // 3. Find those with learning data (selected chunks or grammar patterns)
    // 4. Randomly pick ONE exercise with learning data (if any)
    // 5. Use that single exercise for context, or empty context if none found

    const latest100Exercises = await translationExercisesRepository.getLatestExercisesForRandomSelection(
      userId,
      studyLanguage,
      motherLanguage,
      dialect,
      100
    )

    let selectedExerciseWithLearningData: PreviousExerciseWithLearningData | null = null

    if (latest100Exercises.length > 0) {
      // Step 1: Randomly select 30 from the latest 100 (or all if less than 30)
      const randomSelection = latest100Exercises
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, Math.min(30, latest100Exercises.length))

      // Step 2: Filter to find exercises with learning data
      const exercisesWithLearningData = await Promise.all(
        randomSelection.map(async (exercise) => {
          const hasGrammarPatterns = exercise.grammar_patterns && exercise.grammar_patterns.length > 0
          const selections = await translationExercisesRepository.getSelectionsByExerciseId(exercise.id)
          const hasSelections = selections.length > 0

          return {
            exercise,
            hasLearningData: hasGrammarPatterns || hasSelections,
            selections,
          }
        })
      )

      const filteredExercises = exercisesWithLearningData.filter((item) => item.hasLearningData)

      // Step 3: If we have exercises with learning data, randomly pick ONE
      if (filteredExercises.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredExercises.length)
        const chosenExerciseData = filteredExercises[randomIndex]
        const chosenExercise = chosenExerciseData.exercise

        // Group selections by language
        const motherLanguageSelections = chosenExerciseData.selections
          .filter((selection) => selection.language === motherLanguage)
          .map((selection) => ({ chunk: selection.selection_chunks, chunk_position: selection.selection_positions }))

        const studyLanguageSelections = chosenExerciseData.selections
          .filter((selection) => selection.language === studyLanguage)
          .map((selection) => ({ chunk: selection.selection_chunks, chunk_position: selection.selection_positions }))

        selectedExerciseWithLearningData = {
          mother_language_sentence: chosenExercise.mother_language_sentence,
          study_language_sentence: chosenExercise.study_language_sentence,
          grammar_patterns: chosenExercise.grammar_patterns || [],
          mother_language_selected_chunks: motherLanguageSelections,
          study_language_selected_chunks: studyLanguageSelections,
        }
      }
    }

    const contextExercise = selectedExerciseWithLearningData || null

    const generateResult = await genericLlmApi.generateTranslationExercise(
      contextExercise,
      studyLanguage,
      motherLanguage,
      dialect,
      frequencyLists
    )

    if (!generateResult.isSuccess) {
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.TRANSLATION_FAILED_TO_GENERATE_EXERCISES,
      }
    }

    const exercise = generateResult.exercise
    const motherLanguageSentence = exercise.mother_language_sentence
    const studyLanguageSentence = exercise.study_language_sentence

    if (!motherLanguageSentence || !studyLanguageSentence) {
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.TRANSLATION_FAILED_TO_SAVE_EXERCISES,
      }
    }

    const created = await translationExercisesRepository.createTranslationExercise({
      userId,
      studyLanguage,
      motherLanguage,
      dialect,
      motherLanguageSentence,
      studyLanguageSentence,
    })

    if (!created) {
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.TRANSLATION_FAILED_TO_SAVE_EXERCISES,
      }
    }

    return {
      isSuccess: true,
    }
  }

  const generateGrammarPatterns = async (
    motherLanguageSentence: string,
    studyLanguageSentence: string,
    studyLanguage: LangCode,
    motherLanguage: LangCode
  ): Promise<GenerateGrammarPatternsResult> => {
    const result = await genericLlmApi.generateGrammarPatterns(
      motherLanguageSentence,
      studyLanguageSentence,
      studyLanguage,
      motherLanguage
    )

    if (!result.isSuccess) {
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.TRANSLATION_FAILED_TO_ANALYZE_GRAMMAR_PATTERNS,
      }
    }

    return {
      isSuccess: true,
      grammarPatterns: result.patterns,
    }
  }

  const retrieveTranslationExercise = async (
    userId: string,
    exerciseId: string
  ): Promise<RetrieveTranslationExerciseResult> => {
    try {
      const exerciseResult = await translationExercisesRepository.retrieveExerciseByIdAndUserId(userId, exerciseId)

      if (!exerciseResult) {
        return {
          isSuccess: false,
          exerciseFound: false,
        }
      }

      const exercise: TranslationExercise = {
        id: exerciseResult.id,
        motherLanguageSentence: exerciseResult.mother_language_sentence,
        studyLanguageSentence: exerciseResult.study_language_sentence,
        studyLanguage: exerciseResult.study_language,
        motherLanguage: exerciseResult.mother_language,
        dialect: exerciseResult.dialect,
        createdAt: exerciseResult.created_at.toISOString(),
        userTranslation: exerciseResult.user_translation,
        skipped: exerciseResult.skipped,
      }

      return {
        isSuccess: true,
        exercise,
      }
    } catch (error) {
      logWithSentry({
        message: 'Failed to retrieve translation exercise',
        params: { userId, exerciseId },
        error,
      })

      return {
        isSuccess: false,
        exerciseFound: true,
        crypticCode: CrypticCodeConstants.TRANSLATION_RETRIEVE_SINGLE_UNEXPECTED_ERROR,
      }
    }
  }

  const retrieveTranslationExerciseHistory = async (
    userId: string,
    cursor?: string,
    limit: number = 50,
    languageFilter?: SupportedStudyLanguage
  ): Promise<RetrieveTranslationExerciseHistoryResult> => {
    try {
      const exercisesResult = await translationExercisesRepository.retrieveTranslationExercises(
        userId,
        cursor,
        limit,
        languageFilter
      )

      if (!exercisesResult.isSuccess || !exercisesResult.exercises) {
        return {
          isSuccess: false,
          crypticCode: CrypticCodeConstants.TRANSLATION_RETRIEVE_HISTORY_QUERY_FAILED,
        }
      }

      const exercises: TranslationExerciseHistoryItem[] = exercisesResult.exercises.map((dbExercise) => ({
        id: dbExercise.id,
        motherLanguageSentence: dbExercise.mother_language_sentence,
        studyLanguageSentence: dbExercise.study_language_sentence,
        studyLanguage: dbExercise.study_language,
        motherLanguage: dbExercise.mother_language,
        dialect: dbExercise.dialect,
        createdAt: dbExercise.created_at.toISOString(),
        userTranslation: dbExercise.user_translation,
        skipped: dbExercise.skipped,
      }))

      return {
        isSuccess: true,
        exercises,
        nextCursor: exercisesResult.nextCursor || null,
      }
    } catch (error) {
      logWithSentry({
        message: 'Failed to retrieve translation exercise history',
        params: { userId, cursor, limit, languageFilter },
        error,
      })
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.TRANSLATION_RETRIEVE_HISTORY_UNEXPECTED_ERROR,
      }
    }
  }

  return {
    startTranslationExercise,
    retrieveTranslationExercise,
    retrieveTranslationExerciseHistory,
    completeExercise,
    generateExercise,
    generateGrammarPatterns,
  }
}
