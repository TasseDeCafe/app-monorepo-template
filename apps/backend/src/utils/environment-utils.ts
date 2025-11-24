export enum SupportedEnvironments {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  DEVELOPMENT_FOR_MOBILE = 'development-for-mobile',
  TEST = 'test',
  DEVELOPMENT_WITHOUT_THIRD_PARTIES = 'development-without-third-parties',
  DEVELOPMENT_WITHOUT_THIRD_PARTIES_FOR_MOBILE = 'development-without-third-parties-for-mobile',
}

export const isProduction = (): boolean => {
  return getEnvironmentName() === SupportedEnvironments.PRODUCTION
}

export const isDevelopment = (): boolean => {
  return getEnvironmentName() === SupportedEnvironments.DEVELOPMENT
}

export const isDevelopmentForMobile = (): boolean => {
  return getEnvironmentName() === SupportedEnvironments.DEVELOPMENT_FOR_MOBILE
}

export const isTest = (): boolean => {
  return getEnvironmentName() === SupportedEnvironments.TEST
}

export const isDevelopmentWithoutThirdParties = (): boolean => {
  return getEnvironmentName() === SupportedEnvironments.DEVELOPMENT_WITHOUT_THIRD_PARTIES
}

export const isDevelopmentWithoutThirdPartiesForMobile = (): boolean => {
  return getEnvironmentName() === SupportedEnvironments.DEVELOPMENT_WITHOUT_THIRD_PARTIES_FOR_MOBILE
}

export const getEnvironmentName = (): string | undefined => {
  return process.env.NODE_ENV
}
