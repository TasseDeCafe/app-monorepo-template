import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { mockTranslateText } from './translate-text/mock-translate'
import { translateText } from './translate-text/translate-text'
import { generateIpa } from './generate-ipa/generate-ipa'
import { mockGenerateIpa } from './generate-ipa/mock-generate-ipa'
import { translateWord } from './translate-word/translate-word'
import { mockTranslateWord } from './translate-word/mock-translate-word'
import { translateWordWithTranslationContext } from './translate-word-with-translation-context/translate-word-with-translation-context'
import { mockTranslateWordWithTranslationContext } from './translate-word-with-translation-context/mock-translate-word-with-translation-context'
import { translateSelection } from './translate-selection/translate-selection'
import { mockTranslateSelection } from './translate-selection/mock-translate-selection'
import {
  getOrthographicFormsForMultipleWords,
  GetOrthographicFormsForMultipleWordsResult,
} from './get-orthographic-form-for-multiple-words/get-orthographic-form-for-multiple-words'
import { mockGetOrthographicFormsForMultipleWords } from './get-orthographic-form-for-multiple-words/mock-get-orthographic-form-for-multiple-words'
import { getOrthographicFormForWord } from './get-orthographic-form-for-word/get-orthographic-form-for-word'
import { mockGetOrthographicFormForWord } from './get-orthographic-form-for-word/mock-get-orthographic-form-for-word'
import { FrequencyLists } from '../../../../utils/frequency-list-utils'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { generateExerciseFromFrequencyList } from './generate-exercise-from-frequency-list/generate-exercise-from-frequency-list'
import { mockGenerateExerciseFromFrequencyList } from './generate-exercise-from-frequency-list/mocked-generate-exercise-from-frequency-list'
import { correctGrammar } from './grammar-correction/correct-grammar'
import { mockCorrectGrammar } from './grammar-correction/mock-correct-grammar'
import {
  correctGrammarAndExplainMistakes,
  CorrectGrammarAndExplainResult,
} from './grammar-correction-and-explain-mistakes/correct-grammar-and-explain-mistakes'
import { mockCorrectGrammarAndExplainMistakes } from './grammar-correction-and-explain-mistakes/mock-correct-grammar-and-explain-mistakes'
import { getTutorResponse, LlmLayerMessage } from './get-tutor-response/get-tutor-response'
import { mockGetTutorResponse } from './get-tutor-response/mock-get-tutor-response'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'
import {
  generateTranslationExercise,
  PreviousExerciseWithLearningData,
  GenerateTranslationExerciseResult,
} from './generate-translation-exercises/generate-translation-exercise'
import { mockGenerateTranslationExercise } from './generate-translation-exercises/mock-generate-translation-exercise'
import {
  generateGrammarPatterns,
  GenerateGrammarPatternsResult,
} from './generate-grammar-patterns/generate-grammar-patterns'
import { mockGenerateGrammarPatterns } from './generate-grammar-patterns/mock-generate-grammar-patterns'
import { VoiceOption } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { generateStressExercises, StressExercise } from './generate-stress-exercises/generate-stress-exercise'
import { mockGenerateStressExercises } from './generate-stress-exercises/mock-generate-stress-exercise'

// this api provides llm methods for which it is trivial to switch to a different llm provider
export interface GenericLlmApi {
  generateExerciseFromFrequencyList: (
    language: SupportedStudyLanguage,
    dialect: DialectCode,
    position: number,
    wordLength: number,
    frequencyLists: FrequencyLists,
    topics: Topic[]
  ) => Promise<string | null>

  translateWord: (
    text: string,
    sourceDialect: DialectCode,
    targetLanguage: LangCode,
    expectedWords: string[],
    selectedWordIndex: number
  ) => Promise<string | null>
  translateWordWithTranslationContext: (
    word: string,
    sourceDialect: DialectCode,
    targetLanguage: LangCode,
    originalSentence: string,
    translatedSentence: string,
    wordIndex: number
  ) => Promise<string | null>
  translateText: (text: string, sourceDialect: DialectCode, targetLanguage: LangCode) => Promise<string | null>
  translateSelection: (
    originalSentence: string,
    translationSentence: string,
    selectionChunks: string[],
    selectionPositions: number[],
    sourceDialect: DialectCode,
    targetLanguage: LangCode
  ) => Promise<string | null>
  generateIpa: (text: string, language: LangCode, dialect: DialectCode) => Promise<string[] | null>
  getOrthographicFormsForMultipleWords: (
    text: string,
    wordsWithoutPunctuation: string[],
    language: LangCode
  ) => Promise<GetOrthographicFormsForMultipleWordsResult>
  getOrthographicFormForWord: (
    language: LangCode,
    contextWords: string[],
    selectedWordIndex: number
  ) => Promise<string | null>
  correctGrammar: (text: string, studyLanguage: SupportedStudyLanguage, dialect: DialectCode) => Promise<string | null>
  correctGrammarAndExplainMistakes: (
    text: string,
    motherLanguage: LangCode,
    language: LangCode,
    dialect: DialectCode
  ) => Promise<CorrectGrammarAndExplainResult>
  getTutorResponse: (
    lastMessages: LlmLayerMessage[],
    motherLanguage: LangCode,
    studyLanguage: SupportedStudyLanguage,
    personality: PersonalityCode | null,
    voiceOption: VoiceOption
  ) => Promise<string | null>
  generateTranslationExercise: (
    previousExercise: PreviousExerciseWithLearningData | null,
    studyLanguage: SupportedStudyLanguage,
    motherLanguage: LangCode,
    dialect: DialectCode,
    frequencyLists: FrequencyLists
  ) => Promise<GenerateTranslationExerciseResult>
  generateGrammarPatterns: (
    motherLanguageSentence: string,
    studyLanguageSentence: string,
    studyLanguage: LangCode,
    motherLanguage: LangCode
  ) => Promise<GenerateGrammarPatternsResult>
  generateStressExercises: (
    position: number,
    language: SupportedStudyLanguage,
    dialect: DialectCode,
    frequencyLists: FrequencyLists
  ) => Promise<StressExercise[] | null>
}

export const RealGenericLlmApi: GenericLlmApi = {
  generateExerciseFromFrequencyList,
  translateWord,
  translateWordWithTranslationContext,
  translateText,
  translateSelection,
  generateIpa,
  getOrthographicFormsForMultipleWords,
  getOrthographicFormForWord,
  correctGrammar,
  correctGrammarAndExplainMistakes,
  getTutorResponse,
  generateTranslationExercise,
  generateGrammarPatterns,
  generateStressExercises,
}

export const MockGenericLlmApi: GenericLlmApi = {
  generateExerciseFromFrequencyList: mockGenerateExerciseFromFrequencyList,
  translateWord: mockTranslateWord,
  translateWordWithTranslationContext: mockTranslateWordWithTranslationContext,
  translateText: mockTranslateText,
  translateSelection: mockTranslateSelection,
  generateIpa: mockGenerateIpa,
  getOrthographicFormsForMultipleWords: mockGetOrthographicFormsForMultipleWords,
  getOrthographicFormForWord: mockGetOrthographicFormForWord,
  correctGrammar: mockCorrectGrammar,
  correctGrammarAndExplainMistakes: mockCorrectGrammarAndExplainMistakes,
  getTutorResponse: mockGetTutorResponse,
  generateTranslationExercise: mockGenerateTranslationExercise,
  generateGrammarPatterns: mockGenerateGrammarPatterns,
  generateStressExercises: mockGenerateStressExercises,
}
