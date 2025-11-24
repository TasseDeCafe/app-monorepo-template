import { RefObject, useEffect } from 'react'

interface UseIntersectionObserverProps {
  target: RefObject<Element | null>
  onIntersect: () => void
  threshold?: number
  rootMargin?: string
  enabled?: boolean
}

export const useIntersectionObserver = ({
  target,
  onIntersect,
  threshold = 0.1,
  rootMargin = '50px',
  enabled = true,
}: UseIntersectionObserverProps) => {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect()
          }
        })
      },
      {
        rootMargin,
        threshold,
      }
    )

    const element = target.current
    if (!element) {
      return
    }

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [target, enabled, onIntersect, rootMargin, threshold])
}
