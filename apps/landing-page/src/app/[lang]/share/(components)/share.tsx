'use client'

import { useEffect } from 'react'
import { redirect, useSearchParams } from 'next/navigation'
import {
  CREATOR_SEARCH_PARAM_NAME,
  EXERCISE_TEXT_SEARCH_PARAM_NAME,
  STUDY_LANGUAGE_SEARCH_PARAM_NAME,
} from '@yourbestaccent/core/constants/search-params'
import { getConfig } from '@/config/environment-config'

const ShareRedirect = () => {
  const searchParams = useSearchParams()
  const studyLanguage = searchParams.get(STUDY_LANGUAGE_SEARCH_PARAM_NAME)
  const text = searchParams.get(EXERCISE_TEXT_SEARCH_PARAM_NAME)
  const creator = searchParams.get(CREATOR_SEARCH_PARAM_NAME)

  useEffect(() => {
    if (studyLanguage && text) {
      redirect(
        `${getConfig().frontendUrl}/exercises/demo?${STUDY_LANGUAGE_SEARCH_PARAM_NAME}=${studyLanguage}&${EXERCISE_TEXT_SEARCH_PARAM_NAME}=${text}&${CREATOR_SEARCH_PARAM_NAME}=${creator}`
      )
    } else {
      redirect('/')
    }
  }, [studyLanguage, text])

  return (
    <div className='flex h-full w-full items-center justify-center text-center text-2xl'>
      <span>Redirecting...</span>
    </div>
  )
}

export default ShareRedirect
