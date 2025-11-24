import { DbSavedWord } from '../../transport/database/saved-words/saved-words-repository'
import { SavedWord } from '@yourbestaccent/api-client/orpc-contracts/saved-words-contract'

export const mapDbSavedWordsToSavedWords = (dbSavedWords: DbSavedWord[]): SavedWord[] => {
  return dbSavedWords.map((dbSavedWord: DbSavedWord) => ({
    word: dbSavedWord.word,
    language: dbSavedWord.language,
  }))
}
