// this object got quite complex because of different discounts and contract conditions we negotiated with the creators
import { Discounts } from './discount-types'

export const referralToDiscount: Record<string, Discounts> = {
  sound_like_a_russian: {
    areActive: true,
    monthly: {
      discountAsPercentage: 20,
      stripeCouponId: 'sound_like_a_russian2_monthly',
      durationLimit: 3,
      commissionLimit: null,
    },
    yearly: {
      discountAsPercentage: 40,
      stripeCouponId: 'sound_like_a_russian2_yearly',
      durationLimit: 1,
      commissionLimit: null,
    },
  },
  finnishwithheidi: {
    areActive: false,
    monthly: {
      discountAsPercentage: 20,
      stripeCouponId: 'finnishwithheidi_monthly',
      durationLimit: 3,
      commissionLimit: 3,
    },
    yearly: {
      discountAsPercentage: 40,
      stripeCouponId: 'finnishwithheidi_yearly',
      durationLimit: 1,
      commissionLimit: 1,
    },
  },
  plapla: {
    areActive: false,
    monthly: {
      discountAsPercentage: 20,
      stripeCouponId: 'plapla_monthly',
      durationLimit: 3,
      commissionLimit: 3,
    },
    yearly: {
      discountAsPercentage: 40,
      stripeCouponId: 'plapla_yearly',
      durationLimit: 1,
      commissionLimit: null,
    },
  },
  languageboost: {
    areActive: true,
    monthly: {
      discountAsPercentage: 20,
      stripeCouponId: 'languageboost_monthly',
      durationLimit: 3,
      commissionLimit: 3,
    },
    yearly: {
      discountAsPercentage: 40,
      stripeCouponId: 'languageboost_yearly',
      durationLimit: 1,
      commissionLimit: 1,
    },
  },
  tiengosapp: {
    areActive: true,
    monthly: {
      discountAsPercentage: 30,
      stripeCouponId: 'tiengosapp_monthly',
      durationLimit: 3,
      commissionLimit: null,
    },
    yearly: {
      discountAsPercentage: 60,
      stripeCouponId: 'tiengosapp_yearly',
      durationLimit: 1,
      commissionLimit: null,
    },
  },
  yourbestfrench: {
    areActive: true,
    monthly: {
      discountAsPercentage: 20,
      stripeCouponId: 'yourbestfrench_monthly',
      durationLimit: 3,
      commissionLimit: 3,
    },
    yearly: {
      discountAsPercentage: 40,
      stripeCouponId: 'yourbestfrench_yearly',
      durationLimit: 1,
      commissionLimit: 1,
    },
  },
  expertlygerman: {
    areActive: true,
    monthly: {
      discountAsPercentage: 20,
      stripeCouponId: 'expertlygerman_monthly',
      durationLimit: 3,
      commissionLimit: null,
    },
    yearly: {
      discountAsPercentage: 40,
      stripeCouponId: 'expertlygerman_yearly',
      durationLimit: 1,
      commissionLimit: null,
    },
  },
  dutchiestobe: {
    areActive: true,
    monthly: {
      discountAsPercentage: 10,
      stripeCouponId: 'dutchiestobe_monthly',
      durationLimit: 3,
      commissionLimit: 3,
    },
    yearly: {
      discountAsPercentage: 20,
      stripeCouponId: 'dutchiestobe_yearly',
      durationLimit: 1,
      commissionLimit: 1,
    },
  },
  hnk: {
    areActive: true,
    monthly: {
      discountAsPercentage: 20,
      stripeCouponId: 'hnk_monthly',
      durationLimit: 3,
      commissionLimit: 10,
    },
    yearly: {
      discountAsPercentage: 40,
      stripeCouponId: 'hnk_yearly',
      durationLimit: 1,
      commissionLimit: 1,
    },
  },
  hnk2: {
    areActive: false,
    monthly: {
      discountAsPercentage: 15,
      stripeCouponId: 'hnk2_monthly',
      durationLimit: 3,
      commissionLimit: 10,
    },
    yearly: {
      discountAsPercentage: 30,
      stripeCouponId: 'hnk2_yearly',
      durationLimit: 1,
      commissionLimit: 1,
    },
  },
  elisapena: {
    areActive: true,
    monthly: {
      discountAsPercentage: 10,
      stripeCouponId: 'elisapena2_monthly',
      durationLimit: 3,
      commissionLimit: 6,
    },
    yearly: {
      discountAsPercentage: 30,
      stripeCouponId: 'elisapena2_yearly',
      durationLimit: 1,
      commissionLimit: 1,
    },
  },
  // https://www.notion.so/grammarians/Pass-reddit-as-a-referral-on-the-landing-page-and-in-the-f5bot-script-19b168e7b01a80d5bd49e3c3996aa866
  reddit: {
    areActive: false,
    monthly: {
      discountAsPercentage: 0,
      stripeCouponId: 'reddit_monthly',
      durationLimit: 3,
      commissionLimit: 3,
    },
    yearly: {
      discountAsPercentage: 0,
      stripeCouponId: 'reddit_yearly',
      durationLimit: 1,
      commissionLimit: null,
    },
  },
}

export const getDiscountsForReferral = (referral: string): Discounts => {
  const discount: Discounts | undefined = referralToDiscount[referral]
  if (!discount) {
    return {
      areActive: false,
      monthly: {
        discountAsPercentage: 0,
        stripeCouponId: '',
        durationLimit: null,
        commissionLimit: null,
      },
      yearly: {
        discountAsPercentage: 0,
        stripeCouponId: '',
        durationLimit: null,
        commissionLimit: null,
      },
    }
  }
  return discount
}

export const ALLOWED_REFERRALS = Object.keys(referralToDiscount) as string[]
