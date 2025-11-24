import { AUDIO_TOO_SHORT_MESSAGE } from '../orpc-contracts/common/audio-upload-schema'
import type { BackendErrorResponse } from '../orpc-contracts/common/error-response-schema'

type IssueLike = {
  message?: string
  errors?: unknown
}

// todo: the typing here can most likely be improved. It might be possible to infer the types
// from the contract since the error should be an ORPCError in isAudioTooShortErrorPayload
const issueMatchesAudioTooShort = (issue: unknown): boolean => {
  if (!issue || typeof issue !== 'object') {
    return false
  }

  const castedIssue = issue as IssueLike

  if (castedIssue.message === AUDIO_TOO_SHORT_MESSAGE) {
    return true
  }

  const nestedErrors = castedIssue.errors

  if (Array.isArray(nestedErrors)) {
    return nestedErrors.some((nestedIssue) => {
      if (Array.isArray(nestedIssue)) {
        return nestedIssue.some(issueMatchesAudioTooShort)
      }
      return issueMatchesAudioTooShort(nestedIssue)
    })
  }

  if (nestedErrors && typeof nestedErrors === 'object') {
    return issueMatchesAudioTooShort(nestedErrors)
  }

  return false
}

export const isAudioTooShortErrorPayload = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') {
    return false
  }

  const backendErrors = (data as BackendErrorResponse | undefined)?.errors ?? []
  if (Array.isArray(backendErrors) && backendErrors.some(({ message }) => message === AUDIO_TOO_SHORT_MESSAGE)) {
    return true
  }

  const issues = (data as { issues?: unknown }).issues
  return Array.isArray(issues) && issues.some(issueMatchesAudioTooShort)
}
