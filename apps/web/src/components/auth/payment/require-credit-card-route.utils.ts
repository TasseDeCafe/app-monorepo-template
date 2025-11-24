// this logic was getting so complex that I decided to write unit tests for it
export const shouldShowPaywall = (
  hasAllowedReferral: boolean,
  isCreditCardRequiredForAllFeatureFlag: boolean,
  shouldAppBeFreeForEveryoneFeatureFlag: boolean,
  isPremiumUser: boolean
): boolean => {
  if (shouldAppBeFreeForEveryoneFeatureFlag) {
    return false
  }
  return (hasAllowedReferral || isCreditCardRequiredForAllFeatureFlag) && !isPremiumUser
}
