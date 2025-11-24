import { DialectCode, LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { StressExercise } from '@yourbestaccent/api-client/orpc-contracts/stress-exercise-contract'
import { FrequencyLists, selectedWordsInWindow } from '../../../../../utils/frequency-list-utils'
import { dialectCodeToDialectName } from '../../../../../utils/lang-code-utils'
import { getStructuredLlmJson } from '../structured-json-helpers'
import { GENERATE_STRESS_EXERCISES_PROVIDER_CONFIG, type GenerateStressExercisesResponse } from '../llm-configs'
import { logWithSentry } from '../../../sentry/error-monitoring'

type LanguageSpecificPromptData = {
  examples: {
    word: string
    sentence: string
    syllablesText: string
    syllablesIpa: string
  }[]
}

const PROMPT_DATA: Partial<Record<SupportedStudyLanguage, LanguageSpecificPromptData>> = {
  [LangCode.ENGLISH]: {
    examples: [
      {
        word: 'computer',
        sentence: 'I need to restart my computer before the meeting starts.',
        syllablesText: 'com,pu,ter',
        syllablesIpa: 'kəmˈpjutər',
      },
      {
        word: 'beautiful',
        sentence: 'The sunset created a beautiful view of the mountains.',
        syllablesText: 'beau,ti,ful',
        syllablesIpa: 'ˈbjutəfəl',
      },
      {
        word: 'important',
        sentence: 'This meeting is very important for our future.',
        syllablesText: 'im,por,tant',
        syllablesIpa: 'ɪmˈpɔrtənt',
      },
    ],
  },
  [LangCode.RUSSIAN]: {
    examples: [
      {
        word: 'работать',
        sentence: 'Мне нужно работать весь день в офисе.',
        syllablesText: 'ра,бо,тать',
        syllablesIpa: 'rɐˈbotətʲ',
      },
      {
        word: 'красивый',
        sentence: 'Какой красивый закат над городом сегодня.',
        syllablesText: 'кра,си,вый',
        syllablesIpa: 'krɐˈsʲivɨj',
      },
      {
        word: 'говорить',
        sentence: 'Я хочу говорить на разных языках.',
        syllablesText: 'го,во,рить',
        syllablesIpa: 'ɡəvɐˈrʲitʲ',
      },
    ],
  },
  [LangCode.UKRAINIAN]: {
    examples: [
      {
        word: 'працювати',
        sentence: 'Мені потрібно працювати цілий день у офісі.',
        syllablesText: 'пра,цю,ва,ти',
        syllablesIpa: 'prɐˈt͡sʲuvɐtɪ',
      },
      {
        word: 'красивий',
        sentence: 'Який красивий захід сонця над містом.',
        syllablesText: 'кра,си,вий',
        syllablesIpa: 'krɐˈsɪvɪj',
      },
      {
        word: 'говорити',
        sentence: 'Я хочу говорити різними мовами.',
        syllablesText: 'го,во,ри,ти',
        syllablesIpa: 'ɦovoˈrɪtɪ',
      },
    ],
  },
  [LangCode.ITALIAN]: {
    examples: [
      {
        word: 'lavorare',
        sentence: 'Devo lavorare tutto il giorno in ufficio.',
        syllablesText: 'la,vo,ra,re',
        syllablesIpa: 'lavoˈrare',
      },
      {
        word: 'bellissimo',
        sentence: 'Che tramonto bellissimo sulla città oggi.',
        syllablesText: 'bel,lis,si,mo',
        syllablesIpa: 'belˈlissimo',
      },
      {
        word: 'parlare',
        sentence: 'Voglio parlare molte lingue.',
        syllablesText: 'par,la,re',
        syllablesIpa: 'parˈlare',
      },
    ],
  },
  [LangCode.GERMAN]: {
    examples: [
      {
        word: 'arbeiten',
        sentence: 'Ich muss den ganzen Tag im Büro arbeiten.',
        syllablesText: 'ar,bei,ten',
        syllablesIpa: 'ˈaʁbaɪtən',
      },
      {
        word: 'wunderbar',
        sentence: 'Der Sonnenuntergang über der Stadt ist wunderbar.',
        syllablesText: 'wun,der,bar',
        syllablesIpa: 'ˈvʊndɐbaːɐ̯',
      },
      {
        word: 'sprechen',
        sentence: 'Ich möchte viele Sprachen sprechen.',
        syllablesText: 'spre,chen',
        syllablesIpa: 'ˈʃpʁɛçən',
      },
    ],
  },
}

const formatExample = (example: LanguageSpecificPromptData['examples'][0], index: number) =>
  `${index + 1} ### ${example.word} ### ${example.sentence} ### ${example.syllablesText} ### ${example.syllablesIpa}`

const buildPrompt = (
  position: number,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  frequencyLists: FrequencyLists
): string => {
  const selectedWords = selectedWordsInWindow(frequencyLists, language, dialect, position, 800, 10)
  const promptData = PROMPT_DATA[language] ?? PROMPT_DATA[LangCode.ENGLISH]!

  return `
Here is a list of ${selectedWords.length} words in ${dialectCodeToDialectName(dialect)}: "${selectedWords.join(', ')}"

Produce stress exercises for all words with at least two syllables using this format (### separates fields):
word ### sentence ### syllables ### IPA

${promptData.examples.map((example, index) => formatExample(example, index)).join('\n')}

Guidelines:
- Only create exercises for words with two or more syllables
- Don't create exercises for proper nouns like "Bonnie", "Jonathan", etc. 
- Break syllables with commas and keep the original spelling (including diacritics/accents) without adding stress markers or leading apostrophes
- Provide a single stress marker (ˈ) in the IPA at the start of the stressed syllable
- Use the separate stressIndex field in the JSON response to indicate which syllable is stressed (0-based index)
- Include conversational example sentences that naturally use the word in ${dialectCodeToDialectName(dialect)}
- Pick words from the provided list only if they fit the criteria; skip any others

Return only JSON in this shape (no explanations):
{
  "exercises": [
    {
      "word": "example",
      "sentence": "Example sentence.",
      "wordIpa": "ˈexample",
      "syllables": [
        { "text": "ex" },
        { "text": "am" },
        { "text": "ple" }
      ],
      "stressIndex": 2
    }
  ]
}`
}

export const generateStressExercises = async (
  position: number,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  frequencyLists: FrequencyLists
): Promise<StressExercise[] | null> => {
  try {
    const prompt = buildPrompt(position, language, dialect, frequencyLists)
    const structuredResult = await getStructuredLlmJson<GenerateStressExercisesResponse>({
      prompt,
      llmConfig: GENERATE_STRESS_EXERCISES_PROVIDER_CONFIG,
      repairInstructions:
        'Ensure exercises array is not empty, each stressIndex matches the stressed syllable position, syllable text preserves original diacritics, and stress markers or leading apostrophes are never present in the syllable text.',
    })

    if (!structuredResult.success) {
      logWithSentry({
        message: 'Failed to parse structured stress exercise response',
        params: {
          position,
          language,
          dialect,
          attempts: structuredResult.attempts,
          errors: structuredResult.errors,
        },
        error: new Error(structuredResult.errors.at(-1)?.error || 'Unknown LLM structured JSON error'),
      })
      return null
    }

    const {
      data: { exercises },
    } = structuredResult

    const sanitizedExercises = exercises.map((exercise) => {
      const sanitizedSyllables = exercise.syllables.map((syllable) => ({
        text: syllable.text.replace(/['ˈ’`]/gu, '').trim(),
      }))
      return {
        ...exercise,
        syllables: sanitizedSyllables,
      }
    })

    const validExercises = sanitizedExercises.filter((exercise) => {
      const hasMultipleSyllables = exercise.syllables.length > 1
      const hasValidStressIndex = exercise.stressIndex >= 0 && exercise.stressIndex < exercise.syllables.length
      const syllablesRevealStress = exercise.syllables.some((syllable, index) => {
        const containsStressMarker = /['ˈ’`]/u.test(syllable.text)
        const syllableIsEmpty = syllable.text.length === 0
        const syllableMatchesHighlight =
          index === exercise.stressIndex && syllable.text.toLowerCase() === exercise.word.toLowerCase()
        return containsStressMarker || syllableIsEmpty || syllableMatchesHighlight
      })
      return hasMultipleSyllables && hasValidStressIndex && !syllablesRevealStress
    })

    if (validExercises.length === 0) {
      logWithSentry({
        message: 'LLM produced stress exercises without valid stress data',
        params: {
          position,
          language,
          dialect,
          rawExercises: exercises,
        },
      })
      return null
    }

    return validExercises
  } catch (error) {
    logWithSentry({
      message: 'Error generating stress exercises',
      params: {
        position,
        language,
        dialect,
      },
      error,
    })
    return null
  }
}

export type { StressExercise } from '@yourbestaccent/api-client/orpc-contracts/stress-exercise-contract'
