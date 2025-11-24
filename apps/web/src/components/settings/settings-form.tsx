import { zodResolver } from '@hookform/resolvers/zod'
import {
  DEFAULT_DIALECTS,
  DialectCode,
  LangCode,
  LANGUAGES_TO_DIALECT_MAP,
  SUPPORTED_MOTHER_LANGUAGES,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedMotherLanguage,
  SupportedStudyLanguage,
} from '@template-app/core/constants/lang-codes'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  accountActions,
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
  selectStudyLanguageOrEnglish,
  selectDailyStudyMinutes,
} from '@/state/slices/account-slice.ts'
import DialectSelector from './dialect-selector'
import { LanguageComboBox } from './language-combo-box'
import { SettingsFormProps } from './types'
import {
  usePatchDailyStudyMinutes,
  usePatchMotherLanguage,
  usePatchStudyDialect,
  usePatchStudyLanguageAndDialect,
} from '@/hooks/api/user/user-hooks'
import cloneDeep from 'lodash.clonedeep'
import {
  preferencesActions,
  selectShouldShowIpa,
  selectShouldShowTransliteration,
} from '@/state/slices/preferences-slice.ts'
import { FormControl, FormDescription, FormItem, FormLabel } from '../shadcn/form.tsx'
import { IpaToggle } from '@/components/exercises/pronunciation-evaluation-exercise/controls/atoms/ipa-toggle.tsx'
import { TransliterationToggle } from '@/components/exercises/pronunciation-evaluation-exercise/controls/atoms/transliteration-toggle.tsx'
import { CefrLevelSelector } from '@/components/exercises/pronunciation-evaluation-exercise/controls/atoms/cefr-level-selector/cefr-level-selector.tsx'
import { DailyStudyMinutesSettings } from './daily-study-minutes-settings.tsx'
import { UserSettings } from '@template-app/api-client/orpc-contracts/user-settings-contract.ts'
import { MIN_DAILY_STUDY_MINUTES, MAX_DAILY_STUDY_MINUTES } from '@template-app/core/constants/daily-study-constants'
import {
  useFrequencySliderPosition,
  useUpdateFrequencyListPositionMutation,
  useUserSettings,
} from '@/hooks/api/user-settings/user-settings-hooks'
import { MAX_NUMBER_OF_WORDS_IN_FREQUENCY_LIST } from '@template-app/api-client/orpc-contracts/user-settings-contract'
import { useLingui } from '@lingui/react/macro'

type FormInputs = {
  studyLanguage: LangCode
  motherLanguage: LangCode
  frequencyListPosition: number
  dailyStudyMinutes: number
}

