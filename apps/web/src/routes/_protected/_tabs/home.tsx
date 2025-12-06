import { createFileRoute } from '@tanstack/react-router'
import { useLingui } from '@lingui/react/macro'

const HomeView = () => {
  const { t } = useLingui()

  return (
    <div className='flex flex-col gap-4 px-4 py-2'>
      <div className='mt-3'>
        <h2 className='text-lg font-semibold text-gray-800'>{t`Your Learning Streak`}</h2>
      </div>
      <div className='mt-4'>
        <h2 className='text-lg font-semibold text-gray-800'>{t`Our Exercises`}</h2>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_protected/_tabs/home')({
  component: HomeView,
})
