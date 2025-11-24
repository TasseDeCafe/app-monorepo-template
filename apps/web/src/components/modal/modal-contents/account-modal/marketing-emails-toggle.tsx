import { Popover, PopoverContent, PopoverTrigger } from '../../../shadcn/popover'
import { CircleHelp } from 'lucide-react'
import { Toggle } from '../../../design-system/toggle'
import {
  useShouldReceiveMarketingEmails,
  useUpdateMarketingEmailPreferences,
} from '@/hooks/api/user-marketing-preferences/user-marketing-preferences-hooks'
import { useLingui } from '@lingui/react/macro'

export const MarketingEmailsToggle = () => {
  const { t } = useLingui()

  const shouldReceiveMarketingEmails = useShouldReceiveMarketingEmails()
  const { mutate: updateMarketingEmailPreferencesMutation } = useUpdateMarketingEmailPreferences()

  return (
    <div className='flex flex-col gap-y-1'>
      <span className='text-sm font-medium text-gray-500'>{t`Email notifications`}</span>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <span className='text-base text-stone-900'>{t`Product updates`}</span>
          <Popover>
            <PopoverTrigger>
              <CircleHelp className='h-4 w-4 text-gray-400' />
            </PopoverTrigger>
            <PopoverContent className='w-64 bg-white text-sm'>
              {t`Stay informed about new features, learning tips, and special offers to enhance your language learning journey. You can unsubscribe at any time.`}
            </PopoverContent>
          </Popover>
        </div>
        <Toggle
          isToggled={shouldReceiveMarketingEmails}
          onClick={() =>
            updateMarketingEmailPreferencesMutation({
              shouldReceiveMarketingEmails: !shouldReceiveMarketingEmails,
            })
          }
          size='lg'
        />
      </div>
    </div>
  )
}
