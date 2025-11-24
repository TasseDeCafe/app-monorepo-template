import { ExpectedWordProps } from '../types.ts'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import type { Transition, Variants } from 'motion'
import { BaseExpectedWord } from '@/components/exercises/pronunciation-evaluation-exercise/evaluation/atoms/expected-word-base.tsx'

export const ExpectedWord = ({ wordPairWithAlignment, onClick, generatedAudioPlayerRef }: ExpectedWordProps) => {
  const { expectedStartTimeInMs, expectedEndTimeInMs } = wordPairWithAlignment
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!generatedAudioPlayerRef?.current || expectedStartTimeInMs === null || expectedEndTimeInMs === null) {
      return
    }

    const checkTime = () => {
      const currentTime = generatedAudioPlayerRef.current!.getCurrentTime()
      const currentTimeMs = currentTime * 1000

      const isWordActive = currentTimeMs >= expectedStartTimeInMs && currentTimeMs < expectedEndTimeInMs

      if (isWordActive !== isActive) {
        setIsActive(isWordActive)
      }
    }

    const interval = setInterval(checkTime, 50)

    return () => {
      clearInterval(interval)
    }
  }, [expectedStartTimeInMs, expectedEndTimeInMs, generatedAudioPlayerRef, isActive])

  const springTransition: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  }

  const variants: Variants = {
    active: {
      scale: 1.2,
      transition: springTransition,
    },
    inactive: {
      scale: 1,
    },
  }

  return (
    <motion.div
      initial='inactive'
      animate={expectedStartTimeInMs !== null && isActive ? 'active' : 'inactive'}
      variants={variants}
      onClick={onClick}
      className='group relative flex h-8 items-center rounded-xl border-l border-r border-t border-gray-200 hover:bg-gray-100 active:bg-gray-200 md:h-10'
    >
      <BaseExpectedWord wordPair={wordPairWithAlignment} />
    </motion.div>
  )
}
