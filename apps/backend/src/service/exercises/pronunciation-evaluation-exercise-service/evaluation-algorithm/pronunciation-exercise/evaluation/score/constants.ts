import { MIN_SCORE_FOR_XP } from '../../../../../../user-stats/user-stats-constants'

// we want to be sure that the user actually pronounced something. This protects us from saving tons of bad pronunciations
// in the case users just click on "record" button just to listen to their clone
// an equivalent restriction exists in the backend
export const MINIMUM_SCORE_FOR_STORING_PRONUNCIATIONS = MIN_SCORE_FOR_XP
