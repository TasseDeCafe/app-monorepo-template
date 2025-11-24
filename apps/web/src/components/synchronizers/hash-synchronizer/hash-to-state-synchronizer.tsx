import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { modalActions, selectIsHashLoaded } from '../../../state/slices/modal-slice.ts'
import { isHashEnabledModalId } from '../../modal/modal-utils.ts'
import { useLocation } from 'react-router-dom'

export const HashToStateSynchronizer = () => {
  const dispatch = useDispatch()
  const isHashLoaded = useSelector(selectIsHashLoaded)
  const location = useLocation()

  useEffect(() => {
    if (!isHashLoaded) {
      dispatch(modalActions.setIsHashLoaded(true))
      const hash = location.hash.replace('#', '')

      const modalId = `${hash}-modal-id`
      if (isHashEnabledModalId(modalId)) {
        dispatch(modalActions.openModal(modalId))
      }
    }
  }, [isHashLoaded, dispatch, location.hash])

  return <></>
}
