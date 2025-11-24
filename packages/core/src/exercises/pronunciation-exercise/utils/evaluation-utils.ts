import { LangCode } from '../../../constants/lang-codes'
import { removePunctuationFromBeginningAndEnd, splitByWhiteSpace } from '../../../utils/text-utils'
import { addFrenchPunctuationSpaces, removeFrenchPunctuationSpaces } from './french-text-utils'

// todo consider passing language param too once we have more ambiguous cases
export const areWordsEqual = (word1: string, word2: string): boolean => {
  const RUSSIAN_E_WITH_DOTS = 'ё' // don't confuse with French e with dots, example: noël
  const RUSSIAN_E = 'е'
  // during wykop3 campaign a user reported an error related to this
  // more on https://www.notion.so/grammarians/Sanitize-the-apostrophes-da96822ef8324641842ea1c4c6174514?d=37075464b7ef4ab1b545f786364fa689
  const APOSTROPHE = "'"
  const WEIRD_APOSTROPHE = '’'
  return (
    removePunctuationFromBeginningAndEnd(
      word1.replace(RUSSIAN_E_WITH_DOTS, RUSSIAN_E).replace(APOSTROPHE, WEIRD_APOSTROPHE).toLowerCase()
    ) ===
    removePunctuationFromBeginningAndEnd(
      word2.replace(RUSSIAN_E_WITH_DOTS, RUSSIAN_E).replace(APOSTROPHE, WEIRD_APOSTROPHE).toLowerCase()
    )
  )
}


export const splitTextIntoWords = (text: string, language: LangCode): string[] => {
  return preprocessAndSplitExpectedText(text, language).map((word) =>
    revertPreprocessingForExpectedWord(word, language)
  )
}

export const preprocessAndSplitExpectedText = (expectedText: string, language: LangCode): string[] => {
  if (language === LangCode.FRENCH) {
    // we temporarily glue together stuff like:
    // "« and »" into "«and»", "tu ?" into "tu?", etc.
    // we have to glue these because word splitting relies on white spaces
    const withSpacesRemoved = removeFrenchPunctuationSpaces(expectedText)
    return splitByWhiteSpace(withSpacesRemoved)
  } else {
    return splitByWhiteSpace(expectedText)
  }
}

export const revertPreprocessingForExpectedWord = (word: string, language: LangCode): string => {
  if (language === LangCode.FRENCH) {
    return addFrenchPunctuationSpaces(word)
  } else {
    return word
  }
}
