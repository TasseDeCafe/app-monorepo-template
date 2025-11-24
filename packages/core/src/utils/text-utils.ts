const ANY_WHITE_SPACE = /\s+/

export const splitByWhiteSpace = (text: string): string[] => {
  return text.split(ANY_WHITE_SPACE)
}

export const getCleanWordsFromSentence = (actualSentence: string): string[] => {
  const words: string[] = splitByWhiteSpace(actualSentence)
  return _getCleanWords(words)
}

export const _getCleanWords = (actualWords: string[]): string[] => {
  return actualWords.map((word) => removePunctuationFromBeginningAndEnd(word)).filter((word: string) => word.length > 0)
}

const WIDELY_USED_PUNCTUATION_SYMBOLS = ".,!?:;-—'‘’[](){}…/\\&@#%^*+=|~<>_`¡¿"
const SPANISH_PUNCTUATION_SYMBOLS = '¿¡'
const FRENCH_PUNCTUATION_SYMBOLS = '«»'
const POLISH_PUNCTUATION_SYMBOLS = '„“'

const ALL_PUNCTUATION_SYMBOLS: Set<string> = new Set(
  (
    SPANISH_PUNCTUATION_SYMBOLS +
    FRENCH_PUNCTUATION_SYMBOLS +
    POLISH_PUNCTUATION_SYMBOLS +
    WIDELY_USED_PUNCTUATION_SYMBOLS
  ).split('')
)

export const isPunctuationChar = (char: string): boolean => {
  if (char.length !== 1) {
    console.log(`string '${char}' is not a single character`)
  }
  return ALL_PUNCTUATION_SYMBOLS.has(char)
}

const removePunctuationFromBeginning = (text: string): string => {
  for (let i: number = 0; i < text.length; i++) {
    const char: string = text.charAt(i)
    if (!isPunctuationChar(char)) {
      return text.substring(i)
    }
  }
  return ''
}
const reverseString = (text: string) => {
  return text.split('').reverse().join('')
}
const removePunctuationFromEnd = (text: string): string => {
  return reverseString(removePunctuationFromBeginning(reverseString(text)))
}
export const removePunctuationFromBeginningAndEnd = (text: string): string => {
  return removePunctuationFromEnd(removePunctuationFromBeginning(text))
}

const EMOJI_REGEX = /^\p{Emoji}+$/u

export const isEmoji = (text: string): boolean => {
  return EMOJI_REGEX.test(text)
}

export const isOnlyPunctuationOrEmojiOrWhiteSpace = (text: string): boolean => {
  const chars = [...text]

  for (const char of chars) {
    if (!isEmoji(char) && !isPunctuationChar(char) && !/\s/.test(char)) {
      return false
    }
  }
  return true
}
