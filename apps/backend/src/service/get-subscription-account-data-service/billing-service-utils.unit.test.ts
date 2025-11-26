import { describe, expect, test } from 'vitest'
import { calculateStripePricingDetails } from './billing-service-utils'
import { referralToDiscount } from '@template-app/core/constants/referral-constants'
import { Discounts } from '@template-app/core/constants/discount-types'

describe('calculatePricingDetails', () => {
  const soundLikeARussianActiveDiscountsAsMap: Record<string, Discounts> = {
    sound_like_a_russian: {
      areActive: true,
      monthly: {
        discountAsPercentage: 20,
        stripeCouponId: 'sound_like_a_russian_monthly',
        commissionLimit: null,
        durationLimit: null,
      },
      yearly: {
        discountAsPercentage: 40,
        stripeCouponId: 'sound_like_a_russian_yearly',
        commissionLimit: null,
        durationLimit: null,
      },
    },
  }
  const soundLikeARussianInactiveDiscountsAsMap: Record<string, Discounts> = {
    sound_like_a_russian: {
      areActive: false,
      monthly: {
        discountAsPercentage: 20,
        stripeCouponId: 'sound_like_a_russian_monthly',
        commissionLimit: null,
        durationLimit: null,
      },
      yearly: {
        discountAsPercentage: 40,
        stripeCouponId: 'sound_like_a_russian_yearly',
        commissionLimit: null,
        durationLimit: null,
      },
    },
  }

  describe('discounts connected to real campaigns', () => {
    test('finnishwithheidi', () => {
      const pricingDetails = calculateStripePricingDetails('finnishwithheidi', referralToDiscount, null, null)
      expect(pricingDetails).toEqual({
        amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
        currentDiscountInPercentage: 0,
        hasSubscribedWithADiscount: false,
        currentlyAvailableDiscounts: null,
      })
    })
    test('plapla', () => {
      const pricingDetails = calculateStripePricingDetails('plapla', referralToDiscount, null, null)
      expect(pricingDetails).toEqual({
        amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
        currentDiscountInPercentage: 0,
        hasSubscribedWithADiscount: false,
        currentlyAvailableDiscounts: null,
      })
    })
  })

  describe('when discounts are still active', () => {
    describe('when user has no referral', () => {
      test('a user who is not subscribed', () => {
        const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianActiveDiscountsAsMap, null, null)
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
      test('a user who is subscribed to free_trial', () => {
        const pricingDetails = calculateStripePricingDetails(
          null,
          soundLikeARussianActiveDiscountsAsMap,
          null,
          'free_trial'
        )
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
      test('a user who is subscribed monthly', () => {
        const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianActiveDiscountsAsMap, 19, 'month')
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: 19,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
      test('a user who is subscribed yearly', () => {
        const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianActiveDiscountsAsMap, 189, 'year')
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: 189,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
    })

    describe('when user has a referral', () => {
      test('a user who is not subscribed', () => {
        const pricingDetails = calculateStripePricingDetails(
          'sound_like_a_russian',
          soundLikeARussianActiveDiscountsAsMap,
          null,
          null
        )
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: {
            monthly: {
              discountAsPercentage: 20,
              durationLimit: null,
            },
            yearly: {
              discountAsPercentage: 40,
              durationLimit: null,
            },
          },
        })
      })

      test('a user who is subscribed to free_trial', () => {
        const pricingDetails = calculateStripePricingDetails(
          'sound_like_a_russian',
          soundLikeARussianActiveDiscountsAsMap,
          null,
          'free_trial'
        )
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: {
            monthly: {
              discountAsPercentage: 20,
              durationLimit: null,
            },
            yearly: {
              discountAsPercentage: 40,
              durationLimit: null,
            },
          },
        })
      })

      describe('a user who subscribed without a discount', () => {
        test('a user who is subscribed monthly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianActiveDiscountsAsMap,
            19,
            'month'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 19,
            currentDiscountInPercentage: 0,
            hasSubscribedWithADiscount: false,
            currentlyAvailableDiscounts: {
              monthly: {
                discountAsPercentage: 20,
                durationLimit: null,
              },
              yearly: {
                discountAsPercentage: 40,
                durationLimit: null,
              },
            },
          })
        })
        test('a user who is subscribed yearly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianActiveDiscountsAsMap,
            189,
            'year'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 189,
            currentDiscountInPercentage: 0,
            hasSubscribedWithADiscount: false,
            currentlyAvailableDiscounts: {
              monthly: {
                discountAsPercentage: 20,
                durationLimit: null,
              },
              yearly: {
                discountAsPercentage: 40,
                durationLimit: null,
              },
            },
          })
        })
      })

      describe('a user who subscribed with a discount', () => {
        test('a user who is subscribed monthly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianActiveDiscountsAsMap,
            15.2,
            'month'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 15.2,
            currentDiscountInPercentage: 20,
            hasSubscribedWithADiscount: true,
            currentlyAvailableDiscounts: {
              monthly: {
                discountAsPercentage: 20,
                durationLimit: null,
              },
              yearly: {
                discountAsPercentage: 40,
                durationLimit: null,
              },
            },
          })
        })
        test('a user who is subscribed yearly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianActiveDiscountsAsMap,
            113.4,
            'year'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 113.4,
            currentDiscountInPercentage: 40,
            hasSubscribedWithADiscount: true,
            currentlyAvailableDiscounts: {
              monthly: {
                discountAsPercentage: 20,
                durationLimit: null,
              },
              yearly: {
                discountAsPercentage: 40,
                durationLimit: null,
              },
            },
          })
        })
      })
    })
  })

  // discounts might not be active because the campaign has not started yet or already finished
  describe('when discounts are not active', () => {
    describe('when user has no referral', () => {
      test('a user who is not subscribed', () => {
        const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianInactiveDiscountsAsMap, null, null)
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
      test('a user who is subscribed to free_trial', () => {
        const pricingDetails = calculateStripePricingDetails(
          null,
          soundLikeARussianInactiveDiscountsAsMap,
          null,
          'free_trial'
        )
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
      test('a user who is subscribed monthly', () => {
        const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianInactiveDiscountsAsMap, 19, 'month')
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: 19,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
      test('a user who is subscribed yearly', () => {
        const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianInactiveDiscountsAsMap, 189, 'year')
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: 189,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })
    })

    describe('when user has a referral', () => {
      test('a user who is not subscribed', () => {
        const pricingDetails = calculateStripePricingDetails(
          'sound_like_a_russian',
          soundLikeARussianInactiveDiscountsAsMap,
          null,
          null
        )
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })

      test('a user who is subscribed to free_trial', () => {
        const pricingDetails = calculateStripePricingDetails(
          'sound_like_a_russian',
          soundLikeARussianInactiveDiscountsAsMap,
          null,
          'free_trial'
        )
        expect(pricingDetails).toEqual({
          amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
          currentDiscountInPercentage: 0,
          hasSubscribedWithADiscount: false,
          currentlyAvailableDiscounts: null,
        })
      })

      describe('a user who subscribed without a discount', () => {
        test('a user who is subscribed monthly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianInactiveDiscountsAsMap,
            19,
            'month'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 19,
            currentDiscountInPercentage: 0,
            hasSubscribedWithADiscount: false,
            currentlyAvailableDiscounts: null,
          })
        })
        test('a user who is subscribed yearly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianInactiveDiscountsAsMap,
            189,
            'year'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 189,
            currentDiscountInPercentage: 0,
            hasSubscribedWithADiscount: false,
            currentlyAvailableDiscounts: null,
          })
        })
      })

      describe('a user who subscribed with a discount', () => {
        test('a user who is subscribed monthly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianInactiveDiscountsAsMap,
            15.2,
            'month'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 15.2,
            currentDiscountInPercentage: 20,
            hasSubscribedWithADiscount: true,
            currentlyAvailableDiscounts: null,
          })
        })
        test('a user who is subscribed yearly', () => {
          const pricingDetails = calculateStripePricingDetails(
            'sound_like_a_russian',
            soundLikeARussianInactiveDiscountsAsMap,
            113.4,
            'year'
          )
          expect(pricingDetails).toEqual({
            amountInEurosThatUserIsCurrentlyPayingPerInterval: 113.4,
            currentDiscountInPercentage: 40,
            hasSubscribedWithADiscount: true,
            currentlyAvailableDiscounts: null,
          })
        })
      })
    })
  })

  describe('PLN currency support', () => {
    test('a user who is subscribed monthly in PLN', () => {
      const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianInactiveDiscountsAsMap, 79, 'month')
      expect(pricingDetails).toEqual({
        amountInEurosThatUserIsCurrentlyPayingPerInterval: 79,
        currentDiscountInPercentage: 0,
        hasSubscribedWithADiscount: false,
        currentlyAvailableDiscounts: null,
      })
    })
    test('a user who is subscribed yearly in PLN', () => {
      const pricingDetails = calculateStripePricingDetails(null, soundLikeARussianInactiveDiscountsAsMap, 789, 'year')
      expect(pricingDetails).toEqual({
        amountInEurosThatUserIsCurrentlyPayingPerInterval: 789,
        currentDiscountInPercentage: 0,
        hasSubscribedWithADiscount: false,
        currentlyAvailableDiscounts: null,
      })
    })
  })
})
