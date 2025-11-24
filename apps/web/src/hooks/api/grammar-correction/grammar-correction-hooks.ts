import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

export const useGrammarCorrection = (
  content: string,
  motherLanguage: LangCode,
  messageLanguage: LangCode,
  dialect: DialectCode,
  isEnabled: boolean
) => {
  const { t } = useLingui()

  return useQuery(
    orpcQuery.grammarCorrection.correctGrammarAndExplain.queryOptions({
      input: {
        text: content,
        motherLanguage,
        language: messageLanguage,
        dialect,
      },
      queryKey: [QUERY_KEYS.GRAMMAR_CHECK, content, motherLanguage, messageLanguage, dialect],
      select: (response) => response.data,
      enabled: isEnabled,
      meta: {
        errorMessage: t`Failed to check grammar, try again later`,
      },
    })
  )
}
