export const COOKIE_EXPIRATION_TIME_IN_SECONDS = 60 * 60 * 24 * 365 * 10 // ten years
// paradoxically we store the info about cookie consent in a cookie, we do it because cookies can be shared between
// domain and subdomain, which allows us to ask for consent only once
export const CONSENT_COOKIE_NAME = 'cookie-consent'
export const AGREED_TO_ALL_COOKIE = `${CONSENT_COOKIE_NAME}=1`
export const AGREED_TO_ESSENTIALS_ONLY_COOKIE = `${CONSENT_COOKIE_NAME}=2`
