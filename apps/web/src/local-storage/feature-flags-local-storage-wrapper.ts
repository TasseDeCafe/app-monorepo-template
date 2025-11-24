import { LOCAL_STORAGE_CONSTANTS } from './local-storage-constants.ts'

export const featureFlagsLocalStorageWrapper = {
  setIsPosthogDebugEnabledFeatureFlag: (value: boolean): void => {
    if (value) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.FEATURE_FLAGS.IS_POSTHOG_DEBUG_ENABLED, value.toString())
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.FEATURE_FLAGS.IS_POSTHOG_DEBUG_ENABLED)
    }
  },
  getIsPosthogDebugEnabledFeatureFlag: (): boolean => {
    const value: string | null = localStorage.getItem(LOCAL_STORAGE_CONSTANTS.FEATURE_FLAGS.IS_POSTHOG_DEBUG_ENABLED)
    return value === 'true'
  },
}
