export const isProduction = (): boolean => {
  return !isDevelopmentForMobile() && getModeName() === 'production'
}

export const isTest = (): boolean => {
  return !isDevelopmentForMobile() && getModeName() === 'test'
}

export const isDevelopment = () => {
  return !isDevelopmentForMobile() && getModeName() === 'development'
}

export const isDevelopmentForMobile = () => {
  return process.env.NEXT_PUBLIC_IS_FOR_MOBILE === 'true' && getModeName() === 'development'
}

export const getModeName = () => {
  return process.env.NODE_ENV
}
