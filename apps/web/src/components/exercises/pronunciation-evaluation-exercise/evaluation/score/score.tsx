import { AnimatedCircleProgress } from './animated-circle-score.tsx'
import { AnimatedHorizontalProgress } from './animated-progress-bar.tsx'
import colors from 'tailwindcss/colors'

const getColor = (score: number) => {
  if (score >= 75) {
    return colors.green[300]
  } else if (score >= 50) {
    return colors.orange[300]
  } else if (score >= 25) {
    return colors.yellow[200]
  } else {
    return colors.red[300]
  }
}

export const Score = ({ scoreInPercentage }: { scoreInPercentage: number }) => {
  const color = getColor(scoreInPercentage)
  return (
    <div className='flex w-full flex-col items-center py-2 md:py-4'>
      <div className='hidden md:flex'>
        <AnimatedCircleProgress scoreInPercentage={scoreInPercentage} color={color} />
      </div>
      <div className='flex md:hidden'>
        <AnimatedHorizontalProgress scoreInPercentage={scoreInPercentage} color={color} />
      </div>
    </div>
  )
}
