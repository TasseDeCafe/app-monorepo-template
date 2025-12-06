import { useEffect } from 'react'
import { isHashEnabledModalId } from '../../modal/modal-utils.ts'
import { useLocation } from '@tanstack/react-router'
import { useModalStore } from '@/stores/modal-store'

export const HashToStateSynchronizer = () => {
  const isHashLoaded = useModalStore((state) => state.isHashLoaded)
  const setIsHashLoaded = useModalStore((state) => state.setIsHashLoaded)
  const openModal = useModalStore((state) => state.openModal)
  const location = useLocation()

  useEffect(() => {
    if (!isHashLoaded) {
      setIsHashLoaded(true)
      const hash = location.hash.replace('#', '')

      const modalId = `${hash}-modal-id`
      if (isHashEnabledModalId(modalId)) {
        openModal(modalId)
      }
    }
  }, [isHashLoaded, setIsHashLoaded, openModal, location.hash])

  return <></>
}
