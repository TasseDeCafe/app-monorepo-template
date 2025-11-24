import { motion } from 'motion/react'
import colors from 'tailwindcss/colors'

interface Props {
  scoreInPercentage: number
  color: string
}

export const AnimatedCircleProgress = ({ scoreInPercentage, color }: Props) => {
  const size = 150
  const strokeWidth = 10
  const duration = 1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillPercentage = (scoreInPercentage / 100) * circumference

  return (
    <div className='relative' style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='rotate-[-90deg]'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={colors.gray[200]}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - fillPercentage }}
          transition={{ duration, ease: 'easeInOut' }}
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <motion.span
          className='text-lg'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: duration / 2, delay: duration / 2 }}
        >
          {scoreInPercentage.toFixed(2)}%
        </motion.span>
      </div>
    </div>
  )
}
