import { useDispatch, useSelector } from 'react-redux'
import { Check, Loader2, Pencil, X } from 'lucide-react'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../shadcn/dialog.tsx'
import { modalActions } from '@/state/slices/modal-slice.ts'
import { DANGER_ZONE_MODAL_ID } from '../../modal-ids.ts'
import { Button } from '../../../design-system/button.tsx'
import { Input } from '../../../shadcn/input.tsx'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { selectEmail, selectFullName } from '@/state/slices/account-slice.ts'
import { useState } from 'react'
import { useNicknameForm } from '@/hooks/use-nickname-form.ts'
import { MarketingEmailsToggle } from './marketing-emails-toggle'
import { useLingui } from '@lingui/react/macro'

export const AccountModalContent = () => {
  const { t } = useLingui()

  const dispatch = useDispatch()
  const fullName = useSelector(selectFullName)
  const email = useSelector(selectEmail)
  const [isEditingNickname, setIsEditingNickname] = useState(false)

  const {
    register,
    onSubmit,
    errors,
    nickname,
    currentNickname,
    isButtonEnabled,
    isSubmitting,
    nicknameAvailabilityData,
    isCheckingNicknameAvailability,
    reset,
  } = useNicknameForm(() => setIsEditingNickname(false))

  const handleCancelEdit = () => {
    setIsEditingNickname(false)
    reset()
  }

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

        <div className='flex min-h-20 flex-col'>
          <span className='text-sm font-medium text-gray-500'>{t`Public nickname`}</span>
          <div className='h-13'>
            {isEditingNickname ? (
              <form onSubmit={onSubmit} className='mt-1'>
                <div className='flex gap-x-2'>
                  <Input {...register('nickname')} placeholder={t`Enter nickname`} className='h-9' />
                  <Button type='submit' disabled={!isButtonEnabled} className='h-9 px-3'>
                    {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Check className='h-4 w-4' />}
                  </Button>
                  <Button type='button' onClick={handleCancelEdit} className='h-9 px-3'>
                    <X className='h-4 w-4' />
                  </Button>
                </div>
                <div className='mt-1'>
                  {errors.nickname && <p className='text-sm text-red-500'>{errors.nickname.message as string}</p>}
                  {nickname && !errors.nickname && nickname !== currentNickname && (
                    <>
                      {!isCheckingNicknameAvailability && nicknameAvailabilityData && (
                        <p
                          className={
                            nicknameAvailabilityData.isAvailable ? 'text-sm text-green-500' : 'text-sm text-red-500'
                          }
                        >
                          {nicknameAvailabilityData.message}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </form>
            ) : (
              <div className='mt-1 flex items-center gap-x-2'>
                <span className='text-base text-stone-900'>{currentNickname || t`No nickname set`}</span>
                <Button type='submit' onClick={() => setIsEditingNickname(true)} className='h-6 px-3'>
                  <Pencil size={2} color='black' className='h-4 w-4' />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className='flex min-h-20 flex-col'>
          <MarketingEmailsToggle />
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
