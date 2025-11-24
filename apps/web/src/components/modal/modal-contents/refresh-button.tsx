import { Button } from '../../design-system/button'
import { useLingui } from '@lingui/react/macro'

interface RefreshButtonProps {
  disabled?: boolean
}

export const RefreshButton = ({ disabled }: RefreshButtonProps) => {
  const { t } = useLingui()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <Button
      onClick={handleRefresh}
      disabled={disabled}
      className='h-10 border bg-indigo-600 px-4 text-white disabled:bg-gray-400'
    >
      {t`Refresh`}
    </Button>
  )
}
