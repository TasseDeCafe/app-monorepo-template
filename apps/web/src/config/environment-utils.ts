export const isProduction = (): boolean => {
  return !isDevelopmentForMobile() && getModeName() === 'production'
}

export const isTest = (): boolean => {
  return !isDevelopmentForMobile() && getModeName() === 'test'
}

export const isDevelopment = () => {
  // we need to check for mobile because mobile development actually runs with vite's MODE set to 'development' too
  return !isDevelopmentForMobile() && getModeName() === 'development'
}

export const isDevelopmentForMobile = () => {
  // we check for a custom environment variables instead of the vite's special envvar MODE because it's cumbersome to
  // add another mode, we'd have to create a new vite config file
  return import.meta.env.VITE_IS_FOR_MOBILE === 'true' && getModeName() === 'development'
}

export const getModeName = () => {
  return import.meta.env.MODE
}
