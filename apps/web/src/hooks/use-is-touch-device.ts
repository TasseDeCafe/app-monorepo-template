import { useEffect, useState } from 'react'

const pointerQuery = '(pointer: coarse)'

const getInitialTouchState = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia(pointerQuery).matches
}

const useIsTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(getInitialTouchState)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const matchMedia = window.matchMedia(pointerQuery)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsTouchDevice(e.matches)
    }

    matchMedia.addEventListener('change', handleChange)

    return () => {
      matchMedia.removeEventListener('change', handleChange)
    }
  }, [])

  return isTouchDevice
}

export default useIsTouchDevice
