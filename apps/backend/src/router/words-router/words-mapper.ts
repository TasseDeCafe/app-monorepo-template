import { DbWordPronouncedCorrectly } from '../../transport/database/words/words-repository'
import { CorrectUserPronunciation } from '@yourbestaccent/api-client/orpc-contracts/words-contract'

export const mapDbWordsPronouncedCorrectly = (
  dbWordsPronouncedCorrectly: DbWordPronouncedCorrectly[]
): CorrectUserPronunciation[] => {
  return dbWordsPronouncedCorrectly.map((dbWordPronouncedCorrectly: DbWordPronouncedCorrectly) => {
    const date = dbWordPronouncedCorrectly.date_of_first_high_confidence_pronunciation
    return {
      word: dbWordPronouncedCorrectly.orthographic_form,
      language: dbWordPronouncedCorrectly.language,
      dateOfFirstTimePronouncedCorrectly: date.toISOString(),
    }
  })
}
