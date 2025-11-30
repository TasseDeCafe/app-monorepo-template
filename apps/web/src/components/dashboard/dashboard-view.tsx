import { useLingui } from '@lingui/react/macro'

export const DashboardView = () => {
  const { t } = useLingui()

  return (
    <div className='hidden w-full flex-col items-center p-2 py-4 md:container lg:flex 3xl:py-16'>
      {t`Some longer text for the dashboard.`}
    </div>
  )
}
