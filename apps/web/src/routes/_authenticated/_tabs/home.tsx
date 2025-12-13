import { createFileRoute } from '@tanstack/react-router'
import { useLingui } from '@lingui/react/macro'

const HomeView = () => {
  const { t } = useLingui()

  return (
    <div className='flex flex-col gap-4 px-4 py-2'>
      <div className='mt-3'>
        <h2 className='text-lg font-semibold text-gray-800'>{t`Some text for the Home tab`}</h2>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/_tabs/home')({
  component: HomeView,
})
