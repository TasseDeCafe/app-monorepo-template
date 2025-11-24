// all below attributes can be found on
// https://fly.customer.io/workspaces/173771/journeys/people
// note that customer.io might have additional attributes like "_created_in_customerio_at"
// the below attributes are all the ones that we created
export enum CUSTOM_CUSTOMERIO_ATTRIBUTE {
  EMAIL = 'email',
  HAS_VOICE = 'has_voice',
  REFERRAL = 'referral',
  MOTHER_LANGUAGE = 'mother_language',
  STUDY_LANGUAGE = 'study_language',
  STUDY_DIALECT = 'study_dialect',
  NICKNAME = 'nickname',
  CURRENT_PLAN = 'current_plan',
  CURRENT_PLAN_INTERVAL = 'current_plan_interval',
}

export type CustomerioUser = {
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.EMAIL]: string
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.HAS_VOICE]: boolean
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.REFERRAL]: string | null
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.MOTHER_LANGUAGE]: string | null
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_LANGUAGE]: string | null
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.STUDY_DIALECT]: string | null
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.NICKNAME]: string | null
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN]: 'premium' | null
  [CUSTOM_CUSTOMERIO_ATTRIBUTE.CURRENT_PLAN_INTERVAL]: 'month' | 'year' | null
}
