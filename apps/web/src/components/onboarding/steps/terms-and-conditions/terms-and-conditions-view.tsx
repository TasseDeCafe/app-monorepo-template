import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { accountActions } from '@/state/slices/account-slice.ts'
import { ArrowLeft } from 'lucide-react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { NavigationButton } from '../navigation-button.tsx'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { VoiceCloningAndNotificationsConsent } from './voice-cloning-and-notifications-consent.tsx'
import { useUpdateMarketingEmailPreferences } from '@/hooks/api/user-marketing-preferences/user-marketing-preferences-hooks'
import { WithNavbar } from '../../../navbar/with-navbar.tsx'
import { BigCard } from '../../../design-system/big-card.tsx'
import { useLingui } from '@lingui/react/macro'

export const TermsAndConditionsView = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isConsentChecked, setIsConsentChecked] = useState(false)
  const [shouldReceiveMarketingEmails, setShouldReceiveMarketingEmails] = useState(true)

  const { mutate: updateMarketingEmailPreferencesMutation } = useUpdateMarketingEmailPreferences()

  const handleMarketingEmailsChange = (checked: boolean) => {
    setShouldReceiveMarketingEmails(checked)
    updateMarketingEmailPreferencesMutation({ shouldReceiveMarketingEmails: checked })
  }

  const handleStartCloning = () => {
    if (isConsentChecked) {
      dispatch(accountActions.setHasAcceptedTermsAndConditionsAndClickedNext(true))
      navigate(ROUTE_PATHS.ONBOARDING_CLONE_VOICE)
    }
  }

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const onPreviousClick = () => {
    navigate(ROUTE_PATHS.DASHBOARD)
  }

  return (
    <WithNavbar>
      <div className='flex w-full flex-col items-center p-2 py-4'>
        <div className='mb-52 w-full md:w-3/4 lg:w-2/3 3xl:w-1/3'>
          <BigCard className='relative flex flex-col items-center gap-2 p-6 md:gap-6'>
            <div className='absolute left-8 flex w-full items-center'>
              <button onClick={onPreviousClick} className='text-gray-500 hover:text-gray-700'>
                <ArrowLeft size={24} />
              </button>
            </div>

            <div className='flex w-full flex-col items-center gap-2 md:gap-6'>
              <div className='flex w-full flex-col items-center gap-0 md:gap-2'>
                <h1 className='text-center text-2xl font-bold tracking-tighter text-gray-800 md:text-3xl'>
                  {t`Get ready`}
                </h1>
                <h1 className='text-center text-2xl font-bold tracking-tighter text-gray-800 md:text-3xl'>
                  {t`to clone your voice`}
                </h1>
              </div>

              <div className='w-full space-y-2 md:space-y-4'>
                <div className='mx-auto w-full max-w-[600px] rounded-xl bg-gray-50 p-3 text-sm text-gray-700 md:p-4 md:text-lg'>
                  <div className='space-y-2 md:space-y-3'>
                    <p>{t`In the next step, you'll read a short text aloud. For best results, ensure you're in a quiet environment. You can make mistakes, they will not affect the voice cloning.`}</p>
                    <p>{t`Your voice clone will be integrated into your learning experience, tailoring exercises just for you.`}</p>
                    <p>{t`You can always remove your voice clone later. It's not used by anyone outside the app.`}</p>
                  </div>
                </div>
              </div>

              <VoiceCloningAndNotificationsConsent
                isConsentChecked={isConsentChecked}
                setIsConsentChecked={setIsConsentChecked}
                shouldReceiveMarketingEmails={shouldReceiveMarketingEmails}
                onMarketingEmailsChange={handleMarketingEmailsChange}
              />
            </div>
          </BigCard>
        </div>

        <div className='fixed bottom-0 w-full bg-gray-50'>
          <div className='pointer-events-none absolute bottom-full left-0 right-0 h-20 bg-gradient-to-b from-transparent to-gray-50' />
          <div className='lg:w-2/2 mx-auto flex w-full px-4 pb-8 pt-4 md:w-3/4 3xl:w-1/3'>
            <NavigationButton
              onClick={handleStartCloning}
              disabled={!isConsentChecked}
              className='w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
            >
              {t`Go to Voice Cloning`}
            </NavigationButton>
          </div>
        </div>
      </div>
    </WithNavbar>
  )
}
