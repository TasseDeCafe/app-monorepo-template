import { motion } from 'motion/react'

interface Props {
  scoreInPercentage: number
  color: string
}

export const AnimatedHorizontalProgress = ({ scoreInPercentage, color }: Props) => {
  const width = 300
  const height = 20
  const duration = 1
  const fillWidth = (scoreInPercentage / 100) * width

  return (
    <div className='relative' style={{ width, height }}>
      <div className='absolute inset-0 rounded-full bg-gray-200' />
      <motion.div
        className='absolute inset-y-0 left-0 rounded-full'
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: fillWidth }}
        transition={{ duration, ease: 'easeOut' }}
      />
      <motion.div
        className='absolute inset-0 flex items-center justify-center pr-2'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration / 2, delay: duration / 2 }}
      >
        <span className='text-sm font-bold text-stone-600'>{scoreInPercentage.toFixed(2)}%</span>
      </motion.div>
    </div>
  )
}
