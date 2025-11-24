import { AVAILABLE_TOPICS, Topic } from '@template-app/core/constants/topics'
import { LANGUAGES_WITH_MULTIPLE_DIALECTS } from '@template-app/core/constants/lang-codes'
import { useEffect, useState } from 'react'
import { accountActions, selectStudyLanguageOrEnglish } from '@/state/slices/account-slice.ts'
import { useDispatch, useSelector } from 'react-redux'
import { NavigationButton } from '../navigation-button'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useNavigate } from 'react-router-dom'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { TOPIC_TO_ICONS_MAP } from '../../../design-system/topic-icons.ts'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../../design-system/button.tsx'
import { topicMessages } from '@template-app/i18n/topic-translation-utils'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { usePatchTopics } from '@/hooks/api/user/user-hooks.ts'
import { useLingui } from '@lingui/react/macro'

export const ChooseTopicsView = () => {
  const { t, i18n } = useLingui()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

  const { mutate, isPending } = usePatchTopics({
    onSuccess: () => {
      navigate(ROUTE_PATHS.ONBOARDING_DAILY_STUDY_TIME)
    },
  })

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const onPreviousClick = () => {
    if (studyLanguage && LANGUAGES_WITH_MULTIPLE_DIALECTS.includes(studyLanguage)) {
      dispatch(accountActions.setDialect(null))
      navigate(ROUTE_PATHS.ONBOARDING_DIALECT)
    } else {
      dispatch(accountActions.resetStudyLanguage())
      navigate(ROUTE_PATHS.ONBOARDING_STUDY_LANGUAGE)
    }
  }

  const onNextClick = () => {
    if (selectedTopic) {
      mutate({ topics: [selectedTopic] })
    }
  }

  const onSkipClick = () => {
    mutate({ topics: [] })
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-col'>
        <div className='flex w-full items-center px-4 py-4'>
          <div className='mx-auto flex h-full w-full items-center justify-between md:w-1/2 3xl:w-1/3'>
            <button onClick={onPreviousClick} className='text-gray-500 hover:text-gray-700' disabled={isPending}>
              <ArrowLeft size={24} />
            </button>
            <button onClick={onSkipClick} disabled={isPending} className='text-gray-500 hover:text-gray-700'>
              {t`Skip`}
            </button>
          </div>
        </div>

        <div className='mb-52 flex justify-center'>
          <div className='flex w-full flex-col items-center gap-y-4 px-4 pt-0 md:w-3/4 lg:w-2/3 3xl:w-1/3'>
            <div className='flex max-w-md flex-col items-center'>
              <h1 className='max-w-xl text-center text-4xl font-bold tracking-tighter'>
                {t`Which topic do you want to focus on?`}
              </h1>
              <span className='text-md max-w-xl text-center tracking-tighter text-gray-400'>
                {t`(You can always change it later)`}
              </span>
            </div>

            <div className='flex w-full flex-wrap justify-center gap-2'>
              {AVAILABLE_TOPICS.map((topic) => {
                const iconData = TOPIC_TO_ICONS_MAP[topic]
                return (
                  <Button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={cn(
                      'flex h-8 items-center gap-1.5 rounded-xl border px-3 shadow transition-all sm:h-10 sm:gap-2 sm:px-4',
                      'text-sm sm:text-lg',
                      selectedTopic === topic ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    {iconData.type === 'lucide' ? (
                      <iconData.icon className='h-4 w-4 sm:h-5 sm:w-5' />
                    ) : (
                      <span className='text-lg sm:text-xl'>{iconData.icon as string}</span>
                    )}
                    <span>{i18n._(topicMessages[topic])}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <div className='fixed bottom-0 w-full bg-gray-50'>
          <div className='pointer-events-none absolute bottom-full left-0 right-0 h-20 bg-gradient-to-b from-transparent to-gray-50' />
          <div className='lg:w-2/2 mx-auto flex w-full px-4 pb-8 pt-4 md:w-3/4 3xl:w-1/3'>
            <NavigationButton
              onClick={onNextClick}
              disabled={!selectedTopic || isPending}
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
