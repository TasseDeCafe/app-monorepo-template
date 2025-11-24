import { LangCode, SupportedMotherLanguage } from '@template-app/core/constants/lang-codes'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { accountActions } from '@/state/slices/account-slice'
import { useDispatch } from 'react-redux'
import { LanguageCard } from './language-card.tsx'
import { NavigationButton } from '../navigation-button.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { createMotherLanguageFilter } from '@template-app/i18n/lang-filter-utils.ts'
import { Input } from '../../../shadcn/input.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths'
import { useNavigate } from 'react-router-dom'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { usePatchMotherLanguage } from '@/hooks/api/user/user-hooks.ts'
import { useLingui } from '@lingui/react/macro'

export const ChooseMotherLanguageView = () => {
  const { t, i18n } = useLingui()

  const filterMotherLangsByInput = useMemo(() => createMotherLanguageFilter(i18n), [i18n])

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [selectedMotherLanguage, setSelectedMotherLanguage] = useState<SupportedMotherLanguage | null>(null)
  const [hasSelectedOther, setHasSelectedOther] = useState<boolean>(false)
  const [text, setText] = useState('')
  const filteredLangs = filterMotherLangsByInput(text)

  const { mutate, isPending } = usePatchMotherLanguage({
    onSuccess: () => {
      dispatch(accountActions.setMotherLanguage(selectedMotherLanguage))
      navigate(ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE)
    },
  })

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const onSkipClick = () => {
    dispatch(accountActions.setHasChosenNoneOfPossibleMotherLanguages())
    navigate(ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE)
  }

  const onNextClick = () => {
    if (hasSelectedOther) {
      dispatch(accountActions.setMotherLanguage(LangCode.ENGLISH))
      navigate(ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE)
    } else if (selectedMotherLanguage) {
      mutate({ motherLanguage: selectedMotherLanguage })
    }
  }

  const handleLangClick = (lang: SupportedMotherLanguage) => {
    if (selectedMotherLanguage === lang) {
      setSelectedMotherLanguage(null)
    } else {
      setSelectedMotherLanguage(lang)
      setHasSelectedOther(false)
    }
  }

  const handleHasSelectedOther = () => {
    setHasSelectedOther(!hasSelectedOther)
    setSelectedMotherLanguage(null)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-col'>
        <div className='flex w-full items-center px-4 py-4'>
          <div className='mx-auto flex h-full w-full items-center justify-end md:w-1/2 3xl:w-1/3'>
            <button onClick={onSkipClick} disabled={isPending} className='text-gray-500 hover:text-gray-700'>
              {t`Skip`}
            </button>
          </div>
        </div>

        <div className='mb-52 flex justify-center'>
          <div className='flex w-full flex-col items-center gap-y-4 px-4 pt-0 md:w-3/4 lg:w-2/3 3xl:w-1/3'>
            <div className='flex max-w-md flex-col items-center'>
              <h1 className='max-w-xl text-center text-4xl font-bold tracking-tighter'>
                {t`What's your native language?`}
              </h1>
              <span className='text-md max-w-xl text-center tracking-tighter text-gray-400'>
                {t`(You can always change it later)`}
              </span>
            </div>
            <Input
              autoFocus={true}
              value={text}
              onChange={handleInputChange}
              className='h-14 w-full rounded-xl bg-white text-lg'
              placeholder={t`Type your native language`}
            />
            <div className='grid w-full grid-cols-2 gap-4'>
              {filteredLangs.map((lang) => (
                <LanguageCard
                  key={lang}
                  lang={lang}
                  handleClick={() => handleLangClick(lang)}
                  isSelected={selectedMotherLanguage === lang}
                />
              ))}
              <button
                className={cn(
                  'flex h-12 items-center justify-center rounded-xl border bg-white shadow focus:outline-none',
                  { 'bg-gradient-to-r from-orange-300 to-yellow-300 text-white': hasSelectedOther },
                  { 'hover:bg-gray-100': !hasSelectedOther }
                )}
                onClick={handleHasSelectedOther}
              >
                <span
                  className={cn('text-xl text-gray-500', {
                    'text-gray-700': hasSelectedOther,
                    'text-gray-500': !hasSelectedOther,
                  })}
                >
                  {t`Other`}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 w-full bg-gray-50'>
          <div className='pointer-events-none absolute bottom-full left-0 right-0 h-40 bg-gradient-to-b from-transparent to-gray-50' />
          <div className='mx-auto flex w-full flex-col gap-y-3 px-4 py-4 md:w-1/2 3xl:w-1/3'>
            <NavigationButton
              onClick={onNextClick}
              disabled={(!selectedMotherLanguage && !hasSelectedOther) || isPending}
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
