import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { buildTranslationExercisePath, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { TranslationExerciseView } from './translation-exercise-view.tsx'
import { useStartTranslationExercise } from '@/hooks/api/translation-exercise/translation-exercise-hooks.ts'
import { TranslationExercise } from '@/hooks/api/translation/translation-hooks'

export const NewTranslationExerciseView = () => {
  const navigate = useNavigate()
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const motherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const dialect = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)

  const [generatedExercise, setGeneratedExercise] = useState<TranslationExercise | undefined>(undefined)

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { mutate: generateExercise, isPending: isGenerating } = useStartTranslationExercise()

  useEffect(() => {
    generateExercise(
      { studyLanguage, motherLanguage, dialect },
      {
        onSuccess: (response) => {
          setGeneratedExercise(response.data)

          navigate(buildTranslationExercisePath(response.data.id), {
            replace: true,
          })
        },
        onError: () => {
          navigate(ROUTE_PATHS.DASHBOARD)
        },
      }
    )
  }, [generateExercise, navigate, studyLanguage, motherLanguage, dialect])

  return <TranslationExerciseView currentExercise={generatedExercise} isLoading={isGenerating || !generatedExercise} />
}
