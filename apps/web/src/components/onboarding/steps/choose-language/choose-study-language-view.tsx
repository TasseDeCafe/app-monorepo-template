import {
  LANGUAGES_WITH_MULTIPLE_DIALECTS,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedStudyLanguage,
} from '@template-app/core/constants/lang-codes'
import { useEffect, useState } from 'react'
import { accountActions } from '@/state/slices/account-slice.ts'
import { useDispatch } from 'react-redux'
import { LanguageCard } from './language-card.tsx'
import { NavigationButton } from '../navigation-button.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { ArrowLeft } from 'lucide-react'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { usePatchStudyLanguage } from '@/hooks/api/user/user-hooks'
import { useLingui } from '@lingui/react/macro'

export const ChooseStudyLanguageView = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [selectedStudyLanguage, setSelectedStudyLanguage] = useState<SupportedStudyLanguage | null>(null)

  const { mutate, isPending } = usePatchStudyLanguage({
    onSuccess: (response) => {
      dispatch(accountActions.setStudyLanguage(response.data.studyLanguage as SupportedStudyLanguage))
      if (selectedStudyLanguage && LANGUAGES_WITH_MULTIPLE_DIALECTS.includes(selectedStudyLanguage)) {
        navigate(ROUTE_PATHS.ONBOARDING_DIALECT)
      } else {
        navigate(ROUTE_PATHS.TRANSLATION_EXERCISE_START)
      }
    },
  })

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const handleLangClick = (lang: SupportedStudyLanguage) => {
    if (selectedStudyLanguage === lang) {
      setSelectedStudyLanguage(null)
    } else {
      setSelectedStudyLanguage(lang)
    }
  }

  const onPreviousClick = () => {
    dispatch(accountActions.resetMotherLanguage())
    navigate(ROUTE_PATHS.ONBOARDING_MOTHER_LANGUAGE)
  }

  const onNextClick = () => {
    if (selectedStudyLanguage) {
      mutate({ studyLanguage: selectedStudyLanguage })
    }
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-col'>
        <div className='flex w-full items-center px-4 py-4'>
          <div className='mx-auto flex h-full w-full items-center md:w-3/4 lg:w-2/3 3xl:w-1/3'>
            <button onClick={onPreviousClick} className='text-gray-500 hover:text-gray-700' disabled={isPending}>
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className='mb-52 flex justify-center'>
          <div className='flex w-full flex-col items-center gap-y-4 px-4 pt-0 md:w-3/4 lg:w-2/3 3xl:w-1/3'>
            <div className='flex max-w-md flex-col items-center'>
              <h1 className='max-w-xl text-center text-4xl font-bold tracking-tighter'>
                {t`Which language do you want to study?`}
              </h1>
              <span className='text-md max-w-xl text-center tracking-tighter text-gray-400'>
                {t`(You can always change it later)`}
              </span>
            </div>
            <div className='grid w-full grid-cols-2 gap-4'>
              {SUPPORTED_STUDY_LANGUAGES.map((lang) => (
                <LanguageCard
                  key={lang}
                  lang={lang}
                  handleClick={() => handleLangClick(lang)}
                  isSelected={selectedStudyLanguage === lang}
                />
              ))}
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 w-full bg-gray-50'>
          <div className='pointer-events-none absolute bottom-full left-0 right-0 h-40 bg-gradient-to-b from-transparent to-gray-50' />
          <div className='lg:w-2/2 mx-auto flex w-full px-4 pb-8 pt-4 md:w-3/4 3xl:w-1/3'>
            <NavigationButton
              onClick={onNextClick}
              disabled={!selectedStudyLanguage || isPending}
              className='w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
            >
              {isPending ? t`Loading...` : t`Next`}
            </NavigationButton>
          </div>
        </div>
      </div>
    </WithNavbar>
  )
}
