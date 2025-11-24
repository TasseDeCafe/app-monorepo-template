import { ErrorResponse } from 'resend'

interface CreateEmailResponseSuccess {
  /** The ID of the newly created email. */
  id: string
}

export interface CreateEmailResponse {
  data: CreateEmailResponseSuccess | null
  error: ErrorResponse | null
}
