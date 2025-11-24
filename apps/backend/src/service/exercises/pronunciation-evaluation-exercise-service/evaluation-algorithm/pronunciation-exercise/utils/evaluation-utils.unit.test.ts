import { describe, expect, test } from 'vitest'
import { _getMatchedIndicesPairs, getAllPairs, getEvaluationScoreInPercentage } from './evaluation-utils'
import { WordPair } from '../../types/evaluation-types'
import { _getCleanWords } from '@yourbestaccent/core/utils/text-utils'
import { LangCode } from '@yourbestaccent/core/constants/lang-codes'

describe('evaluation utils', () => {
  describe('getCleanWords for:', () => {
    test('The sun is shining. The weather is sweet. Makes you wanna move your dancing feet.', () => {
      const result = _getCleanWords([
        'The',
        'sun',
        'is',
        'shining.',
        'The',
        'weather',
        'is',
        'sweet.',
        'Makes',
        'you',
        'wanna',
        'move',
        'your',
        'dancing',
        'feet.',
      ])
      expect(result).toEqual([
        'The',
        'sun',
        'is',
        'shining',
        'The',
        'weather',
        'is',
        'sweet',
        'Makes',
        'you',
        'wanna',
        'move',
        'your',
        'dancing',
        'feet',
      ])
    })
  })

  describe('createMappings for:', () => {
    test('[a] and [b]', () => {
      const result = _getMatchedIndicesPairs(['a'], ['b'])
      expect(result).toEqual([])
    })

    test('[a] and [a]', () => {
      const result = _getMatchedIndicesPairs(['a'], ['a'])
      expect(result).toEqual([[0, 0]])
    })

    test('[a] and [b]', () => {
      const result = _getMatchedIndicesPairs(['a'], ['b'])
      expect(result).toEqual([])
    })

    test('[a, b] and [b]', () => {
      const result = _getMatchedIndicesPairs(['a', 'b'], ['b'])
      expect(result).toEqual([[1, 0]])
    })

    test('[b] and [a, b]', () => {
      const result = _getMatchedIndicesPairs(['b'], ['a', 'b'])
      expect(result).toEqual([[0, 1]])
    })

    test('[a] and [a, b]', () => {
      const result = _getMatchedIndicesPairs(['a'], ['a', 'b'])
      expect(result).toEqual([[0, 0]])
    })

    test('[a, b] and [a]', () => {
      const result = _getMatchedIndicesPairs(['a', 'b'], ['a'])
      expect(result).toEqual([[0, 0]])
    })

    test('[a, b, c] and [b, c]', () => {
      const result = _getMatchedIndicesPairs(['a', 'b', 'c'], ['b', 'c'])
      expect(result).toEqual([
        [1, 0],
        [2, 1],
      ])
    })

    test('[a, b, c] and [b, c, a]', () => {
      const result = _getMatchedIndicesPairs(['a', 'b', 'c'], ['b', 'c', 'a'])
      expect(result).toEqual([
        [1, 0],
        [2, 1],
      ])
    })

    test('[a, b] and [a, b]', () => {
      const result = _getMatchedIndicesPairs(['a', 'b'], ['a', 'b'])
      expect(result).toEqual([
        [0, 0],
        [1, 1],
      ])
    })

    test('[a, b, c] and [b, c, a]', () => {
      const result = _getMatchedIndicesPairs(['a', 'b', 'c'], ['b', 'c', 'a'])
      expect(result).toEqual([
        [1, 0],
        [2, 1],
      ])
    })
  })

  describe('getEvaluationScore', () => {
    test('horrible pronunciation', () => {
      const result: WordPair[] = getAllPairs(
        'the dog',
        [
          { actualWord: 'de', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 0.1 },
          { actualWord: 'dig', actualStartTimeInSeconds: 0.1, actualEndTimeInSeconds: 0.2, confidence: 0.1 },
        ],
        LangCode.ENGLISH
      )
      expect(getEvaluationScoreInPercentage(result)).toBe(0)
    })
    test('bad pronunciation', () => {
      const result: WordPair[] = getAllPairs(
        'the dog',
        [
          { actualWord: 'the', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 0.1 },
          { actualWord: 'dog', actualStartTimeInSeconds: 0.1, actualEndTimeInSeconds: 0.2, confidence: 0.1 },
        ],
        LangCode.ENGLISH
      )
      expect(getEvaluationScoreInPercentage(result)).toBe(33.33)
    })
    test('so so pronunciation', () => {
      const result: WordPair[] = getAllPairs(
        'the dog',
        [
          { actualWord: 'the', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 1 },
          { actualWord: 'dog', actualStartTimeInSeconds: 0.1, actualEndTimeInSeconds: 0.2, confidence: 0.5 },
        ],
        LangCode.ENGLISH
      )
      expect(getEvaluationScoreInPercentage(result)).toBe(66.67)
    })
    test('excellent pronunciation', () => {
      const result: WordPair[] = getAllPairs(
        'the dog',
        [
          { actualWord: 'the', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 1 },
          { actualWord: 'dog', actualStartTimeInSeconds: 0.1, actualEndTimeInSeconds: 0.2, confidence: 1 },
        ],
        LangCode.ENGLISH
      )
      expect(getEvaluationScoreInPercentage(result)).toBe(100)
    })
  })

  describe('getAllPairs for:', () => {
    test('"пошел" and "пошёл"', () => {
      const result: WordPair[] = getAllPairs(
        'пошел',
        [{ actualWord: 'пошёл', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 1 }],
        LangCode.RUSSIAN
      )
      expect(result).toEqual([
        {
          expectedWord: 'пошел',
          actualWord: 'пошёл',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 1,
        },
      ])
    })

    test("you're and you’re", () => {
      const result: WordPair[] = getAllPairs(
        "you're",
        [{ actualWord: 'you’re', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 1 }],
        LangCode.ENGLISH
      )
      expect(result).toEqual([
        {
          expectedWord: "you're",
          actualWord: 'you’re',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 1,
        },
      ])
    })

    test('"dog" and "dog"', () => {
      const result: WordPair[] = getAllPairs(
        'dog',
        [{ actualWord: 'dog', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 1 }],
        LangCode.ENGLISH
      )
      expect(result).toEqual([
        {
          expectedWord: 'dog',
          actualWord: 'dog',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 1,
        },
      ])
    })

    test('"Я англієць" and "Я китаєць."', () => {
      const result: WordPair[] = getAllPairs(
        'Я англієць',
        [
          { actualWord: 'Я', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 0.3 },
          { actualWord: 'китаєць.', actualStartTimeInSeconds: 0.1, actualEndTimeInSeconds: 0.2, confidence: 0.4 },
        ],
        LangCode.RUSSIAN
      )
      expect(result).toEqual([
        {
          expectedWord: 'Я',
          actualWord: 'Я',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 0.3,
        },
        {
          expectedWord: 'англієць',
          actualWord: 'китаєць.',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          confidence: null,
        },
      ])
    })

    test('"I did go eat my food" and "I go and I did eat my food"', () => {
      const result: WordPair[] = getAllPairs(
        'I did go eat my food',
        [
          { actualWord: 'I', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.2, confidence: 0.2 },
          { actualWord: 'go', actualStartTimeInSeconds: 0.2, actualEndTimeInSeconds: 0.3, confidence: 0.1 },
          { actualWord: 'and', actualStartTimeInSeconds: 0.3, actualEndTimeInSeconds: 0.4, confidence: 0.1 },
          { actualWord: 'I', actualStartTimeInSeconds: 0.4, actualEndTimeInSeconds: 0.5, confidence: 0.1 },
          { actualWord: 'did', actualStartTimeInSeconds: 0.5, actualEndTimeInSeconds: 0.6, confidence: 0.1 },
          { actualWord: 'eat', actualStartTimeInSeconds: 0.6, actualEndTimeInSeconds: 0.7, confidence: 0.1 },
          { actualWord: 'my', actualStartTimeInSeconds: 0.7, actualEndTimeInSeconds: 0.8, confidence: 0.1 },
          { actualWord: 'food', actualStartTimeInSeconds: 0.8, actualEndTimeInSeconds: 0.9, confidence: 0.1 },
        ],
        LangCode.ENGLISH
      )
      expect(result).toEqual([
        {
          expectedWord: 'I',
          actualWord: 'I',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.2,
          confidence: 0.2,
        },
        {
          expectedWord: 'did',
          actualWord: null,
          actualStartTimeInSeconds: null,
          actualEndTimeInSeconds: null,
          confidence: null,
        },
        {
          expectedWord: 'go',
          actualWord: 'go',
          actualStartTimeInSeconds: 0.2,
          actualEndTimeInSeconds: 0.3,
          confidence: 0.1,
        },
        {
          actualWord: 'and',
          confidence: null,
          actualStartTimeInSeconds: 0.3,
          actualEndTimeInSeconds: 0.4,
          expectedWord: null,
        },
        {
          actualWord: 'I',
          confidence: null,
          actualStartTimeInSeconds: 0.4,
          actualEndTimeInSeconds: 0.5,
          expectedWord: null,
        },
        {
          actualWord: 'did',
          confidence: null,
          actualStartTimeInSeconds: 0.5,
          actualEndTimeInSeconds: 0.6,
          expectedWord: null,
        },
        {
          expectedWord: 'eat',
          actualWord: 'eat',
          actualStartTimeInSeconds: 0.6,
          actualEndTimeInSeconds: 0.7,
          confidence: 0.1,
        },
        {
          expectedWord: 'my',
          actualWord: 'my',
          actualStartTimeInSeconds: 0.7,
          actualEndTimeInSeconds: 0.8,
          confidence: 0.1,
        },
        {
          expectedWord: 'food',
          actualWord: 'food',
          actualStartTimeInSeconds: 0.8,
          actualEndTimeInSeconds: 0.9,
          confidence: 0.1,
        },
      ])
    })

    test('"I went there, and I ate" and "Ay want go there I ate"', () => {
      const result: WordPair[] = getAllPairs(
        'I went   there and ate',
        [
          { actualWord: 'Ay', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.1, confidence: 0.3 },
          { actualWord: 'want', actualStartTimeInSeconds: 0.1, actualEndTimeInSeconds: 0.2, confidence: 0.4 },
          { actualWord: 'go', actualStartTimeInSeconds: 0.2, actualEndTimeInSeconds: 0.3, confidence: 0.5 },
          { actualWord: 'there', actualStartTimeInSeconds: 0.3, actualEndTimeInSeconds: 0.4, confidence: 0.6 },
          { actualWord: 'ate.', actualStartTimeInSeconds: 0.4, actualEndTimeInSeconds: 0.5, confidence: 0.7 },
        ],
        LangCode.ENGLISH
      )
      expect(result).toEqual([
        {
          expectedWord: 'I',
          actualWord: 'Ay',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: null,
        },
        {
          expectedWord: 'went',
          actualWord: 'want',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          confidence: null,
        },
        {
          expectedWord: null,
          actualWord: 'go',
          actualStartTimeInSeconds: 0.2,
          actualEndTimeInSeconds: 0.3,
          confidence: null,
        },
        {
          expectedWord: 'there',
          actualWord: 'there',
          actualStartTimeInSeconds: 0.3,
          actualEndTimeInSeconds: 0.4,
          confidence: 0.6,
        },
        {
          expectedWord: 'and',
          actualStartTimeInSeconds: null,
          actualEndTimeInSeconds: null,
          actualWord: null,
          confidence: null,
        },
        {
          expectedWord: 'ate',
          actualWord: 'ate.',
          actualStartTimeInSeconds: 0.4,
          actualEndTimeInSeconds: 0.5,
          confidence: 0.7,
        },
      ])
    })

    test('"I went" and "I go"', () => {
      const result: WordPair[] = getAllPairs(
        'I went',
        [
          { actualWord: 'I', actualStartTimeInSeconds: 0, actualEndTimeInSeconds: 0.2, confidence: 0.2 },
          { actualWord: 'go', actualStartTimeInSeconds: 0.2, actualEndTimeInSeconds: 0.3, confidence: 0.1 },
        ],
        LangCode.ENGLISH
      )
      expect(result).toEqual([
        {
          expectedWord: 'I',
          actualWord: 'I',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.2,
          confidence: 0.2,
        },
        {
          expectedWord: 'went',
          actualWord: 'go',
          actualStartTimeInSeconds: 0.2,
          actualEndTimeInSeconds: 0.3,
          confidence: null,
        },
      ])
    })
  })
})
