import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shadcn/dialog.tsx'
import { EXTERNAL_LINKS } from '@yourbestaccent/core/constants/external-links.ts'
import { isUsingPolishLanguage } from '@/utils/language-detection-utils.ts'
import { Button } from '../../design-system/button.tsx'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { useLingui } from '@lingui/react/macro'

export const AboutModalContent = () => {
  const { t } = useLingui()

  const isUsingPolish = isUsingPolishLanguage()
  const handleClick = () => {
    POSTHOG_EVENTS.click('open_feedback_form_button')
    if (isUsingPolish) {
      window.open(EXTERNAL_LINKS.BETA_VERSION_FEEDBACK_FORM_IN_POLISH, '_blank')
    } else {
      window.open(EXTERNAL_LINKS.BETA_VERSION_FEEDBACK_FORM_IN_ENGLISH, '_blank')
    }
  }

  return (
    <DialogContent className='max-h-[90vh] w-11/12 rounded-xl bg-white p-6 shadow-xl sm:max-w-md'>
      <DialogHeader className='mb-4'>
        <DialogTitle className='text-2xl font-bold'>{t`About`}</DialogTitle>
        <DialogDescription className='hidden'></DialogDescription>
      </DialogHeader>
      <div className='mb-4 flex w-full items-center justify-center'>
        <img src='/sebastien-and-kamil.jpg' className='h-20 w-20 rounded-full' alt={t`Kamil and Sébastien`} />
      </div>
      <p className='mb-4 text-sm text-gray-700'>{t`Hey there! It's Kamil and Sébastien here, the creators of yourbestaccent.com. We've been pouring our hearts into developing this app and your feedback is crucial for us. We're excited to roll out new features soon.`}</p>
      <p className='mb-6 text-sm text-gray-700'>{t`Please let us know what you think about the app by filling out our feedback form!`}</p>
      <Button onClick={handleClick} className='w-full rounded-xl bg-indigo-600 px-4 py-2 text-white'>
        {t`Open the form`}
      </Button>
    </DialogContent>
  )
}
