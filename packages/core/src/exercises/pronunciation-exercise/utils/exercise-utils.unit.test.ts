import { describe, expect, test } from 'vitest'
import { addTimeStampsOfExpectedWordsToPairs } from './exercise-utils'
import { AlignmentData } from '../../../common-types/alignment-types'
import { WordPair, WordPairWithAlignment } from '../../types/evaluation-types'

describe('evaluation utils', () => {
  describe('addTimeStampsOfExpectedWordsToPairs', () => {
    test('tú sí', () => {
      const alignmentData: AlignmentData = {
        chars: ['t', 'ú', 's', 'í'],
        charStartTimesMs: [0, 35, 93, 302],
        charDurationsMs: [35, 58, 209, 70],
      }
      const pairs: WordPair[] = [
        {
          expectedWord: 'tú',
          actualWord: 'tú',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 0.6,
        },
        {
          expectedWord: 'sí',
          actualWord: 'sí',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          confidence: 0.7,
        },
      ]
      const result: WordPairWithAlignment[] = addTimeStampsOfExpectedWordsToPairs(pairs, alignmentData)
      expect(result).toEqual([
        {
          expectedWord: 'tú',
          expectedEndTimeInMs: 93,
          expectedStartTimeInMs: 0,
          actualWord: 'tú',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 0.6,
        },
        {
          expectedWord: 'sí',
          expectedEndTimeInMs: Infinity,
          expectedStartTimeInMs: 93,
          actualWord: 'sí',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          confidence: 0.7,
        },
      ])
    })

    test('Tu ? Moi ?', () => {
      const alignmentData: AlignmentData = {
        chars: ['Ç', 'a', ' ', '?', ' ', 'M', 'o', 'i', ' ', '?'],
        charStartTimesMs: [0, 2, 5, 8, 12, 17, 23, 30, 38, 47],
        charDurationsMs: [2, 3, 3, 4, 5, 6, 7, 8, 9, 10],
      }
      const pairs: WordPair[] = [
        {
          expectedWord: 'Ça ?',
          actualWord: 'Ça',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 0.6,
        },
        {
          expectedWord: 'Moi ?',
          actualWord: 'Moi',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          confidence: 0.7,
        },
      ]
      const result: WordPairWithAlignment[] = addTimeStampsOfExpectedWordsToPairs(pairs, alignmentData)
      expect(result).toEqual([
        {
          expectedWord: 'Ça ?',
          expectedStartTimeInMs: 0,
          expectedEndTimeInMs: 17,
          actualWord: 'Ça',
          actualStartTimeInSeconds: 0,
          actualEndTimeInSeconds: 0.1,
          confidence: 0.6,
        },
        {
          expectedWord: 'Moi ?',
          expectedStartTimeInMs: 17,
          expectedEndTimeInMs: Infinity,
          actualWord: 'Moi',
          actualStartTimeInSeconds: 0.1,
          actualEndTimeInSeconds: 0.2,
          confidence: 0.7,
        },
      ])
    })
  })
})
