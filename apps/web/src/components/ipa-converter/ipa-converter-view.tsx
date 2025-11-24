import { useEffect, useState } from 'react'
import { ArrowRight, CircleHelp } from 'lucide-react'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

import {
  DEFAULT_DIALECTS,
  DialectCode,
  LangCode,
  LANGUAGES_TO_DIALECT_MAP,
  LANGUAGES_WITH_MULTIPLE_DIALECTS,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedStudyLanguage,
} from '@yourbestaccent/core/constants/lang-codes'
import { Button } from '../shadcn/button.tsx'
import { Textarea } from '../shadcn/textarea.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover.tsx'
import { LanguageDropdownSelector } from './language-dropdown-selector.tsx'
import { DialectDropdownSelector } from './dialect-dropdown-selector.tsx'
import { BigCard } from '../design-system/big-card.tsx'
import { WithNavbar } from '@/components/navbar/with-navbar.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { IpaConverterResult } from '@/components/ipa-converter/ipa-converter-result.tsx'
import {
  selectIsSignedIn,
  selectStudyLanguageOrEnglish,
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  accountActions,
} from '@/state/slices/account-slice.ts'
import { modalActions } from '@/state/slices/modal-slice.ts'
import { localStorageWrapper } from '@/local-storage/local-storage-wrapper.ts'
import {
  IPA_CONVERTER_URL_PARAMS,
  IPA_TRANSCRIPTIONS_LIMIT_FOR_NOT_SIGNED_IN_USERS,
} from '@/components/ipa-converter/ipa-converter-constants.ts'
import {
  MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS,
  IPA_TRANSCRIPTION_CHARACTER_LIMIT_FOR_NOT_SIGNED_IN_USERS,
} from '@yourbestaccent/core/constants/api-constants.ts'
import { usePatchStudyLanguageAndDialect, usePatchStudyDialect } from '@/hooks/api/user/user-hooks.ts'
import { useTranscribeTextForConverter } from '@/hooks/open-api/ipa-transcription/ipa-transcription-hooks'
import { useLingui } from '@lingui/react/macro'

