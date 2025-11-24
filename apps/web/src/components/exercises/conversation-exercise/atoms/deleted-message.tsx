import { BanIcon } from 'lucide-react'
import { useLingui } from '@lingui/react/macro'

export const DeletedMessage = () => {
  const { t } = useLingui()

  return (
    <span className='flex items-center gap-x-1 text-sm italic text-gray-400 md:gap-x-2'>
      <BanIcon className='h-4 w-4' />
      {t`Message deleted`}
    </span>
  )
}
