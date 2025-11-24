import { SettingsForm } from '../../settings/settings-form'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../shadcn/dialog'
import { useLingui } from '@lingui/react/macro'

export const ProfileSettingsModalContent = () => {
  const { t } = useLingui()

  const handleSettingsFormSubmit = () => {}

  return (
    <DialogContent className='flex max-h-[90vh] w-11/12 flex-col overflow-y-auto rounded-xl bg-white shadow-xl sm:max-w-md'>
      <DialogHeader className='mb-6'>
        <DialogTitle className='text-2xl font-bold'>{t`Settings`}</DialogTitle>
        <DialogDescription className='text-sm text-gray-400'>{t`Make changes to your settings here`}</DialogDescription>
      </DialogHeader>
      <SettingsForm onSubmit={handleSettingsFormSubmit} />
    </DialogContent>
  )
}
