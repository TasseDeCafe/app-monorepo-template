import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HASH_ENABLED_MODAL_IDS } from '../../modal/modal-ids.ts'
import { useModalStore, getShouldUrlHaveModalHash } from '@/stores/modal-store'

export const StateToHashSynchronizer = () => {
  const modalId = useModalStore((state) => state.modalId)
  const isHashLoaded = useModalStore((state) => state.isHashLoaded)
  const shouldUrlHaveModalHash = useModalStore(getShouldUrlHaveModalHash)
  const navigate = useNavigate()
  const location = useLocation()

  const stripHashFromCurrentUrl = useCallback(() => {
    navigate(location.pathname, { replace: true })
  }, [location.pathname, navigate])

  const addHashToCurrentUrl = useCallback(
    (hash: string) => {
      navigate({ hash: hash }, { replace: true })
    },
    [navigate]
  )

  useEffect(() => {
    if (isHashLoaded) {
      const currentHash = window.location.hash.replace('#', '')
      if (shouldUrlHaveModalHash) {
        const modalHash = modalId.replace('-modal-id', '')
        addHashToCurrentUrl(modalHash)
      }

      // if(!shouldUrlHaveModalHash) would not be enough because we do not want to strip hashes in all cases.
      // One such example is the google/supabase redirect, it uses #access_token.... in the url
      if (!shouldUrlHaveModalHash && HASH_ENABLED_MODAL_IDS.includes(`${currentHash}-modal-id`)) {
        stripHashFromCurrentUrl()
      }
    }
  }, [isHashLoaded, shouldUrlHaveModalHash, modalId, addHashToCurrentUrl, stripHashFromCurrentUrl])

  return <></>
}
