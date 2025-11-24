import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { logCustomErrorMessageAndError, logMessage } from '../../../transport/third-party/sentry/error-monitoring'
import {
  DbPronunciationExercise,
  PronunciationExerciseRepositoryInterface,
} from '../../../transport/database/pronunciation-exercises/pronunciation-evaluation-exercise-repository-types'
import { DeepgramApi } from '../../../transport/third-party/deepgram/deepgram-api'
import { langCodeToDeepgramLanguage } from '../../../transport/third-party/deepgram/transcribe/deepgram-utils'
import { CrypticCodeConstants } from '../../../constants/cryptic-code-constants'
import { GenericLlmApi } from '../../../transport/third-party/llms/generic-llm/generic-llm-api'
import { FrequencyLists } from '../../../utils/frequency-list-utils'
import { SavedWordsRepository } from '../../../transport/database/saved-words/saved-words-repository'
import { getCleanWordsFromSentence } from '@yourbestaccent/core/utils/text-utils'
import {
  CompletePronunciationExerciseResult,
  GeneratePronunciationExerciseResult,
  PronunciationExercise,
  PronunciationExerciseHistoryItem,
  PronunciationExerciseServiceInterface,
  RetrievePronunciationExerciseHistoryResult,
  RetrievePronunciationExerciseResult,
} from './pronunciation-evaluation-exercise-service-types'
import { getTranscription } from './evaluation-algorithm/exercise-utils'
import {
  getAllPairs,
  getEvaluationScoreInPercentage,
  getUserPronunciations,
} from './evaluation-algorithm/pronunciation-exercise/utils/evaluation-utils'
import { TranscriptionResponse } from '@yourbestaccent/core/common-types/transcription-types'
import { MINIMUM_SCORE_FOR_STORING_PRONUNCIATIONS } from './evaluation-algorithm/pronunciation-exercise/evaluation/score/constants'
import { DbUserPronunciation, WordsRepositoryInterface } from '../../../transport/database/words/words-repository'
import { UserStatsServiceInterface } from '../../user-stats/user-stats-service'
import { UploadedFile } from '../../../types/uploaded-file'

