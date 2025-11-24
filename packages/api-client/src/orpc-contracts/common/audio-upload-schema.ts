import { z } from 'zod'
import { base64FileUploadSchema } from './file-upload-schemas'

const MIN_AUDIO_BYTES = 5_000
export const AUDIO_TOO_SHORT_MESSAGE = 'Audio recording is too short'

const browserFileAudioSchema = z.custom<File>(
  (value): value is File => {
    if (typeof File === 'undefined') {
      return false
    }

    if (!(value instanceof File)) {
      return false
    }

    return value.size >= MIN_AUDIO_BYTES
  },
  AUDIO_TOO_SHORT_MESSAGE
)

const getBase64Size = (base64: string): number => {
  const normalized = base64.replace(/\s+/g, '')
  if (!normalized) {
    return 0
  }

  const padding = normalized.endsWith('==') ? 2 : normalized.endsWith('=') ? 1 : 0
  return Math.max(0, (normalized.length * 3) / 4 - padding)
}

const base64AudioSchema = base64FileUploadSchema.superRefine((value, ctx) => {
  const size = getBase64Size(value.base64)

  if (size === 0 || size < MIN_AUDIO_BYTES) {
    ctx.addIssue({
      code: 'custom',
      message: AUDIO_TOO_SHORT_MESSAGE,
      path: ['base64'],
    })
  }
})

export const audioUploadSchema = z.union([browserFileAudioSchema, base64AudioSchema])
