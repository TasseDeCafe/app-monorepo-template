import { useEffect, useState } from 'react'

interface UseScrollLoadMoreProps {
  loadMore: () => void
  hasMore: boolean
  threshold?: number
}

export const useLoadMoreOnDocumentScroll = ({ loadMore, hasMore }: UseScrollLoadMoreProps) => {
  const THRESHOLD = 200
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoading) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      if (scrollTop + windowHeight >= documentHeight - THRESHOLD) {
        setIsLoading(true)
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMore, hasMore, isLoading, THRESHOLD])

  const resetLoading = () => setIsLoading(false)

  return { isLoading, resetLoading }
}
