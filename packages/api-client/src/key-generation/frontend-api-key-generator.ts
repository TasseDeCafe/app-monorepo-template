// a part of this file exists on frontend in a minified form (it definitely should be minified),
// currently frontend minification is handled by next.js
const seed = '4959308'
const LENGTH_OF_API_KEY = 7

const FREQUENCY_OF_FRONTEND_API_KEY_GENERATION_IN_SECONDS: number = 60

// Both frontend and backend use the same method for generating an apikey
// every 60 seconds a new apiKey is generated.
export const generateFrontendApiKey = (millisecondsFrom1970: number, offSetInSeconds: number): string => {
  const secondsFrom1970 = millisecondsFrom1970 / 1000 + offSetInSeconds
  // we add 1 at the end so that alpha is never equal zero, this would mess up the multiplication in our hash multiplication
  const alpha = Math.floor(secondsFrom1970 / FREQUENCY_OF_FRONTEND_API_KEY_GENERATION_IN_SECONDS) + 1
  const result = simplePseudoHash(seed, alpha)
  return result
}

const simplePseudoHash = (seed: string, alpha: number): string => {
  const result = (Number(seed) * 219 * alpha + 331 * alpha).toString().substring(0, LENGTH_OF_API_KEY)
  return result
}

export const __generateCurrentFrontendApiKey = (millisecondsFrom1970: number): string => {
  return generateFrontendApiKey(millisecondsFrom1970, 0)
}

const generatePreviousFrontendApiKey = (millisecondsFrom1970: number): string => {
  return generateFrontendApiKey(millisecondsFrom1970, -FREQUENCY_OF_FRONTEND_API_KEY_GENERATION_IN_SECONDS)
}

const generateNextFrontendApiKey = (millisecondsFrom1970: number): string => {
  return generateFrontendApiKey(millisecondsFrom1970, FREQUENCY_OF_FRONTEND_API_KEY_GENERATION_IN_SECONDS)
}

export const isCorrectFrontendApiKey = (apiKey: string, millisecondsFrom1970: number): boolean => {
  const result =
    apiKey === generatePreviousFrontendApiKey(millisecondsFrom1970) ||
    apiKey === __generateCurrentFrontendApiKey(millisecondsFrom1970) ||
    apiKey === generateNextFrontendApiKey(millisecondsFrom1970)
  return result
}
