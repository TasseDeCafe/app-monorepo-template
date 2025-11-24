import { ShadcnTooltip } from '../../../../design-system/tooltip.tsx'
import { Languages } from 'lucide-react'
import { modalActions } from '../../../../../state/slices/modal-slice.ts'
import { TRANSLATE_TEXT_MODAL_ID } from '../../../../modal/modal-ids.ts'
import { useDispatch } from 'react-redux'

export const ExpectedTextTranslationButton = () => {
  const dispatch = useDispatch()

  const handleLanguagesClick = () => {
    dispatch(
      modalActions.openTranslationModal({
        modalId: TRANSLATE_TEXT_MODAL_ID,
      })
    )
  }

  return (
    <ShadcnTooltip content='Translation' side='top' sideOffset={5}>
      <div className='flex items-center justify-center' onClick={handleLanguagesClick}>
        <div className='flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-gray-700 transition-colors duration-100 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white'>
          <Languages className='h-5' />
        </div>
      </div>
    </ShadcnTooltip>
  )
}
