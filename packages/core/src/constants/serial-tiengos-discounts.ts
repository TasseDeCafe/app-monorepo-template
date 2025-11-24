import { Discounts } from './discount-types'

const tiengosDiscount = {
  areActive: true,
  monthly: {
    discountAsPercentage: 20,
    stripeCouponId: 'tiengos_monthly',
    durationLimit: 3,
    commissionLimit: null,
  },
  yearly: {
    discountAsPercentage: 60,
    stripeCouponId: 'tiengos_yearly',
    durationLimit: 1,
    commissionLimit: null,
  },
}

const tiengos2Discount = {
  areActive: true,
  monthly: {
    discountAsPercentage: 60,
    stripeCouponId: 'tiengos_monthly2',
    durationLimit: 6,
    commissionLimit: null,
  },
  yearly: {
    discountAsPercentage: 60,
    stripeCouponId: 'tiengos_yearly',
    durationLimit: 1,
    commissionLimit: null,
  },
}

const tiengos3Discount = {
  areActive: true,
  monthly: {
    discountAsPercentage: 60,
    stripeCouponId: 'tiengos_monthly2',
    durationLimit: 6,
    commissionLimit: null,
  },
  yearly: {
    discountAsPercentage: 70,
    stripeCouponId: 'tiengos_yearly2',
    durationLimit: 1,
    commissionLimit: null,
  },
}

export const tiengosReferralToDiscountMap: Record<string, Discounts> = {
  // used in https://www.youtube.com/watch?v=ToSkcDHyb0w
  tiengos: tiengos2Discount,
  // used in https://www.youtube.com/watch?v=dTi5K-zqAj4
  tiengos2: tiengosDiscount,
  // used in https://youtu.be/ti5sHI1THfI
  tiengos3: tiengos2Discount,
  // used on tiengos channel page https://www.youtube.com/@Tiengos
  tiengos4: tiengosDiscount,
  // used on tiengos instagram page: https://instagram.com/_tiengos
  tiengos5: tiengosDiscount,
  // used in: https://youtu.be/ydYbLBawV3s
  tiengos6: tiengosDiscount,
  // used in the description of: https://www.youtube.com/watch?v=jiQixU8NLPw
  tiengos7: tiengosDiscount,
  // used in the pinned comment by Kamil here: https://www.youtube.com/watch?v=jiQixU8NLPw
  tiengos8: tiengosDiscount,
  // used in the final card of: https://www.youtube.com/watch?v=jiQixU8NLPw
  tiengos9: tiengosDiscount,
  // to be used in the description of 9 hardest languages video: https://youtu.be/E91H6AX9Obg:
  tiengos10: tiengos3Discount,
  // to be used in the pinned comment of 9 hardest languages video:
  tiengos11: tiengos3Discount,
  // to be used in the end screen of 9 hardest languages video:
  tiengos12: tiengos3Discount,
  // to be used in the video link of 9 hardest languages video:
  tiengos13: tiengos3Discount,
  // to be used in the description of popes video: https://youtu.be/egskXdYAeA0:
  tiengos14: tiengos3Discount,
  // to be used in the pinned comment of 9 hardest languages video:
  tiengos15: tiengos3Discount,
  // to be used in the end screen of popes video:
  tiengos16: tiengos3Discount,
  // to be used in the video link of popes video:
  tiengos17: tiengos3Discount,
  tiengos18: tiengosDiscount,
  tiengos19: tiengosDiscount,
  tiengos20: tiengosDiscount,
  tiengos21: tiengosDiscount,
  tiengos22: tiengosDiscount,
  tiengos23: tiengosDiscount,
  tiengos24: tiengosDiscount,
  tiengos25: tiengosDiscount,
  tiengos26: tiengosDiscount,
  tiengos27: tiengosDiscount,
  tiengos28: tiengosDiscount,
  tiengos29: tiengosDiscount,
  tiengos30: tiengosDiscount,
  tiengos31: tiengosDiscount,
  tiengos32: tiengosDiscount,
  tiengos33: tiengosDiscount,
  tiengos34: tiengosDiscount,
  tiengos35: tiengosDiscount,
  tiengos36: tiengosDiscount,
  tiengos37: tiengosDiscount,
  tiengos38: tiengosDiscount,
  tiengos39: tiengosDiscount,
  tiengos40: tiengosDiscount,
}
