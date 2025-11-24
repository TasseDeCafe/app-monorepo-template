import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'

export const mockTranslateSelection = async (
  originalSentence: string,
  translationSentence: string,
  selectionChunks: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectionPositions: number[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sourceDialect: DialectCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  targetLanguage: LangCode
): Promise<string | null> => {
  // Mock translation by joining chunks with " ... " to simulate translation of disconnected parts
  return selectionChunks.map((chunk) => `[${chunk} translated]`).join(' ... ')
}
