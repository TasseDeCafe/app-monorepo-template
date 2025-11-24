import { z } from 'zod'

export const base64FileUploadSchema = z.object({
  base64: z.string(),
  mimeType: z.string().optional(),
  name: z.string().optional(),
})

export type Base64FileUploadInput = z.infer<typeof base64FileUploadSchema>
