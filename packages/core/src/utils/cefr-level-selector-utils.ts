export type Level = {
  name: string
  range: [number, number]
  color: string
  visualWidth: number
}

export const A1_UPPER_BOUND = 500
export const Levels: Level[] = [
  { name: 'A1', range: [0, A1_UPPER_BOUND], color: 'bg-red-500', visualWidth: 15 },
  { name: 'A2', range: [A1_UPPER_BOUND + 1, 1500], color: 'bg-orange-500', visualWidth: 15 },
  { name: 'B1', range: [1501, 3500], color: 'bg-yellow-500', visualWidth: 15 },
  { name: 'B2', range: [3501, 7500], color: 'bg-green-500', visualWidth: 15 },
  { name: 'C1', range: [7501, 15000], color: 'bg-blue-500', visualWidth: 15 },
  { name: 'C2', range: [15001, 20000], color: 'bg-purple-500', visualWidth: 15 },
]

// Calculate total visual width for slider conversion
export const totalVisualWidth = Levels.reduce((sum, level) => sum + level.visualWidth, 0)

export const getCurrentLevel = (position: number): Level => {
  const level = Levels.find((level) => position >= level.range[0] && position <= level.range[1])
  return level || Levels[Levels.length - 1] // Return the last level if no match is found
}

export const positionToSliderValue = (position: number): number => {
  let accumulatedWidth = 0
  for (const level of Levels) {
    if (position <= level.range[1]) {
      const levelProgress = (position - level.range[0]) / (level.range[1] - level.range[0])
      return accumulatedWidth + levelProgress * level.visualWidth
    }
    accumulatedWidth += level.visualWidth
  }
  return totalVisualWidth
}

export const sliderValueToPosition = (value: number): number => {
  let accumulatedWidth = 0
  for (const level of Levels) {
    if (value <= accumulatedWidth + level.visualWidth) {
      const levelProgress = (value - accumulatedWidth) / level.visualWidth
      return Math.round(level.range[0] + levelProgress * (level.range[1] - level.range[0]))
    }
    accumulatedWidth += level.visualWidth
  }
  return Levels[Levels.length - 1].range[1] // Return max position if slider is at the end
}
