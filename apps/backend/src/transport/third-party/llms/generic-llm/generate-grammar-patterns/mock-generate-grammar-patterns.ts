import { LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { GenerateGrammarPatternsResult } from './generate-grammar-patterns'

export const mockGenerateGrammarPatterns = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  motherLanguageSentence: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studyLanguageSentence: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studyLanguage: LangCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  motherLanguage: LangCode
): Promise<GenerateGrammarPatternsResult> => {
  return {
    isSuccess: true,
    patterns: [
      {
        structure: 'like to go',
        hint: 'gerne + infinitive',
        concept: 'expressing preference or enjoyment',
      },
      {
        structure: 'on weekends',
        hint: 'am Wochenende',
        concept: 'temporal expression with dative article',
      },
    ],
  }
}
