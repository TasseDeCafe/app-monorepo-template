import {
  MAX_EXERCISE_WORD_LENGTH,
  MIN_EXERCISE_WORD_LENGTH,
} from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'

export type Length = {
  name: string
  range: [number, number]
  visualWidth: number
}

export const SHORT_EXERCISE_LENGTH_UPPER_BOUND = 10

export const createLengths = (shortName: string, mediumName: string, longName: string): Length[] => [
  {
    name: shortName,
    range: [MIN_EXERCISE_WORD_LENGTH, SHORT_EXERCISE_LENGTH_UPPER_BOUND],
    visualWidth: 15,
  },
  { name: mediumName, range: [SHORT_EXERCISE_LENGTH_UPPER_BOUND + 1, 25], visualWidth: 15 },
  { name: longName, range: [31, MAX_EXERCISE_WORD_LENGTH], visualWidth: 15 },
]

export const getCurrentLength = (position: number, lengths: Length[]): Length => {
  const level = lengths.find((length) => position >= length.range[0] && position <= length.range[1])
  return level || lengths[lengths.length - 1] // Return the last level if no match is found
}
