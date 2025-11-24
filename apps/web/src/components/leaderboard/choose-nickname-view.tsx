import { useNavigate } from 'react-router-dom'
import { Button } from '../design-system/button.tsx'
import { Input } from '../shadcn/input.tsx'
import { useNicknameForm } from '../../hooks/use-nickname-form'
import { WithNavbar } from '../navbar/with-navbar.tsx'
import { useLingui } from '@lingui/react/macro'

export const ChooseNicknameView = () => {
  const { t } = useLingui()

  const navigate = useNavigate()

  const {
    register,
    onSubmit,
    errors,
    nickname,
    isButtonEnabled,
    isSubmitting,
    nicknameAvailabilityData,
    isCheckingNicknameAvailability,
  } = useNicknameForm(() => navigate('/leaderboard', { replace: true }))

  return (
    <WithNavbar>
      <div className='container gap-y-4 px-4 py-6 pt-8 md:w-1/2 3xl:w-1/3'>
        <h1 className='mb-2 text-center text-4xl font-bold'>{t`Choose your nickname`}</h1>
        <p className='mb-8 text-center text-muted-foreground'>{t`This nickname will be public. You can always change it later.`}</p>

        <form onSubmit={onSubmit} className='space-y-3'>
          <div className='flex justify-center'>
            <Input
              placeholder={t`Type your nickname`}
              {...register('nickname')}
              className='h-14 w-full rounded-xl bg-white text-lg'
            />
          </div>

          <div className='min-h-[20px]'>
            {errors.nickname && <p className='text-sm text-red-500'>{errors.nickname.message as string}</p>}
            {nickname && !errors.nickname && (
              <>
                {!isCheckingNicknameAvailability && nicknameAvailabilityData && (
                  <p
                    className={nicknameAvailabilityData.isAvailable ? 'text-sm text-green-500' : 'text-sm text-red-500'}
                  >
                    {nicknameAvailabilityData.message}
                  </p>
                )}
              </>
            )}
          </div>

          <div className='fixed bottom-0 left-0 right-0 w-full bg-gray-50 pb-4'>
            <div className='flex justify-center px-4'>
              <Button
                type='submit'
                className='w-full rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-500 px-4 py-2 font-medium text-white md:w-1/2 3xl:w-1/3'
                disabled={!isButtonEnabled}
              >
                {isSubmitting ? t`Saving...` : t`Join Leaderboard`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </WithNavbar>
  )
}
