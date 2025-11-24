import { describe, expect, test } from 'vitest'
import { shouldShowPaywall } from '@/components/auth/payment/require-credit-card-route.utils.ts'

describe('shouldShowPaywall', () => {
  describe('if paid, we should never show the paywall', () => {
    const isPremiumUser = true
    test('1', () => {
      const hasAllowedReferral = true
      const isCreditCardRequiredForAllFeatureFlag = false
      const shouldAppBeFreeForEveryoneFeatureFlag = true
      expect(
        shouldShowPaywall(
          hasAllowedReferral,
          isCreditCardRequiredForAllFeatureFlag,
          shouldAppBeFreeForEveryoneFeatureFlag,
          isPremiumUser
        )
      ).toEqual(false)
    })
    test('2', () => {
      const hasAllowedReferral = false
      const isCreditCardRequiredForAllFeatureFlag = false
      const shouldAppBeFreeForEveryoneFeatureFlag = false
      expect(
        shouldShowPaywall(
          hasAllowedReferral,
          isCreditCardRequiredForAllFeatureFlag,
          shouldAppBeFreeForEveryoneFeatureFlag,
          isPremiumUser
        )
      ).toEqual(false)
    })
    test('3', () => {
      const hasAllowedReferral = true
      const isCreditCardRequiredForAllFeatureFlag = false
      const shouldAppBeFreeForEveryoneFeatureFlag = true
      expect(
        shouldShowPaywall(
          hasAllowedReferral,
          isCreditCardRequiredForAllFeatureFlag,
          shouldAppBeFreeForEveryoneFeatureFlag,
          isPremiumUser
        )
      ).toEqual(false)
    })
  })
  describe('if did NOT pay', () => {
    const isPremiumUser = false
    test('1', () => {
      const hasAllowedReferral = true
      const isCreditCardRequiredForAllFeatureFlag = false
      const shouldAppBeFreeForEveryoneFeatureFlag = true
      expect(
        shouldShowPaywall(
          hasAllowedReferral,
          isCreditCardRequiredForAllFeatureFlag,
          shouldAppBeFreeForEveryoneFeatureFlag,
          isPremiumUser
        )
      ).toEqual(false)
    })
    test('2', () => {
      const hasAllowedReferral = false
      const isCreditCardRequiredForAllFeatureFlag = false
      const shouldAppBeFreeForEveryoneFeatureFlag = false
      expect(
        shouldShowPaywall(
          hasAllowedReferral,
          isCreditCardRequiredForAllFeatureFlag,
          shouldAppBeFreeForEveryoneFeatureFlag,
          isPremiumUser
        )
      ).toEqual(false)
    })
    test('3', () => {
      const hasAllowedReferral = true
      const isCreditCardRequiredForAllFeatureFlag = false
      const shouldAppBeFreeForEveryoneFeatureFlag = true
      expect(
        shouldShowPaywall(
          hasAllowedReferral,
          isCreditCardRequiredForAllFeatureFlag,
          shouldAppBeFreeForEveryoneFeatureFlag,
          isPremiumUser
        )
      ).toEqual(false)
    })

    test('4', () => {
      const hasAllowedReferral = true
      const isCreditCardRequiredForAllFeatureFlag = false
      const shouldAppBeFreeForEveryoneFeatureFlag = false
      expect(
        shouldShowPaywall(
          hasAllowedReferral,
          isCreditCardRequiredForAllFeatureFlag,
          shouldAppBeFreeForEveryoneFeatureFlag,
          isPremiumUser
        )
      ).toEqual(true)
    })
  })
})
