import { FileQuestion, ArrowLeft } from 'lucide-react'
import { Button } from '../../design-system/button.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { useLingui } from '@lingui/react/macro'

export const ExerciseNotFound = () => {
  const { t } = useLingui()

  const handleGoToDashboard = () => {
    POSTHOG_EVENTS.click('go_back')
  }

  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-6 text-center'>
      <Button
        href={ROUTE_PATHS.DASHBOARD}
        onClick={handleGoToDashboard}
        className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
      >
        <ArrowLeft className='' />
      </Button>
      <div className='flex flex-col items-center gap-4'>
        <FileQuestion className='h-16 w-16 text-gray-400' />
        <h1 className='text-2xl font-bold text-gray-900'>{t`Exercise Not Found`}</h1>
        <p className='max-w-md text-gray-600'>{t`The exercise you're looking for doesn't exist.`}</p>
        <div className='flex gap-3'>
          <Button href={ROUTE_PATHS.DASHBOARD} onClick={handleGoToDashboard} className='bg-indigo-600 text-white'>
            {t`Go to Dashboard`}
          </Button>
        </div>
      </div>
    </div>
  )
}
