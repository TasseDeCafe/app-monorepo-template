import { SupportedStudyLanguage, LangCode, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import {
  cs50kFrequencyList,
  da50kFrequencyList,
  de50kFrequencyList,
  en50kFrequencyList,
  es50kFrequencyList,
  fi50kFrequencyList,
  fr50kFrequencyList,
  hu50kFrequencyList,
  id50kFrequencyList,
  it50kFrequencyList,
  ms50kFrequencyList,
  nl50kFrequencyList,
  no50kFrequencyList,
  pl50kFrequencyList,
  pt50kFrequencyList,
  ptBr50kFrequencyList,
  ro50kFrequencyList,
  ru50kFrequencyList,
  sk50kFrequencyList,
  sv50kFrequencyList,
  tr50kFrequencyList,
  uk50kFrequencyList,
} from '../constants/frequency-lists'

export type FrequencyLists = {
  [key in SupportedStudyLanguage]:
    | {
        frequencyList: readonly string[]
      }
    | {
        frequencyLists: {
          [key in DialectCode]?: readonly string[]
        }
      }
}

export const frequencyLists: FrequencyLists = {
  [LangCode.ENGLISH]: {
    frequencyList: en50kFrequencyList,
  },
  [LangCode.SPANISH]: {
    frequencyList: es50kFrequencyList,
  },
  [LangCode.FRENCH]: {
    frequencyList: fr50kFrequencyList,
  },
  [LangCode.GERMAN]: {
    frequencyList: de50kFrequencyList,
  },
  [LangCode.ITALIAN]: {
    frequencyList: it50kFrequencyList,
  },
  [LangCode.POLISH]: {
    frequencyList: pl50kFrequencyList,
  },
  [LangCode.PORTUGUESE]: {
    frequencyLists: {
      [DialectCode.BRAZILIAN_PORTUGUESE]: ptBr50kFrequencyList,
      [DialectCode.EUROPEAN_PORTUGUESE]: pt50kFrequencyList,
    },
  },
  [LangCode.RUSSIAN]: {
    frequencyList: ru50kFrequencyList,
  },
  [LangCode.UKRAINIAN]: {
    frequencyList: uk50kFrequencyList,
  },
  [LangCode.CZECH]: {
    frequencyList: cs50kFrequencyList,
  },
  [LangCode.DANISH]: {
    frequencyList: da50kFrequencyList,
  },
  [LangCode.DUTCH]: {
    frequencyList: nl50kFrequencyList,
  },
  [LangCode.FINNISH]: {
    frequencyList: fi50kFrequencyList,
  },
  [LangCode.INDONESIAN]: {
    frequencyList: id50kFrequencyList,
  },
  [LangCode.MALAY]: {
    frequencyList: ms50kFrequencyList,
  },
  [LangCode.ROMANIAN]: {
    frequencyList: ro50kFrequencyList,
  },
  [LangCode.SLOVAK]: {
    frequencyList: sk50kFrequencyList,
  },
  [LangCode.SWEDISH]: {
    frequencyList: sv50kFrequencyList,
  },
  [LangCode.TURKISH]: {
    frequencyList: tr50kFrequencyList,
  },
  [LangCode.HUNGARIAN]: {
    frequencyList: hu50kFrequencyList,
  },
  [LangCode.NORWEGIAN]: {
    frequencyList: no50kFrequencyList,
  },
}

export const mockFrequencyLists: FrequencyLists = {
  [LangCode.ENGLISH]: {
    frequencyList: ['the', 'be', 'to', 'of', 'and'],
  },
  [LangCode.SPANISH]: {
    frequencyList: ['de', 'la', 'que', 'el', 'en'],
  },
  [LangCode.FRENCH]: {
    frequencyList: ['de', 'le', 'la', 'et', 'les'],
  },
  [LangCode.GERMAN]: {
    frequencyList: ['der', 'die', 'und', 'in', 'den'],
  },
  [LangCode.ITALIAN]: {
    frequencyList: ['di', 'e', 'che', 'il', 'la'],
  },
  [LangCode.POLISH]: {
    frequencyList: ['w', 'i', 'na', 'z', 'do'],
  },
  [LangCode.PORTUGUESE]: {
    frequencyLists: {
      [DialectCode.BRAZILIAN_PORTUGUESE]: ['de', 'a', 'o', 'que', 'você'],
      [DialectCode.EUROPEAN_PORTUGUESE]: ['de', 'a', 'o', 'que', 'tu'],
    },
  },
  [LangCode.RUSSIAN]: {
    frequencyList: ['и', 'в', 'не', 'на', 'я'],
  },
  [LangCode.UKRAINIAN]: {
    frequencyList: ['і', 'в', 'не', 'на', 'що'],
  },
  [LangCode.CZECH]: {
    frequencyList: ['a', 'se', 'v', 'na', 'je'],
  },
  [LangCode.DANISH]: {
    frequencyList: ['og', 'i', 'at', 'en', 'den'],
  },
  [LangCode.DUTCH]: {
    frequencyList: ['de', 'en', 'van', 'een', 'het'],
  },
  [LangCode.FINNISH]: {
    frequencyList: ['ja', 'on', 'että', 'ei', 'se'],
  },
  [LangCode.INDONESIAN]: {
    frequencyList: ['yang', 'dan', 'di', 'dengan', 'untuk'],
  },
  [LangCode.MALAY]: {
    frequencyList: ['yang', 'dan', 'di', 'itu', 'untuk'],
  },
  [LangCode.ROMANIAN]: {
    frequencyList: ['de', 'și', 'în', 'a', 'la'],
  },
  [LangCode.SLOVAK]: {
    frequencyList: ['a', 'sa', 'je', 'to', 'na'],
  },
  [LangCode.SWEDISH]: {
    frequencyList: ['och', 'i', 'att', 'det', 'som'],
  },
  [LangCode.TURKISH]: {
    frequencyList: ['bir', 've', 'bu', 'de', 'için'],
  },
  [LangCode.HUNGARIAN]: {
    frequencyList: ['és', 'a', 'az', 'egy', 'az'],
  },
  [LangCode.NORWEGIAN]: {
    frequencyList: ['og', 'i', 'at', 'en', 'den'],
  },
}

const WINDOW_SIZE = 200
const WORDS_TO_INCLUDE = 10

export const selectedWordsInWindow = (
  frequencyLists: FrequencyLists,
  language: SupportedStudyLanguage,
  dialect: DialectCode,
  position: number,
  windowSize: number = WINDOW_SIZE,
  wordsToInclude: number = WORDS_TO_INCLUDE
): string[] => {
  const frequencyListObject = frequencyLists[language]

  const words =
    'frequencyList' in frequencyListObject
      ? frequencyListObject.frequencyList
      : frequencyListObject.frequencyLists[dialect] || []

  const start = Math.max(0, position - windowSize / 2)
  const end = Math.min(words.length, start + windowSize)

  const windowWords = words.slice(start, end)
  const selectedWords: string[] = []

  while (selectedWords.length < wordsToInclude && windowWords.length > 0) {
    const randomIndex = Math.floor(Math.random() * windowWords.length)
    selectedWords.push(windowWords.splice(randomIndex, 1)[0])
  }

  return selectedWords
}
