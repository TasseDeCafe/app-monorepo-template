import { useDispatch, useSelector } from 'react-redux'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { modalActions } from '@/state/slices/modal-slice.ts'
import { DANGER_ZONE_MODAL_ID } from '../../modal-ids.ts'
import { Button } from '../../../design-system/button.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { selectEmail, selectFullName } from '@/state/slices/account-slice.ts'
import { useLingui } from '@lingui/react/macro'

export const AccountModalContent = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const fullName = useSelector(selectFullName)
  const email = useSelector(selectEmail)

  return (
    <DialogContent className='flex max-h-[90vh] w-11/12 flex-col overflow-y-auto rounded-xl bg-white shadow-xl sm:max-w-md'>
      <DialogHeader>
        <DialogTitle className='text-2xl font-bold text-stone-900'>{t`Account`}</DialogTitle>
        <DialogDescription className='text-sm text-gray-600'>{t`Your account information and settings.`}</DialogDescription>
      </DialogHeader>
      <div className='flex flex-col gap-y-4'>
        {fullName && (
          <div className='flex flex-col'>
            <span className='text-sm font-medium text-gray-500'>{t`Full Name`}</span>
            <span className='text-base text-stone-900'>{fullName}</span>
          </div>
        )}

        <div className='flex flex-col'>
          <span className='text-sm font-medium text-gray-500'>{t`Email`}</span>
          <span className='text-base text-stone-900'>{email}</span>
        </div>
      </div>
      <div className='flex flex-col gap-y-4'>
        <div className='flex w-full flex-row items-center'>
          <Button
            onClick={() => dispatch(modalActions.closeModal())}
            href={ROUTE_PATHS.PRICING}
            className='h-12 w-full border bg-indigo-600 text-white'
          >
            <span>{t`Billing`}</span>
          </Button>
        </div>

        <div className='flex w-full flex-row items-center'>
          <Button
            onClick={() => dispatch(modalActions.openModal(DANGER_ZONE_MODAL_ID))}
            className='h-12 w-full border bg-white text-red-600'
          >
            <span>{t`Danger Zone`}</span>
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}
