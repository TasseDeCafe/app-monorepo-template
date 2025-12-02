import { Button } from '../shadcn/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card.tsx'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry.ts'
import { useTriggerSentryMessageMutation } from '@/hooks/api/sentry-debug/sentry-debug-hooks.ts'

export const AdminSettings = () => {
  const triggerSentryMessageMutation = useTriggerSentryMessageMutation()

  const handleTestSentryLog = () => {
    logWithSentry(
      'Test Sentry log from Admin Settings',
      new Error('Test Sentry error from Admin Settings'),
      {
        test: 'test',
        another_test: 'another_test',
      },
      'warning'
    )
    alert('Sentry test log sent!')
  }

  const handleTestSentryError = () => {
    alert('Unhandled error thrown and captured by Sentry!')
    throw new Error('Test unhandled error from Admin Settings')
  }

  const handleTestBackendSentryMessage = async () => {
    try {
      await triggerSentryMessageMutation.mutateAsync({
        message: 'Test backend Sentry message from Admin Settings',
        isInfoLevel: false,
      })
      alert('Backend Sentry test message sent!')
    } catch (error) {
      logWithSentry('Failed to trigger backend Sentry message', error)
      alert('Failed to send backend Sentry test message')
    }
  }

  return (
    <div className='flex h-full w-full flex-col items-center p-4 md:p-6'>
      <div className='w-full max-w-3xl'>
        <h1 className='mb-8 text-center text-4xl font-bold tracking-tighter text-stone-900 md:text-5xl'>
          Admin settings
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Sentry Testing</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-stone-600'>
              Use these buttons to test Sentry error reporting in your environment.
            </p>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <Button onClick={handleTestSentryLog} variant='outline' className='border-blue-300 hover:bg-blue-50'>
                Test Frontend Sentry Log
              </Button>
              <Button onClick={handleTestSentryError} variant='outline' className='border-red-300 hover:bg-red-50'>
                Test Frontend Unhandled Error
              </Button>
              <Button
                onClick={handleTestBackendSentryMessage}
                variant='outline'
                className='border-purple-300 hover:bg-purple-50'
              >
                Test Backend Sentry Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