export const PronunciationEvaluationExerciseService = (
  pronunciationExerciseRepository: PronunciationExerciseRepositoryInterface,
  genericLlmApi: GenericLlmApi,
  frequencyLists: FrequencyLists,
  savedWordsRepository: SavedWordsRepository,
  deepgramApi: DeepgramApi,
  wordsRepository: WordsRepositoryInterface,
  userStatsService: UserStatsServiceInterface
): PronunciationExerciseServiceInterface => {
  const generatePronunciationExercise = async (
    userId: string,
    language: SupportedStudyLanguage,
    position: number,
    wordLength: number,
    dialect: DialectCode,
    topics?: Topic[]
  ): Promise<GeneratePronunciationExerciseResult> => {
    try {
      const generatedText: string | null = await genericLlmApi.generateExerciseFromFrequencyList(
        language,
        dialect,
        position,
        wordLength,
        frequencyLists,
        topics || []
      )

      if (!generatedText) {
        logMessage(
          `generatePronunciationExercise: failed to generate text, position - ${position}, language - ${language}`
        )
        return {
          isSuccess: false,
          crypticCode: CrypticCodeConstants.FREQUENCY_LIST_TEXT_GENERATION_FAILED,
        }
      }

      const correctedText = await genericLlmApi.correctGrammar(generatedText, language, dialect)
      const finalText = correctedText || generatedText

      const cleanWords = getCleanWordsFromSentence(finalText)

      const dbSelectSavedWordsResult = await savedWordsRepository.selectSavedWords(
        userId,
        cleanWords.map((word) => ({ word, language: language }))
      )
      if (!dbSelectSavedWordsResult.isSuccess) {
        logMessage(
          `generatePronunciationExercise: failed to select savedWords, position - ${position}, language - ${language}`
        )
        return {
          isSuccess: false,
          crypticCode: CrypticCodeConstants.FREQUENCY_LIST_SAVED_WORDS_QUERY_FAILED,
        }
      }

      const exerciseResult = await pronunciationExerciseRepository.createPronunciationExercise(
        userId,
        language,
        finalText,
        dialect
      )

      if (!exerciseResult.isSuccess) {
        return {
          isSuccess: false,
          crypticCode: CrypticCodeConstants.PRONUNCIATION_CREATE_EXERCISE_FAILED,
        }
      }

      const exercise: PronunciationExercise = {
        id: exerciseResult.exerciseId!,
        text: finalText,
        language: language,
        dialect: dialect,
        createdAt: new Date().toISOString(),
        attempts: [],
        wordsFromExerciseThatAreSaved: dbSelectSavedWordsResult.savedWords.map((savedWord) => ({
          word: savedWord.word,
          language: savedWord.language,
        })),
      }

      return {
        isSuccess: true,
        exercise,
      }
    } catch (error) {
      logCustomErrorMessageAndError(
        `generatePronunciationExercise error, userId = ${userId}, language = ${language}`,
        error
      )
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.PRONUNCIATION_GENERATE_UNEXPECTED_ERROR,
      }
    }
  }

  const generateCustomPronunciationExercise = async (
    userId: string,
    text: string,
    language: SupportedStudyLanguage,
    dialect: DialectCode
  ): Promise<GeneratePronunciationExerciseResult> => {
    try {
      const cleanWords = getCleanWordsFromSentence(text)

      const dbSelectSavedWordsResult = await savedWordsRepository.selectSavedWords(
        userId,
        cleanWords.map((word) => ({ word, language: language }))
      )
      if (!dbSelectSavedWordsResult.isSuccess) {
        logMessage(`generateCustomPronunciationExercise: failed to select savedWords, language - ${language}`)
        return {
          isSuccess: false,
          crypticCode: CrypticCodeConstants.FREQUENCY_LIST_SAVED_WORDS_QUERY_FAILED,
        }
      }

      const exerciseResult = await pronunciationExerciseRepository.createPronunciationExercise(
        userId,
        language,
        text,
        dialect
      )

      if (!exerciseResult.isSuccess) {
        return {
          isSuccess: false,
          crypticCode: CrypticCodeConstants.PRONUNCIATION_CREATE_EXERCISE_FAILED,
        }
      }

      const exercise: PronunciationExercise = {
        id: exerciseResult.exerciseId!,
        text: text,
        language: language,
        dialect: dialect,
        createdAt: new Date().toISOString(),
        attempts: [],
        wordsFromExerciseThatAreSaved: dbSelectSavedWordsResult.savedWords.map((savedWord) => ({
          word: savedWord.word,
          language: savedWord.language,
        })),
      }

      return {
        isSuccess: true,
        exercise,
      }
    } catch (error) {
      logCustomErrorMessageAndError(
        `generateCustomPronunciationExercise error, userId = ${userId}, language = ${language}`,
        error
      )
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.PRONUNCIATION_GENERATE_UNEXPECTED_ERROR,
      }
    }
  }

  const retrievePronunciationExercise = async (
    userId: string,
    exerciseId: string
  ): Promise<RetrievePronunciationExerciseResult> => {
    try {
      const exerciseResult = await pronunciationExerciseRepository.retrieveExerciseByIdAndUserId(userId, exerciseId)

      if (!exerciseResult.isSuccess || !exerciseResult.exercise) {
        return {
          isSuccess: false,
          exerciseFound: false,
        }
      }

      const dbExercise = exerciseResult.exercise

      const attempts = dbExercise.attempts.map((attempt) => ({
        id: attempt.id,
        transcript: attempt.user_parsed_input,
        score: attempt.user_score,
        createdAt: attempt.created_at,
      }))

      const cleanWords = getCleanWordsFromSentence(dbExercise.text)
      const dbSelectSavedWordsResult = await savedWordsRepository.selectSavedWords(
        userId,
        cleanWords.map((word) => ({ word, language: dbExercise.language }))
      )

      const wordsFromExerciseThatAreSaved = dbSelectSavedWordsResult.isSuccess
        ? dbSelectSavedWordsResult.savedWords.map((savedWord) => ({
            word: savedWord.word,
            language: savedWord.language,
          }))
        : []

      return {
        isSuccess: true,
        exercise: {
          id: dbExercise.id,
          text: dbExercise.text,
          language: dbExercise.language,
          dialect: dbExercise.dialect,
          createdAt: dbExercise.created_at,
          attempts,
          wordsFromExerciseThatAreSaved,
        },
      }
    } catch (error) {
      logCustomErrorMessageAndError(
        `retrievePronunciationExercise error, userId = ${userId}, exerciseId = ${exerciseId}`,
        error
      )
      return {
        isSuccess: false,
        exerciseFound: true,
        crypticCode: CrypticCodeConstants.PRONUNCIATION_RETRIEVE_SINGLE_UNEXPECTED_ERROR,
      }
    }
  }

  const retrievePronunciationExerciseHistory = async (
    userId: string,
    cursor?: string,
    limit: number = 50,
    languageFilter?: SupportedStudyLanguage
  ): Promise<RetrievePronunciationExerciseHistoryResult> => {
    try {
      const exercisesResult = await pronunciationExerciseRepository.retrievePronunciationExercises(
        userId,
        cursor,
        limit,
        languageFilter
      )

      if (!exercisesResult.isSuccess || !exercisesResult.exercises) {
        return {
          isSuccess: false,
          crypticCode: CrypticCodeConstants.PRONUNCIATION_RETRIEVE_HISTORY_QUERY_FAILED,
        }
      }

      const exercises: PronunciationExerciseHistoryItem[] = exercisesResult.exercises.map((dbExercise) => {
        const attempts = dbExercise.attempts.map((attempt) => ({
          id: attempt.id,
          transcript: attempt.user_parsed_input,
          score: attempt.user_score,
          createdAt: attempt.created_at,
        }))

        return {
          id: dbExercise.id,
          text: dbExercise.text,
          language: dbExercise.language,
          dialect: dbExercise.dialect,
          createdAt: dbExercise.created_at,
          attempts,
        }
      })

      return {
        isSuccess: true,
        exercises,
        nextCursor: exercisesResult.nextCursor,
      }
    } catch (error) {
      logCustomErrorMessageAndError(`retrievePronunciationExerciseHistory error, userId = ${userId}`, error)
      return {
        isSuccess: false,
        crypticCode: CrypticCodeConstants.PRONUNCIATION_RETRIEVE_HISTORY_UNEXPECTED_ERROR,
      }
    }
  }

  const storeUserPronunciationsLater = (
    userId: string,
    exerciseId: string,
    userPronunciations: ReturnType<typeof getUserPronunciations>,
    exerciseText: string,
    language: SupportedStudyLanguage
  ) => {
    // orthographic form enrichment is slow and retried internally; run it outside the request lifecycle
    void (async () => {
      try {
        const wordsWithPunctuation: string[] = userPronunciations.map((up) => up.wordWithoutPunctuation)
        const getOrthographicFormsResult = await genericLlmApi.getOrthographicFormsForMultipleWords(
          exerciseText,
          wordsWithPunctuation,
          language
        )

        if (!getOrthographicFormsResult.isSuccess) {
          logMessage(
            `storeUserPronunciationsLater: failed to get orthographic forms, userId = ${userId}, exerciseId = ${exerciseId}`
          )
          return
        }

        const userPronunciationsWithCorrectedOrthographicForms: DbUserPronunciation[] = userPronunciations.map(
          (up, index) => ({
            confidence: up.confidence,
            word: getOrthographicFormsResult.orthographicForms[index],
            language,
          })
        )

        const insertResult = await wordsRepository.insertPronouncedWordsAndTheirDefinitionsIfNeeded(
          userId,
          userPronunciationsWithCorrectedOrthographicForms
        )

        if (!insertResult) {
          logMessage(
            `storeUserPronunciationsLater: failed to store user pronunciations, userId = ${userId}, exerciseId = ${exerciseId}`
          )
        }
      } catch (error) {
        logCustomErrorMessageAndError(
          `storeUserPronunciationsLater error, userId = ${userId}, exerciseId = ${exerciseId}`,
          error
        )
      }
    })()
  }

  const completePronunciationExercise = async (
    userId: string,
    exerciseId: string,
    audioFile: UploadedFile
  ): Promise<CompletePronunciationExerciseResult> => {
    const exerciseResult = await pronunciationExerciseRepository.retrieveExerciseByIdAndUserId(userId, exerciseId)

    if (!exerciseResult.isSuccess || !exerciseResult.exercise) {
      return {
        isSuccess: false,
        exerciseFound: false,
      }
    }

    const exercise: DbPronunciationExercise = exerciseResult.exercise!

    const transcriptionResult = await deepgramApi.transcribe(audioFile, langCodeToDeepgramLanguage(exercise.language))

    if (!transcriptionResult.wasTranscriptionSuccessful) {
      return {
        isSuccess: false,
        exerciseFound: true,
        crypticCode: CrypticCodeConstants.PRONUNCIATION_TRANSCRIPTION_FAILED,
      }
    }

    const transcriptionResponse: TranscriptionResponse = transcriptionResult.transcription

    const actualDirtyWords = getTranscription(transcriptionResponse)

    const wordPairs = getAllPairs(exercise.text, actualDirtyWords, exercise.language)

    const scoreInPercentage = getEvaluationScoreInPercentage(wordPairs)
    const score = scoreInPercentage / 100 // Convert to 0-1 range

    const wordPairsWithAlignment = wordPairs.map((pair) => ({
      ...pair,
      expectedStartTimeInMs: null,
      expectedEndTimeInMs: null,
    }))
    const userPronunciations = getUserPronunciations(wordPairsWithAlignment)

    const firstChannel = transcriptionResponse.results.channels[0]
    const alternative = firstChannel.alternatives[0]
    const transcript = alternative.transcript

    const saveAttemptPromise = pronunciationExerciseRepository.createPronunciationAttempt(exerciseId, transcript, score)

    if (MINIMUM_SCORE_FOR_STORING_PRONUNCIATIONS <= score) {
      storeUserPronunciationsLater(userId, exerciseId, userPronunciations, exercise.text, exercise.language)
    }

    const attemptResult = await saveAttemptPromise

    if (!attemptResult) {
      logMessage(`Failed to save pronunciation attempt, userId = ${userId}, exerciseId = ${exerciseId}`)
      return {
        isSuccess: false,
        exerciseFound: true,
        crypticCode: CrypticCodeConstants.PRONUNCIATION_TRANSCRIPTION_FAILED,
      }
    }

    const userStatsResult = await userStatsService.getUserStatsForUser(userId)
    if (!userStatsResult.isSuccess) {
      logMessage(
        `Failed to retrieve user stats after exercise completion, userId = ${userId}, exerciseId = ${exerciseId}`
      )
      return {
        isSuccess: false,
        exerciseFound: true,
        crypticCode: CrypticCodeConstants.PRONUNCIATION_TRANSCRIPTION_FAILED,
      }
    }

    return {
      isSuccess: true,
      evaluation: {
        transcript: transcript,
        score: score,
        wordPairs: wordPairs,
      },
      userStats: userStatsResult.userStats,
    }
  }

  return {
    generatePronunciationExercise,
    generateCustomPronunciationExercise,
    retrievePronunciationExercise,
    retrievePronunciationExerciseHistory,
    completePronunciationExercise,
  }
}
