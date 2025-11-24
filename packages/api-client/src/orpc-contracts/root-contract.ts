import { audioContract } from './audio-contract'
import { audioTranscriptionContract } from './audio-transcription-contract'
import { ipaTranscriptionContract } from './ipa-transcription-contract'
import { messagesContract } from './messages-contract'
import { userSettingsContract } from './user-settings-contract'
import { userMarketingPreferencesContract } from './user-marketing-preferences-contract'
import { audioGenerationContract } from './audio-generation-contract'
import { authenticationContract } from './authentication-contract'
import { billingContract } from './billing-contract'
import { pronunciationEvaluationExerciseContract } from './pronunciation-evaluation-exercise-contract'
import { userContract } from './user-contract'
import { contactEmailContract } from './contact-email-contract'
import { checkoutContract } from './checkout-contract'
import { grammarCorrectionContract } from './grammar-correction-contract'
import { languageDetectionContract } from './language-detection-contract'
import { leaderboardContract } from './leaderboard-contract'
import { portalSessionContract } from './portal-session-contract'
import { removalsContract } from './removals-contract'
import { savedWordsContract } from './saved-words-contract'
import { wordsContract } from './words-contract'
import { healthCheckContract } from './health-check-contract'
import { sentryDebugContract } from './sentry-debug-contract'
import { stressExerciseContract } from './stress-exercise-contract'
import { translationExerciseContract } from './translation-exercise-contract'
import { translationContract } from './translation-contract'
import { configContract } from './config-contract'
import { transliterationContract } from './transliteration-contract'

export const rootOrpcContract = {
  audio: audioContract,
  audioTranscription: audioTranscriptionContract,
  ipaTranscription: ipaTranscriptionContract,
  messages: messagesContract,
  userSettings: userSettingsContract,
  audioGeneration: audioGenerationContract,
  authentication: authenticationContract,
  billing: billingContract,
  pronunciationEvaluationExercise: pronunciationEvaluationExerciseContract,
  user: userContract,
  userMarketingPreferences: userMarketingPreferencesContract,
  contactEmail: contactEmailContract,
  checkout: checkoutContract,
  grammarCorrection: grammarCorrectionContract,
  languageDetection: languageDetectionContract,
  leaderboard: leaderboardContract,
  portalSession: portalSessionContract,
  removals: removalsContract,
  savedWords: savedWordsContract,
  words: wordsContract,
  healthCheck: healthCheckContract,
  sentryDebug: sentryDebugContract,
  stressExercise: stressExerciseContract,
  translationExercise: translationExerciseContract,
  translation: translationContract,
  config: configContract,
  transliteration: transliterationContract,
} as const
