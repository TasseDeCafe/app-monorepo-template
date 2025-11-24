import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { CorrectGrammarAndExplainResult } from './correct-grammar-and-explain-mistakes'

export const mockCorrectGrammarAndExplainMistakes = async (
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  motherLanguage: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language: LangCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dialect: DialectCode
): Promise<CorrectGrammarAndExplainResult> => {
  if (!text) {
    return {
      correction: null,
      explanation: null,
    }
  }
  return {
    correction: text,
    explanation: text.length > 10 ? 'This is a mock explanation of grammar mistakes' : null,
  }
}
