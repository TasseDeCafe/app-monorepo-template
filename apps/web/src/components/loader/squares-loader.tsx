import { useState, useEffect } from 'react'
import { squareColorIntensities } from './squares-colors.tsx'

export const SquaresLoader = () => {
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
    <div className='h-10 w-10 rounded-lg bg-white md:h-12 md:w-12'>
      <div className='grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5 md:gap-1'>
        <div
          className={`rounded-tl-md transition-colors duration-300 md:rounded-tl-lg`}
          style={{ backgroundColor: topLeftColor }}
        />
        <div
          className={`rounded-tr-md transition-colors duration-300 ease-in-out md:rounded-tr-lg`}
          style={{ backgroundColor: topRightColor }}
        />
        <div
          className={`rounded-bl-md transition-colors duration-300 ease-in-out md:rounded-bl-lg`}
          style={{ backgroundColor: bottomLeftColor }}
        />
        <div
          className={`rounded-br-md transition-colors duration-300 ease-in-out md:rounded-br-lg`}
          style={{ backgroundColor: bottomRightColor }}
        />
      </div>
    </div>
  )
}