export const IpaConverterView = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const isSignedIn = useSelector(selectIsSignedIn)
  const userStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const userDialect = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const [searchParams, setSearchParams] = useSearchParams()

  const [inputText, setInputText] = useState(() => searchParams.get(IPA_CONVERTER_URL_PARAMS.TEXT) || '')
  const [outputIpa, setOutputIpa] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedStudyLanguage | undefined>()
  const [selectedDialect, setSelectedDialect] = useState<DialectCode | undefined>()

  const limit = isSignedIn
    ? MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS
    : IPA_TRANSCRIPTION_CHARACTER_LIMIT_FOR_NOT_SIGNED_IN_USERS

  const { mutate: transcribeText, isPending: isLoading } = useTranscribeTextForConverter(isSignedIn, setOutputIpa)

  const { mutate: updateStudyLangAndDialect } = usePatchStudyLanguageAndDialect()

  const { mutate: updateDialect } = usePatchStudyDialect()

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  useEffect(() => {
    const urlLanguage = searchParams.get(IPA_CONVERTER_URL_PARAMS.LANGUAGE)
    const urlDialect = searchParams.get(IPA_CONVERTER_URL_PARAMS.DIALECT)

    if (urlLanguage && SUPPORTED_STUDY_LANGUAGES.includes(urlLanguage as SupportedStudyLanguage)) {
      const urlStudyLanguage = urlLanguage as SupportedStudyLanguage
      setSelectedLanguage(urlStudyLanguage)

      let dialectToUse: DialectCode
      if (urlDialect && LANGUAGES_TO_DIALECT_MAP[urlStudyLanguage].includes(urlDialect as DialectCode)) {
        dialectToUse = urlDialect as DialectCode
      } else {
        dialectToUse = DEFAULT_DIALECTS[urlStudyLanguage]
      }
      setSelectedDialect(dialectToUse)

      if (isSignedIn && (userStudyLanguage !== urlStudyLanguage || userDialect !== dialectToUse)) {
        updateStudyLangAndDialect({ studyLanguage: urlStudyLanguage, studyDialect: dialectToUse })
        dispatch(accountActions.setStudyLanguage(urlStudyLanguage))
        dispatch(accountActions.setDialect(dialectToUse))
      }
    } else {
      if (isSignedIn) {
        setSelectedLanguage(userStudyLanguage)
        setSelectedDialect(userDialect)
      } else {
        setSelectedLanguage(LangCode.ENGLISH)
        setSelectedDialect(DEFAULT_DIALECTS[LangCode.ENGLISH]) // American English
      }
    }
  }, [isSignedIn, userStudyLanguage, userDialect, searchParams, updateStudyLangAndDialect, dispatch])

  const handleLanguageSelect = (langCode: LangCode) => {
    if (SUPPORTED_STUDY_LANGUAGES.includes(langCode as SupportedStudyLanguage)) {
      const newStudyLanguage = langCode as SupportedStudyLanguage
      const newDialect = DEFAULT_DIALECTS[newStudyLanguage]
      setSelectedLanguage(newStudyLanguage)
      setSelectedDialect(newDialect)

      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.set(IPA_CONVERTER_URL_PARAMS.LANGUAGE, newStudyLanguage)
      newSearchParams.set(IPA_CONVERTER_URL_PARAMS.DIALECT, newDialect)
      setSearchParams(newSearchParams)

      if (isSignedIn) {
        updateStudyLangAndDialect({ studyLanguage: newStudyLanguage, studyDialect: newDialect })
        dispatch(accountActions.setStudyLanguage(newStudyLanguage))
        dispatch(accountActions.setDialect(newDialect))
      }
    }
  }

  const handleDialectSelect = (dialectCode: DialectCode) => {
    setSelectedDialect(dialectCode)

    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set(IPA_CONVERTER_URL_PARAMS.DIALECT, dialectCode)
    setSearchParams(newSearchParams)

    if (isSignedIn) {
      updateDialect({ studyDialect: dialectCode })
      dispatch(accountActions.setDialect(dialectCode))
    }
  }

  const handleTranscribe = () => {
    if (!inputText.trim()) {
      toast.error(t`Please enter some text to transcribe`)
      return
    }

    if (!selectedLanguage) {
      toast.error(t`Please select a language`)
      return
    }

    if (inputText.length > IPA_TRANSCRIPTION_CHARACTER_LIMIT_FOR_NOT_SIGNED_IN_USERS) {
      toast.error(
        t`Text is too long. Please limit your input to ${IPA_TRANSCRIPTION_CHARACTER_LIMIT_FOR_NOT_SIGNED_IN_USERS} characters or less.`
      )
      return
    }

    if (!isSignedIn) {
      const currentCount = localStorageWrapper.getIpaTranscriptionCount()
      if (IPA_TRANSCRIPTIONS_LIMIT_FOR_NOT_SIGNED_IN_USERS <= currentCount) {
        dispatch(
          modalActions.openSignUpPromptModal(
            t`You have used your free limit of IPA transcriptions. Please sign up to continue.`
          )
        )
        return
      }
    }

    if (!selectedDialect) {
      toast.error(t`Please select a dialect`)
      return
    }

    POSTHOG_EVENTS.textTranscribed(selectedLanguage, inputText.length, isSignedIn)

    transcribeText({
      text: inputText,
      language: selectedLanguage,
      dialect: selectedDialect,
    })
  }

  const updateTextInput = (newText: string) => {
    setInputText(newText)

    const newSearchParams = new URLSearchParams(searchParams)
    if (newText.trim()) {
      newSearchParams.set(IPA_CONVERTER_URL_PARAMS.TEXT, newText)
    } else {
      newSearchParams.delete(IPA_CONVERTER_URL_PARAMS.TEXT)
    }
    setSearchParams(newSearchParams)
  }

  const handleClear = () => {
    updateTextInput('')
    setOutputIpa('')
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
        <BigCard className='container relative flex flex-1 flex-col items-center'>
          {/* Navigation */}
          {/* Header */}
          <div className='mx-auto px-4 py-1 md:py-6'>
            <div className='text-center'>
              <h1 className='text-3xl font-bold text-gray-900'>{t`IPA Converter`}</h1>
              <p className='mt-2 hidden text-lg text-gray-600 md:block'>{t`Convert text to International Phonetic Alphabet transcription`}</p>
              <p className='mt-1 hidden text-sm text-gray-500 md:block'>{t`Enter text in any supported language and get accurate phonetic transcription`}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className='w-full'>
            <div className='flex w-full flex-col gap-y-4'>
              <div className='flex w-full flex-col gap-x-4 gap-y-2 xl:flex-row'>
                {/* Input Section */}
                <div className='flex w-72 flex-col gap-y-1 md:gap-y-2'>
                  <label className='block text-sm font-medium text-gray-700'>{t`Language`}</label>
                  <LanguageDropdownSelector
                    value={selectedLanguage}
                    onLanguageSelect={handleLanguageSelect}
                    langCodes={SUPPORTED_STUDY_LANGUAGES}
                    placeholder={t`Select input language`}
                  />
                </div>

                {/* Dialect Selector - only show if language has multiple dialects */}
                {selectedLanguage && LANGUAGES_WITH_MULTIPLE_DIALECTS.includes(selectedLanguage) && (
                  <div className='flex w-72 flex-col gap-y-1 md:gap-y-2'>
                    <label className='block text-sm font-medium text-gray-700'>{t`Dialect`}</label>
                    <DialectDropdownSelector
                      value={selectedDialect}
                      onDialectSelect={handleDialectSelect}
                      dialectCodes={LANGUAGES_TO_DIALECT_MAP[selectedLanguage]}
                      placeholder={t`Select dialect`}
                    />
                  </div>
                )}
              </div>

              <div className='flex w-full flex-row gap-x-4'>
                <div className='flex w-full flex-col gap-y-1 md:w-1/2 md:gap-y-2'>
                  <div className='mb flex items-center justify-between'>
                    <label className='block text-sm font-medium text-gray-700'>{t`Text to transcribe`}</label>
                    <div className='flex items-center gap-1'>
                      <span className={`text-xs ${inputText.length > limit ? 'text-red-500' : 'text-gray-500'}`}>
                        {inputText.length}/{limit}
                      </span>
                      {!isSignedIn && (
                        <Popover>
                          <PopoverTrigger>
                            <CircleHelp className='h-4 w-4 text-stone-400' />
                          </PopoverTrigger>
                          <PopoverContent className='bg-white text-center text-sm shadow-lg'>
                            {t`The character limit is ${IPA_TRANSCRIPTION_CHARACTER_LIMIT_FOR_NOT_SIGNED_IN_USERS}. You can increase the limit to ${MAX_UPPER_LIMIT_TO_PROTECT_FROM_HACKERS} by signing in.`}
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                  <Textarea
                    value={inputText}
                    onChange={(e) => updateTextInput(e.target.value)}
                    placeholder={t`Enter text here...`}
                    className='min-h-32 resize-none rounded-lg border border-gray-300 p-3 text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 md:min-h-52'
                    disabled={isLoading}
                  />
                  <div className='flex gap-2'>
                    <Button
                      onClick={handleTranscribe}
                      disabled={isLoading}
                      className='flex-1 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300'
                    >
                      {isLoading ? (
                        <div className='flex items-center gap-2'>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                          {t`Transcribing...`}
                        </div>
                      ) : (
                        <div className='flex items-center gap-2'>
                          <ArrowRight className='h-4 w-4' />
                          {t`Transcribe`}
                        </div>
                      )}
                    </Button>

                    <Button onClick={handleClear} variant='outline' disabled={isLoading} className='px-4'>
                      {t`Clear`}
                    </Button>
                  </div>
                </div>
                <div className='hidden w-full flex-row md:flex md:w-1/2'>
                  <IpaConverterResult isLoading={isLoading} outputIpa={outputIpa} />
                </div>
              </div>
              <div className='flex flex-row md:hidden'>
                <IpaConverterResult isLoading={isLoading} outputIpa={outputIpa} />
              </div>
            </div>
          </div>
        </BigCard>
      </div>
    </WithNavbar>
  )
}
