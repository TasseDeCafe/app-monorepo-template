export const ModalId = {
  SOMETHING_WENT_WRONG: 'something-went-wrong',
  CONTACT_US: 'contact-us',
  RATE_LIMITING: 'rate-limiting',
  PRICING: 'pricing',
} as const

export type ModalId = (typeof ModalId)[keyof typeof ModalId]

// URL-based modal IDs (used for route validation in __root.tsx)
export const URL_MODAL_IDS = [ModalId.CONTACT_US] as const
