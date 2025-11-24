import { Checkbox } from '../../../shadcn/checkbox.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/popover.tsx'
import { CircleHelp } from 'lucide-react'
import { EXTERNAL_LINKS } from '@yourbestaccent/core/constants/external-links.ts'
import { useLingui } from '@lingui/react/macro'

interface VoiceCloningAndNotificationsConsentProps {
  isConsentChecked: boolean
  setIsConsentChecked: (checked: boolean) => void
  shouldReceiveMarketingEmails: boolean
  onMarketingEmailsChange: (checked: boolean) => void
}

export const VoiceCloningAndNotificationsConsent = ({
  isConsentChecked,
  setIsConsentChecked,
  shouldReceiveMarketingEmails,
  onMarketingEmailsChange,
}: VoiceCloningAndNotificationsConsentProps) => {
  const { t } = useLingui()

  return (
    <div className='max-w-lg space-y-4'>
      <div className='flex items-center space-x-3'>
        <Checkbox
          id='marketing-consent'
          checked={shouldReceiveMarketingEmails}
          onCheckedChange={onMarketingEmailsChange}
          className='mt-0'
        />
        <div className='flex items-center space-x-2'>
          <label htmlFor='marketing-consent' className='cursor-pointer text-sm text-gray-600'>
            {t`Receive updates and tips`}
          </label>
          <Popover>
            <PopoverTrigger className='mt-0'>
              <CircleHelp className='h-4 w-4 text-gray-400 hover:text-gray-500' />
            </PopoverTrigger>
            <PopoverContent className='w-64 p-3 text-sm text-gray-600'>
              {t`Stay informed about new features, learning tips, and special offers to enhance your language learning journey. You can unsubscribe at any time.`}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className='flex items-center space-x-3'>
        <Checkbox
          id='voice-consent'
          checked={isConsentChecked}
          onCheckedChange={(checked) => setIsConsentChecked(checked as boolean)}
          className='mt-0'
        />
        <label htmlFor='voice-consent' className='cursor-pointer text-sm text-gray-600'>
          {t`I consent to having my voice cloned for personalized learning experiences within YourBestAccent.com, and I agree to the`}{' '}
          <a
            href={EXTERNAL_LINKS.TERMS_OF_SERVICE_URL}
            className='text-indigo-600 hover:underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t`Terms of Service`}
          </a>{' '}
          {t`and`}{' '}
          <a
            href={EXTERNAL_LINKS.PRIVACY_POLICY_URL}
            className='text-indigo-600 hover:underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            {t`Privacy Policy`}
          </a>
          .
        </label>
      </div>
    </div>
  )
}
