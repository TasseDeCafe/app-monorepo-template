// internal to evaluation-utils here
import { WordPair, WordPairWithAlignment } from '../../types/evaluation-types'
import { AlignmentData } from '../../../common-types/alignment-types'

export const getWordStartTimes = (pairs: WordPair[], alignmentData: AlignmentData): number[] => {
  // these tokens are later searched in the alignment data
  // for safety we lower case the tokens, and we do the same for the characters returned from the alignment data
  const tokens: string[] = pairs
    .map((pair) => pair.expectedWord)
    .filter((word): word is string => word !== null) // we need the "word is string" because Typescript complains about token being possibly null, this is not the case though, as we filter out nulls here
    .map((token) => token.toLowerCase())

  const { chars, charStartTimesMs } = alignmentData
  const text = chars.join('').toLowerCase()

  const wordStartTimes: number[] = []
  let currentIndex = 0

  for (const token of tokens) {
    const startIndex = text.indexOf(token, currentIndex)
    if (startIndex !== -1) {
      const tokenStartTime = charStartTimesMs[startIndex]
      wordStartTimes.push(tokenStartTime)
      currentIndex = startIndex + token.length
    }
  }
  return wordStartTimes
}
export const addTimeStampsOfExpectedWordsToPairs = (
  pairs: WordPair[],
  alignmentData: AlignmentData
): WordPairWithAlignment[] => {
  const result: WordPairWithAlignment[] = []
  const wordStartTimes: number[] = getWordStartTimes(pairs, alignmentData)

  let wordIndex: number = 0
  for (const pair of pairs) {
    if (pair.expectedWord) {
      const startTime = wordStartTimes[wordIndex]
      const endTime: number = wordStartTimes[wordIndex + 1] ?? Infinity
      result.push({
        expectedWord: pair.expectedWord,
        actualWord: pair.actualWord,
        actualStartTimeInSeconds: pair.actualStartTimeInSeconds,
        actualEndTimeInSeconds: pair.actualEndTimeInSeconds,
        expectedStartTimeInMs: startTime,
        expectedEndTimeInMs: endTime,
        confidence: pair.confidence,
      })
      wordIndex++
    } else {
      result.push({
        expectedWord: null,
        actualWord: pair.actualWord,
        actualStartTimeInSeconds: pair.actualStartTimeInSeconds,
        actualEndTimeInSeconds: pair.actualEndTimeInSeconds,
        expectedStartTimeInMs: null,
        expectedEndTimeInMs: null,
        confidence: pair.confidence,
      })
    }
  }

  return result
}
