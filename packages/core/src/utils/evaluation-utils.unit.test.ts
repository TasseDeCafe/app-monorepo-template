import { describe, expect, test } from 'vitest'
import {
  WordPairWithAlignment,
  WordPairWithIpaAndTransliteration,
} from '../exercises/types/evaluation-types'
import { addIpaAndTransliterationToPairsWithAlignmentThatHaveExpectedWords } from './evaluation-utils'

describe('evaluation utils', () => {
  describe('addIpaToPairsThatHaveExpectedWords', () => {
    test('assign IPA to pairs that have expected words', () => {
      const wordPairs: WordPairWithAlignment[] = [
        {
          confidence: 0.3,
          actualWord: 'сегодня',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          expectedWord: 'сегодня',
          expectedStartTimeInMs: 0,
          expectedEndTimeInMs: 100,
        },
        {
          confidence: 0.4,
          actualWord: 'мы',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          expectedWord: 'мы',
          expectedStartTimeInMs: 101,
          expectedEndTimeInMs: 200,
        },
        {
          confidence: null,
          actualWord: 'мы',
          actualStartTimeInSeconds: null,
          actualEndTimeInSeconds: null,
          expectedWord: null,
          expectedStartTimeInMs: null,
          expectedEndTimeInMs: null,
        },
        {
          expectedWord: 'пойдем',
          actualWord: 'пойдем',
          actualStartTimeInSeconds: 0.2,
          actualEndTimeInSeconds: 0.3,
          confidence: 0.5,
          expectedStartTimeInMs: 201,
          expectedEndTimeInMs: 300,
        },
      ]

      const ipaWords: string[] = ['sʲɪˈvodnʲə', 'mɨ', 'pɐjˈdʲɵm']
      const transliteratedWords: string[] = ['segodnya', 'mi', 'poidem']

      const result: WordPairWithIpaAndTransliteration[] =
        addIpaAndTransliterationToPairsWithAlignmentThatHaveExpectedWords(wordPairs, ipaWords, transliteratedWords)
      expect(result).toEqual([
        {
          confidence: 0.3,
          actualWord: 'сегодня',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          expectedWord: 'сегодня',
          expectedStartTimeInMs: 0,
          expectedEndTimeInMs: 100,
          ipa: 'sʲɪˈvodnʲə',
          transliteration: 'segodnya',
        },
        {
          confidence: 0.4,
          actualWord: 'мы',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          expectedWord: 'мы',
          expectedStartTimeInMs: 101,
          expectedEndTimeInMs: 200,
          ipa: 'mɨ',
          transliteration: 'mi',
        },
        {
          confidence: null,
          actualWord: 'мы',
          actualStartTimeInSeconds: null,
          actualEndTimeInSeconds: null,
          expectedWord: null,
          expectedStartTimeInMs: null,
          expectedEndTimeInMs: null,
        },
        {
          confidence: 0.5,
          actualWord: 'пойдем',
          actualStartTimeInSeconds: 0.2,
          actualEndTimeInSeconds: 0.3,
          expectedWord: 'пойдем',
          expectedStartTimeInMs: 201,
          expectedEndTimeInMs: 300,
          ipa: 'pɐjˈdʲɵm',
          transliteration: 'poidem',
        },
      ])
    })
  })
})
