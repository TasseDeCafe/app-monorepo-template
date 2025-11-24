'use client'

import React from 'react'
import {
  DialectCode,
  LANGUAGES_TO_DIALECT_MAP,
  LANGUAGES_WITH_MULTIPLE_DIALECTS,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedStudyLanguage,
} from '@yourbestaccent/core/constants/lang-codes'
import { useDialectCodeToDialectName, useLangCodeToLanguageName } from '@/utils/lang-code-utils'
import { CustomCircularFlag } from '@/design-system/custom-circular-flag'

interface Props {
  title: React.ReactNode
  description: React.ReactNode
  dialectTitle: React.ReactNode
}

export const SupportedLanguagesAndDialectsClient = ({ title, description, dialectTitle }: Props) => {
  const langCodeToLanguageName = useLangCodeToLanguageName()
  const dialectCodeToDialectName = useDialectCodeToDialectName()

  return (
    <section className='mx-auto w-full px-4 py-16'>
      <h2 className='mb-8 text-center text-3xl font-bold'>{title}</h2>
      <p className='mx-auto mb-12 max-w-2xl text-center'>{description}</p>
      <div className='mb-16 flex flex-wrap justify-center gap-4'>
        {SUPPORTED_STUDY_LANGUAGES.map((supportedStudyLangCode: SupportedStudyLanguage) => (
          <div
            key={supportedStudyLangCode}
            className='flex w-[calc(33.333%-1rem)] flex-col items-center sm:w-[calc(25%-1rem)] md:w-[calc(20%-1rem)]'
          >
            <CustomCircularFlag
              languageOrDialectCode={supportedStudyLangCode}
              className='h-16 w-16 bg-transparent sm:h-20 sm:w-20'
            />
            <span className='mt-2 text-center text-xs capitalize sm:text-sm'>
              {langCodeToLanguageName(supportedStudyLangCode)}
            </span>
          </div>
        ))}
      </div>

      {LANGUAGES_WITH_MULTIPLE_DIALECTS.length > 0 && (
        <>
          <h3 className='mb-8 text-center text-3xl font-bold'>{dialectTitle}</h3>
          <div className='flex flex-col gap-y-10 md:gap-y-14'>
            {LANGUAGES_WITH_MULTIPLE_DIALECTS.map((langCode) => (
              <div key={langCode} className='flex flex-col items-center'>
                <span className='mb-2 text-2xl font-semibold'>{langCodeToLanguageName(langCode)}:</span>
                <div className='flex flex-col justify-center gap-3 lg:flex-row'>
                  {LANGUAGES_TO_DIALECT_MAP[langCode].map((dialect: DialectCode) => (
                    <div key={dialect} className='flex items-center justify-center gap-x-2 px-3 py-1'>
                      <CustomCircularFlag
                        languageOrDialectCode={dialect}
                        className='h-6 w-6 bg-transparent md:h-10 md:w-10'
                      />
                      <span className='text-center first-letter:uppercase md:text-lg'>
                        {dialectCodeToDialectName(dialect)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
