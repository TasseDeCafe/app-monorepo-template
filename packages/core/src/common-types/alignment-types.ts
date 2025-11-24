import { z } from 'zod'

export const alignmentDataSchema = z.object({
  chars: z.array(z.string()),
  charStartTimesMs: z.array(z.number()),
  charDurationsMs: z.array(z.number()),
})

export type AlignmentData = z.infer<typeof alignmentDataSchema>
