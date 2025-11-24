import * as Sentry from '@sentry/node'
import { _sanitizeEmails } from './sentry-utils'

//todo sentry: remove all the instances of this function and replace them with logWithSentry
export const logMessageWithSentry = (message: string, isInfoLevel: boolean = false) => {
  const sanitizedMessage = _sanitizeEmails(message)
  if (Sentry.isInitialized()) {
    if (isInfoLevel) {
      Sentry.captureMessage(sanitizedMessage, 'info')
    } else {
      Sentry.captureMessage(sanitizedMessage, 'error')
    }
  }
}
