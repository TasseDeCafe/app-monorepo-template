import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { addFrenchPunctuationSpaces, removeFrenchPunctuationSpaces } from './french-text-utils'
import {
  ActualWordWithConfidenceAndAlignment,
  WordIndicesPair,
  WordPair,
  WordPairWithAlignment,
} from '../../types/evaluation-types'
import { removePunctuationFromBeginningAndEnd, splitByWhiteSpace } from '@yourbestaccent/core/utils/text-utils'
import { areWordsEqual } from '@yourbestaccent/core/exercises/pronunciation-exercise/utils/evaluation-utils'
import { CONFIDENCE_THRESHOLDS } from '@yourbestaccent/core/exercises/pronunciation-exercise/evaluation/score/constants'

// we could theoretically pass the full pair properties like expected word, timestamps etc. to this function,
// but this would mix the algorithm logic with the data structure logic, so we decided to keep it simple
// this algorithm just matches indices of the words from expected text to actual text, so that as many words as possible
// are matched. So for example an input like
// "I like big red apples" and "I like green apples" would return
// [[0, 0], [1, 1], [4, 3]
export const _getMatchedIndicesPairs = (words1: string[], words2: string[]): WordIndicesPair[] => {
  const dp: number[][] = Array.from({ length: words1.length + 1 }, () => Array(words2.length + 1).fill(0))
  // building a two-dimensional array of parents is a standard thing to do in this kind of problems [*]
  const parent: (WordIndicesPair | null)[][] = Array.from({ length: words1.length + 1 }, () =>
    Array(words2.length + 1).fill(null)
  )

  // a dynamic programming approach
  // this is the optimal approach
  for (let i: number = 1; i <= words1.length; i++) {
    for (let j: number = 1; j <= words2.length; j++) {
      // note that we use a more complex comparison here, so that words like: "Car" and "car", or "you're" and "you're" are equal
      // so that for "I like big red aPpLes" and "i like green apples" we still get
      // [[0, 0], [1, 1], [4, 3]
      if (areWordsEqual(words1[i - 1], words2[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        parent[i][j] = [i - 1, j - 1]
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        dp[i][j] = dp[i - 1][j]
        parent[i][j] = [i - 1, j]
      } else {
        dp[i][j] = dp[i][j - 1]
        parent[i][j] = [i, j - 1]
      }
    }
  }

  let i: number = words1.length
  let j: number = words2.length
  const mappings: WordIndicesPair[] = []

  // [*] once the parent array is filled we rebuild the optimal path by checking current pair's parent,
  // and then it's parent and so on
  while (i > 0 && j > 0) {
    const [prevI, prevJ]: [number, number] = parent[i][j] as WordIndicesPair
    if (prevI !== i && prevJ !== j) {
      mappings.push([prevI, prevJ])
    }
    i = prevI
    j = prevJ
  }

  // we rebuild the parent array in reverse order, so we actually have to reverse it to get the actual solution
  return mappings.reverse()
}

export const preprocessAndSplitExpectedText = (
  expectedText: string,
  studyLanguage: SupportedStudyLanguage
): string[] => {
  if (studyLanguage === LangCode.FRENCH) {
    // we temporarily glue together stuff like:
    // "« and »" into "«and»", "tu ?" into "tu?", etc.
    // we have to glue these because word splitting relies on white spaces
    const withSpacesRemoved = removeFrenchPunctuationSpaces(expectedText)
    return splitByWhiteSpace(withSpacesRemoved)
  } else {
    return splitByWhiteSpace(expectedText)
  }
}

export const revertPreprocessingForExpectedWord = (word: string, studyLanguage: SupportedStudyLanguage): string => {
  if (studyLanguage === LangCode.FRENCH) {
    return addFrenchPunctuationSpaces(word)
  } else {
    return word
  }
}

export const revertPreprocessingForExpectedText = (
  wordPairs: WordPair[],
  studyLanguage: SupportedStudyLanguage
): WordPair[] => {
  return wordPairs.map((pair) => {
    if (pair.expectedWord) {
      return {
        ...pair,
        expectedWord: revertPreprocessingForExpectedWord(pair.expectedWord, studyLanguage),
      }
    } else {
      return pair
    }
  })
}

export const getAllPairs = (
  expectedDirtyText: string,
  actualDirtyWordsWithConfidenceAndAlignments: ActualWordWithConfidenceAndAlignment[],
  studyLanguage: SupportedStudyLanguage
): WordPair[] => {
  // we need to prepare our text for matching algorithm [*]
  const expectedWords: string[] = preprocessAndSplitExpectedText(expectedDirtyText, studyLanguage)

  const actualWords: string[] = actualDirtyWordsWithConfidenceAndAlignments.map(
    (actualWordWithConfidence) => actualWordWithConfidence.actualWord
  )
  const mappings: WordIndicesPair[] = _getMatchedIndicesPairs(expectedWords, actualWords)

  const result: WordPair[] = []
  let i: number = 0,
    j: number = 0
  // loop 1
  for (let m: number = 0; m < mappings.length; m++) {
    const mapping: WordIndicesPair = mappings[m]
    // loop 2
    // add a pair with matching actual and expected words
    for (; i < mapping[0] && j < mapping[1]; i++, j++) {
      result.push({
        expectedWord: expectedWords[i],
        actualWord: actualWords[j],
        actualStartTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualStartTimeInSeconds,
        actualEndTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualEndTimeInSeconds,
        confidence: null,
      })
    }
    // loop 3
    // add a pair with expected word only if it has no matching actual word
    for (; i < mapping[0]; i++) {
      result.push({
        expectedWord: expectedWords[i],
        actualWord: null,
        actualStartTimeInSeconds: null,
        actualEndTimeInSeconds: null,
        confidence: null,
      })
    }
    // loop 4
    // add a pair with actual word only if it has no matching expected word
    for (; j < mapping[1]; j++) {
      result.push({
        expectedWord: null,
        actualWord: actualWords[j],
        actualStartTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualStartTimeInSeconds,
        actualEndTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualEndTimeInSeconds,
        confidence: null,
      })
    }
    // I could not figure out what it does, but removing it breaks the tests
    // if anyone figures it out, please document it and let me know hahaha (Kamil)
    result.push({
      expectedWord: expectedWords[mapping[0]],
      actualWord: actualWords[mapping[1]],
      actualStartTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[mapping[1]].actualStartTimeInSeconds,
      actualEndTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[mapping[1]].actualEndTimeInSeconds,
      confidence: actualDirtyWordsWithConfidenceAndAlignments[j].confidence,
    })
    i++
    j++
  }
  // loop 5
  // after creating all the pairs from matchings, we need to add the rest of the pairs
  // we disregard that they don't match each other
  // this way we get the shortest number of pairs possible. In the majority of cases this works like a charm for the user
  for (; i < expectedWords.length && j < actualWords.length; i++, j++) {
    result.push({
      expectedWord: expectedWords[i],
      actualWord: actualWords[j],
      actualStartTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualStartTimeInSeconds,
      actualEndTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualEndTimeInSeconds,
      confidence: null,
    })
  }
  // loop 6
  // we build pairs with words that do not match in the loop 5, but if there are not enough actual words,
  // we still have to build pairs with expected words that left
  for (; i < expectedWords.length; i++) {
    result.push({
      expectedWord: expectedWords[i],
      actualWord: null,
      actualStartTimeInSeconds: null,
      actualEndTimeInSeconds: null,
      confidence: null,
    })
  }
  // loop 7
  // same as above but for actual words
  // we build pairs with words that do not match in the loop 5, but if there are not enough expected words,
  // we still have to build pairs with actual words that left
  for (; j < actualWords.length; j++) {
    result.push({
      expectedWord: null,
      actualWord: actualWords[j],
      actualStartTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualStartTimeInSeconds,
      actualEndTimeInSeconds: actualDirtyWordsWithConfidenceAndAlignments[j].actualEndTimeInSeconds,
      confidence: null,
    })
  }

  // [*] but later we need to revert the changes we made to the text, so that for example "« and »" is shown in a single
  // word pair on frontend
  return revertPreprocessingForExpectedText(result, studyLanguage)
}

export const getEvaluationScoreInPercentage = (wordPairs: WordPair[]): number => {
  const calculateScoreForSinglePair = (pair: WordPair): number => {
    const confidence = pair.confidence ? pair.confidence * 100 : null
    if (!confidence) {
      return 0
    } else if (CONFIDENCE_THRESHOLDS.EXCELLENT_CONFIDENCE <= confidence) {
      return 1
    } else if (
      CONFIDENCE_THRESHOLDS.MEDIOCRE_CONFIDENCE <= confidence &&
      confidence < CONFIDENCE_THRESHOLDS.EXCELLENT_CONFIDENCE
    ) {
      return 0.6666666
    } else {
      return 0.3333333
    }
  }
  const totalWords: number = wordPairs.length
  const sum: number = wordPairs.reduce((acc: number, pair: WordPair) => acc + calculateScoreForSinglePair(pair), 0)
  const score: number = (sum / totalWords) * 100
  return parseFloat(score.toFixed(2))
}

export const getUserPronunciations = (wordPairsWithAlignment: WordPairWithAlignment[]) => {
  return wordPairsWithAlignment
    .filter((pair) => pair.expectedWord !== null)
    .map((pair) => {
      const confidence = pair.confidence === null ? 0 : pair.confidence
      return {
        wordWithoutPunctuation: removePunctuationFromBeginningAndEnd(pair.expectedWord as string),
        confidence: confidence,
      }
    })
}
