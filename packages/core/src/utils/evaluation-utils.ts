import {
  WordPairWithAlignment,
  WordPairWithAlignmentAndIpaAndTransliteration,
} from '../exercises/types/evaluation-types'

export const addIpaAndTransliterationToPairsWithAlignmentThatHaveExpectedWords = (
  wordPairsWithAlignment: WordPairWithAlignment[],
  ipaWords: string[],
  transliteratedWords: string[]
): WordPairWithAlignmentAndIpaAndTransliteration[] => {
  const result: WordPairWithAlignmentAndIpaAndTransliteration[] = []
  let ipaCounter = 0
  let transliterationCounter = 0
  for (let i = 0; i < wordPairsWithAlignment.length; i++) {
    const w: WordPairWithAlignmentAndIpaAndTransliteration = wordPairsWithAlignment[i]
    if (w.expectedWord && ipaCounter < ipaWords.length) {
      w.ipa = ipaWords[ipaCounter++]
    }
    if (w.expectedWord && transliterationCounter < transliteratedWords.length) {
      w.transliteration = transliteratedWords[transliterationCounter++]
    }
    result.push(w)
  }
  return result
}
