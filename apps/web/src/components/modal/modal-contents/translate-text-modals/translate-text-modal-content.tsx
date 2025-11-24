import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys.ts'
import {
  selectAccountAccessToken,
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes.ts'
import { TranslateTextModalContentCommon } from './translate-text-modal-content-common.tsx'
import { useTranslateText } from '@/hooks/api/translation/translation-hooks'

export const TranslateTextModalContent = () => {
  const queryClient = useQueryClient()
  const accessToken: string = useSelector(selectAccountAccessToken)
  const dialect: DialectCode = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const motherLanguage: LangCode = useSelector(selectMotherLanguageOrEnglish)

  const { data: currentExerciseText, isFetching: isFetchingExerciseText } = useQuery<string>({
    queryKey: [QUERY_KEYS.EXERCISE_TEXT],
    queryFn: () => queryClient.getQueryData<string>([QUERY_KEYS.EXERCISE_TEXT]) ?? '',
    enabled: true,
  })

  const expectedText = currentExerciseText ?? ''

  const { data: textTranslationData, isFetching: isFetchingTextTranslation } = useTranslateText(
    expectedText,
    dialect,
    motherLanguage,
    accessToken
  )

  const translatedText: string = textTranslationData?.translation ?? ''

  return (
    <TranslateTextModalContentCommon
      expectedText={expectedText}
      translatedText={translatedText}
      isFetchingExerciseText={isFetchingExerciseText}
      isFetchingTextTranslation={isFetchingTextTranslation}
    />
  )
}
