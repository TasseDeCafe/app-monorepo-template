import {
  DialectCode,
  LANGUAGES_TO_DIALECT_MAP,
  SupportedStudyLanguage,
} from '@yourbestaccent/core/constants/lang-codes'
import { useEffect, useState } from 'react'
import { accountActions, selectStudyLanguageOrEnglish } from '@/state/slices/account-slice.ts'
import { useDispatch, useSelector } from 'react-redux'
import { NavigationButton } from '../navigation-button.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { DialectCard } from './dialect-card.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { usePatchStudyDialect } from '@/hooks/api/user/user-hooks'
import { useLingui } from '@lingui/react/macro'

export const ChooseDialectView = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const studyLanguageOrEnglish: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const [selectedDialect, setSelectedDialect] = useState<DialectCode | null>(null)

  const { mutate, isPending } = usePatchStudyDialect({
    onSuccess: () => {
      if (selectedDialect) {
        dispatch(accountActions.setDialect(selectedDialect))
        navigate(ROUTE_PATHS.TRANSLATION_EXERCISE_START)
      }
    },
  })

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const onPreviousClick = () => {
    dispatch(accountActions.resetStudyLanguage())
    navigate(ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE)
  }

  const onNextClick = () => {
    if (selectedDialect) {
      mutate({ studyDialect: selectedDialect })
    }
  }

  const handleDialectClick = (dialect: DialectCode) => {
    if (selectedDialect === dialect) {
      setSelectedDialect(null)
    } else {
      setSelectedDialect(dialect)
    }
  }

  const title = t`Choose the dialect you want to study:`

  return (
    <WithNavbar>
      <div className='flex w-full flex-col'>
        <div className='flex w-full items-center px-4 py-4'>
          <div className='mx-auto flex h-full w-full items-center md:w-3/4 lg:w-2/3 3xl:w-1/2'>
            <button onClick={onPreviousClick} className='text-gray-500 hover:text-gray-700' disabled={isPending}>
              <ArrowLeft size={24} />
            </button>
          </div>
        </div>

        <div className='mb-52 flex justify-center'>
          <div className='flex w-full flex-col items-center gap-y-4 px-4 pt-0 md:w-3/4 lg:w-2/3 3xl:w-1/2'>
            <div className='flex max-w-md flex-col items-center'>
              <h1 className='max-w-xl text-center text-4xl font-bold tracking-tighter'>{title}</h1>
              <span className='text-md max-w-xl text-center tracking-tighter text-gray-400'>
                {t`(You can always change it later)`}
              </span>
            </div>
            <div className='grid w-full grid-cols-1 gap-4 xl:grid-cols-2'>
              {LANGUAGES_TO_DIALECT_MAP[studyLanguageOrEnglish].map((dialect) => (
                <DialectCard
                  key={dialect}
                  dialect={dialect}
                  handleClick={handleDialectClick}
                  isSelected={selectedDialect === dialect}
                />
              ))}
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 w-full bg-gray-50'>
          <div className='pointer-events-none absolute bottom-full left-0 right-0 h-40 bg-gradient-to-b from-transparent to-gray-50' />
          <div className='lg:w-2/2 mx-auto flex w-full px-4 pb-8 pt-4 md:w-3/4 3xl:w-1/2'>
            <NavigationButton
              onClick={onNextClick}
              disabled={!selectedDialect || isPending}
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
