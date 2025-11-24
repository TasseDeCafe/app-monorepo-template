import { useState, useEffect } from 'react'
import { squareColorIntensities } from './squares-colors.tsx'

export const RoundedLoader = () => {
  const [currentColorIndex, setCurrentColorIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentColorIndex((prevIndex) => (prevIndex + 1) % squareColorIntensities.length)
    }, 300)

    return () => clearInterval(intervalId)
  }, [])

  const topLeftColor = squareColorIntensities[currentColorIndex][0][0]
  const topRightColor = squareColorIntensities[currentColorIndex][0][1]
  const bottomLeftColor = squareColorIntensities[currentColorIndex][1][0]
  const bottomRightColor = squareColorIntensities[currentColorIndex][1][1]
  return (
    <div className='h-10 w-10 rounded-full bg-white'>
      <div className='grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 md:gap-1'>
        <div className={`rounded-tl-full transition-colors duration-300`} style={{ backgroundColor: topLeftColor }} />
        <div
          className={`rounded-tr-full transition-colors duration-300 ease-in-out`}
          style={{ backgroundColor: topRightColor }}
        />
        <div
          className={`rounded-bl-full transition-colors duration-300 ease-in-out`}
          style={{ backgroundColor: bottomLeftColor }}
        />
        <div
          className={`rounded-br-full transition-colors duration-300 ease-in-out`}
          style={{ backgroundColor: bottomRightColor }}
        />
      </div>
    </div>
  )
}
