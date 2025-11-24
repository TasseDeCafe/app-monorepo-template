import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { ArrowLeft, Check, ChevronDown, CircleHelp, GraduationCap } from 'lucide-react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import {
  accountActions,
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectStudyLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { buildPronunciationEvaluationExercisePath, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { BigCard } from '../../design-system/big-card.tsx'
import { ExerciseSkeleton } from './exercise-skeleton.tsx'
import { Button } from '../../design-system/button.tsx'
import { WithNavbar } from '../../navbar/with-navbar.tsx'
import { Textarea } from '../../shadcn/textarea.tsx'
import {
  DEFAULT_DIALECTS,
  SUPPORTED_STUDY_LANGUAGES,
  SupportedStudyLanguage,
} from '@yourbestaccent/core/constants/lang-codes.ts'
import { Popover, PopoverContent, PopoverTrigger } from '../../shadcn/popover.tsx'
import { FormControl, FormItem } from '../../shadcn/form.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils.ts'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../shadcn/command.tsx'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CustomCircularFlag } from '@/components/design-system/custom-circular-flag.tsx'
import { useDetectStudyLanguage } from '@/hooks/api/language-detection/language-detection-hooks'
import { useGenerateCustomPronunciationExercise } from '@/hooks/api/pronunciation-evaluation-exercise/pronunciation-evaluation-exercise-hooks'
import { usePatchStudyLanguageAndDialect } from '@/hooks/api/user/user-hooks'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

type FormInputs = {
  studyLanguage: SupportedStudyLanguage
}

export const NewCustomPronunciationEvaluationExerciseView = () => {
  const { t, i18n } = useLingui()

  const selectLanguageErrorMessage = t`Please select a language.`
  const invalidLanguageErrorMessage = t`Invalid language.`
  const formSchema = useMemo(
    () =>
      z.object({
        studyLanguage: z.enum(SUPPORTED_STUDY_LANGUAGES, {
          error: (issue) => (issue.input === undefined ? selectLanguageErrorMessage : invalidLanguageErrorMessage),
        }),
      }),
    [invalidLanguageErrorMessage, selectLanguageErrorMessage]
  )

  const studyLanguageOptions = useMemo(
    () =>
      SUPPORTED_STUDY_LANGUAGES.map((langCode: SupportedStudyLanguage) => ({
        label: i18n._(langNameMessages[langCode]),
        value: langCode,
      })),
    [i18n]
  )

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [expectedText, setExpectedText] = useState('')
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const dialect = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const { data: languageDetectionData, isFetching: isFetchingLanguageDetection } = useDetectStudyLanguage(expectedText)

  const { mutate: updateStudyLangAndDialect } = usePatchStudyLanguageAndDialect()
  const { mutate: generateExercise, isPending } = useGenerateCustomPronunciationExercise(
    expectedText,
    studyLanguage,
    dialect
  )

  const hasDetectedAStudyLanguage: boolean = languageDetectionData?.hasDetectedAStudyLanguage ?? false
  const confidence: number = languageDetectionData?.confidence ?? 0
  const detectedStudyLanguage: SupportedStudyLanguage | undefined = languageDetectionData?.studyLanguage

  const form = useForm<FormInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studyLanguage: studyLanguage,
    },
  })

  const shouldProposeToSwitchLanguage =
    !isFetchingLanguageDetection &&
    hasDetectedAStudyLanguage &&
    confidence > 0.3 &&
    detectedStudyLanguage &&
    detectedStudyLanguage !== studyLanguage

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setExpectedText(event.target.value)
  }

  const onSubmitClick = () => {
    if (expectedText.length < 2) {
      toast.warning(t`Text to practice must be at least 2 characters long`)
    } else if (expectedText.length >= 400) {
      toast.warning(t`Text to practice must be shorter than 400 characters`)
    } else {
      generateExercise(undefined, {
        onSuccess: (exerciseData) => {
          navigate(buildPronunciationEvaluationExercisePath(exerciseData.id, 'custom'), {
            replace: true,
          })
        },
      })
    }
  }

  const handleGoToDashboard = () => {
    POSTHOG_EVENTS.click('go_back')
  }

  if (isPending) {
    return (
      <WithNavbar>
        <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
          <BigCard className='container relative flex flex-1 flex-col items-center'>
            <Button
              href={ROUTE_PATHS.DASHBOARD}
              onClick={handleGoToDashboard}
              className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
            >
              <ArrowLeft className='' />
            </Button>
            <ExerciseSkeleton />
          </BigCard>
        </div>
      </WithNavbar>
    )
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-1 flex-col items-center pt-2 md:p-8 3xl:p-16'>
        <BigCard className='container relative flex flex-1 flex-col items-center'>
          <Button
            href={ROUTE_PATHS.DASHBOARD}
            onClick={handleGoToDashboard}
            className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
          >
            <ArrowLeft className='' />
          </Button>

          <div className='flex h-full w-full flex-col gap-y-4 md:w-[450px]'>
            <h1 className='mb-4 mt-10 text-center text-4xl font-bold tracking-tighter text-stone-900 md:mt-12'>
              {t`Enter text to practice`}
            </h1>
            <div className='flex w-full flex-row items-center justify-between gap-x-2'>
              <div className='flex items-center gap-x-2'>
                <FormProvider {...form}>
                  <form className='space-y-8' onSubmit={() => {}}>
                    <Controller
                      name='studyLanguage'
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-center gap-x-4'>
                          <div className='flex flex-col items-start gap-3'>
                            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={true}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    className={cn(
                                      'h-10 w-[200px] justify-between rounded-xl border px-3',
                                      !field.value && 'text-muted-foreground',
                                      'text-gray-500'
                                    )}
                                  >
                                    <div className='flex flex-row items-center gap-2'>
                                      <CustomCircularFlag
                                        languageOrDialectCode={studyLanguage}
                                        className={'h-5 bg-transparent'}
                                      />
                                      {i18n._(langNameMessages[studyLanguage])}
                                    </div>
                                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className='h-[250px] w-[200px] p-0' side='bottom'>
                                <Command className='bg-white'>
                                  <CommandInput placeholder={t`Search language...`} className='h-9' />
                                  <CommandEmpty>{t`No language found.`}</CommandEmpty>
                                  <CommandList>
                                    <CommandGroup>
                                      {studyLanguageOptions.map(({ label, value }) => (
                                        <CommandItem
                                          className={cn('cursor-pointer hover:bg-gray-100')}
                                          value={label}
                                          key={value}
                                          onSelect={() => {
                                            field.onChange(value)
                                            const dialect = DEFAULT_DIALECTS[value]
                                            updateStudyLangAndDialect({
                                              studyLanguage: value,
                                              studyDialect: dialect,
                                            })
                                            dispatch(accountActions.setStudyLanguageAndDefaultDialect(value))
                                            setIsPopoverOpen(false)
                                          }}
                                        >
                                          <div className='flex flex-row items-center gap-2'>
                                            <CustomCircularFlag
                                              languageOrDialectCode={value}
                                              className={'h-5 bg-transparent'}
                                            />
                                            {label}
                                          </div>
                                          <Check
                                            className={cn(
                                              'ml-auto h-4 w-4',
                                              value === field.value ? 'opacity-100' : 'opacity-0'
                                            )}
                                          />
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </FormItem>
                      )}
                    />
                  </form>
                </FormProvider>
                <Popover>
                  <PopoverTrigger>
                    <CircleHelp className='h-4 w-4 text-stone-400' />
                  </PopoverTrigger>
                  <PopoverContent className='bg-white text-center text-sm shadow-lg'>
                    {t`We will try to detect the language of your text automatically but it's better if you select it manually.`}
                  </PopoverContent>
                </Popover>
                <div className='flex h-8 items-center'>
                  {shouldProposeToSwitchLanguage && (
                    <span className='text-sm text-gray-400'>
                      {t`switch to:`}{' '}
                      <a
                        className='cursor-pointer text-indigo-600'
                        onClick={() => {
                          const dialect = DEFAULT_DIALECTS[detectedStudyLanguage]
                          updateStudyLangAndDialect({
                            studyLanguage: detectedStudyLanguage,
                            studyDialect: dialect,
                          })
                          dispatch(accountActions.setStudyLanguageAndDefaultDialect(detectedStudyLanguage))
                        }}
                      >
                        {i18n._(langNameMessages[detectedStudyLanguage])}
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Textarea
              value={expectedText}
              onChange={handleInputChange}
              className='h-60 w-full rounded-xl'
              placeholder={t`Type your text to practice here. Example: "Betty Botter bought some butter but she said the butter\\`}
            />
            <Button
              onClick={onSubmitClick}
              className='bg-gradient-to-r from-indigo-500 to-indigo-500 text-white hover:from-indigo-600 hover:to-indigo-600 disabled:opacity-50'
              disabled={isPending}
            >
              <span>{t`Start practicing`}</span>
              <GraduationCap className='ml-2 h-5' />
            </Button>
            <div className='h-8' />
          </div>
          <div className='h-8 flex-shrink-0' />
        </BigCard>
      </div>
    </WithNavbar>
  )
}
