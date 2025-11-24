'use client'
import { useState, useEffect } from 'react'

export const useDidScroll = () => {
  const [userScrolled, setUserScrolled] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!userScrolled) {
        setUserScrolled(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [userScrolled])
  return userScrolled
}
