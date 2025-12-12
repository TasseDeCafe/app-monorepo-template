export const SOMETHING_WENT_WRONG_MODAL_ID = 'something-went-wrong-modal-id'
export const CONTACT_US_MODAL_ID = 'contact-us-modal-id'
export const RATE_LIMITING_MODAL_ID = 'rate-limiting-modal-id'
export const PRICING_MODAL_ID = 'pricing-modal-id'

// Modal names that can be opened via URL search param (?modal=contact-us)
export const URL_PARAM_MODAL_NAMES = ['contact-us'] as const
export type UrlParamModalName = (typeof URL_PARAM_MODAL_NAMES)[number]

// Map URL param names to modal IDs
export const URL_PARAM_TO_MODAL_ID: Record<UrlParamModalName, string> = {
  'contact-us': CONTACT_US_MODAL_ID,
}

// Map modal IDs to URL param names (reverse lookup)
export const MODAL_ID_TO_URL_PARAM: Record<string, UrlParamModalName> = {
  [CONTACT_US_MODAL_ID]: 'contact-us',
}