export const SettingsForm = ({ onSubmit }: SettingsFormProps) => {
  const { t } = useLingui()
  const formSchema = useMemo(
    () =>
      z.object({
        studyLanguage: z.enum(LangCode, {
          error: (issue) => (issue.input === undefined ? t`Please select a language.` : t`Invalid language.`),
        }),
        motherLanguage: z.enum(LangCode, {
          error: (issue) => (issue.input === undefined ? t`Please select a language.` : t`Invalid language.`),
        }),
        frequencyListPosition: z.number().int().min(0).max(MAX_NUMBER_OF_WORDS_IN_FREQUENCY_LIST),
        dailyStudyMinutes: z.number().int().min(MIN_DAILY_STUDY_MINUTES).max(MAX_DAILY_STUDY_MINUTES),
      }),
    [t]
  )

  const studyLanguage: SupportedStudyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const motherLanguage: SupportedMotherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const selectedDialect: DialectCode =
    useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect) || DEFAULT_DIALECTS[studyLanguage]
  const dailyStudyMinutes: number | null = useSelector(selectDailyStudyMinutes)
  const position = useFrequencySliderPosition(studyLanguage)
  const { data: userSettings } = useUserSettings()

  const { mutate } = useUpdateFrequencyListPositionMutation(studyLanguage)
  const shouldShowIpa = useSelector(selectShouldShowIpa)
  const shouldShowTransliteration = useSelector(selectShouldShowTransliteration)
  const dispatch = useDispatch()

  const { mutate: updateMotherLang } = usePatchMotherLanguage()
  const { mutate: updateStudyLangAndDialect } = usePatchStudyLanguageAndDialect()
  const { mutate: updateDialect } = usePatchStudyDialect()
  const { mutate: updateDailyStudyMinutes } = usePatchDailyStudyMinutes()

  const handleIpaClick = () => {
    dispatch(preferencesActions.setShouldShowIpa(!shouldShowIpa))
  }

  const handleTransliterationClick = () => {
    dispatch(preferencesActions.setShouldShowTransliteration(!shouldShowTransliteration))
  }

  const form = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyLanguage: studyLanguage,
      motherLanguage: motherLanguage,
      dailyStudyMinutes: dailyStudyMinutes || MIN_DAILY_STUDY_MINUTES,
    },
  })

  const dialectsForSelectedLanguage = LANGUAGES_TO_DIALECT_MAP[studyLanguage]

  useEffect(() => {
    if (!dialectsForSelectedLanguage.includes(selectedDialect)) {
      dispatch(accountActions.setDialect(DEFAULT_DIALECTS[studyLanguage]))
    }
  }, [dispatch, studyLanguage, selectedDialect, dialectsForSelectedLanguage])

  const handleDialectSelect = (value: DialectCode) => {
    if (value) {
      updateDialect({
        studyDialect: value,
      })
      dispatch(accountActions.setDialect(value))
    }
  }

  const handleMotherLanguageSelect = (value: LangCode) => {
    updateMotherLang({
      motherLanguage: value,
    })
    dispatch(accountActions.setMotherLanguage(value))
  }

  const handleStudyLanguageSelect = (value: LangCode) => {
    const newDialect = DEFAULT_DIALECTS[value as SupportedStudyLanguage]
    updateStudyLangAndDialect({
      studyLanguage: value as SupportedStudyLanguage,
      studyDialect: newDialect,
    })
    dispatch(accountActions.setStudyLanguage(value as SupportedStudyLanguage))
    dispatch(accountActions.setDialect(newDialect))
  }

  const handleDailyStudyMinutesChange = (minutes: number) => {
    if (minutes < MIN_DAILY_STUDY_MINUTES) {
      toast.error(t`Daily study time must be at least ${MIN_DAILY_STUDY_MINUTES} minutes`)
      return
    }
    if (minutes > MAX_DAILY_STUDY_MINUTES) {
      toast.error(t`Daily study time cannot exceed ${MAX_DAILY_STUDY_MINUTES} minutes`)
      return
    }

    updateDailyStudyMinutes({
      dailyStudyMinutes: minutes,
    })
    dispatch(accountActions.setDailyStudyMinutes(minutes))
  }

  const updateFrequencySliderPosition = (language: LangCode, position: number) => {
    if (!userSettings) {
      return
    }
    const updatedSettings: UserSettings = cloneDeep(userSettings)
    updatedSettings.preferences.exercises.frequencyList.position.byLanguage.map((lang) => {
      if (lang.language === language) {
        lang.position = position
      }
      return lang
    })
    mutate(updatedSettings)
  }

  const handlePositionChange = (newPosition: number) => {
    updateFrequencySliderPosition(studyLanguage, newPosition)
  }

  return (
    <FormProvider {...form}>
      <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
        <LanguageComboBox
          name='studyLanguage'
          label={t`I am learning:`}
          description={t`This is the language that will be used in the exercises.`}
          onLanguageSelect={handleStudyLanguageSelect}
          langCodes={SUPPORTED_STUDY_LANGUAGES}
        />

        {dialectsForSelectedLanguage.length > 1 && (
          <DialectSelector
            dialects={dialectsForSelectedLanguage}
            selectedDialect={selectedDialect}
            onDialectSelect={handleDialectSelect}
          />
        )}
        <LanguageComboBox
          name='motherLanguage'
          label={t`My native language:`}
          onLanguageSelect={handleMotherLanguageSelect}
          langCodes={SUPPORTED_MOTHER_LANGUAGES}
        />
        <CefrLevelSelector initialPosition={position} onPositionCommit={handlePositionChange} />

        <FormItem className='space-y-2'>
          <div>
            <FormLabel className='text-base font-semibold'>{t`IPA and transliteration`}</FormLabel>
          </div>
          <FormControl>
            <div className='space-y-3'>
              <IpaToggle shouldShowIpa={shouldShowIpa} handleIpaClick={handleIpaClick} />
              <TransliterationToggle
                shouldShowTransliteration={shouldShowTransliteration}
                handleTransliterationClick={handleTransliterationClick}
              />
            </div>
          </FormControl>
          <FormDescription className='mt-1 text-sm text-gray-400'>{t`International phonetic alphabet (IPA) and transliteration will appear above the study words`}</FormDescription>
          <FormItem className='space-y-2'>
            <div>
              <FormLabel className='text-base font-semibold'>{t`Daily Study Time`}</FormLabel>
            </div>
            <FormControl>
              <DailyStudyMinutesSettings
                initialMinutes={dailyStudyMinutes}
                onMinutesChange={handleDailyStudyMinutesChange}
              />
            </FormControl>
          </FormItem>
        </FormItem>
      </form>
    </FormProvider>
  )
}
