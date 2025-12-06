import { createFileRoute } from '@tanstack/react-router'
import { FreeTrialExplanationView } from '@/components/pricing/free-trial-explanation-view.tsx'
import { z } from 'zod'

const freeTrialSearchSchema = z.object({
  planInterval: z.string().optional(),
})

export const Route = createFileRoute('/_protected/pricing/free-trial')({
  validateSearch: freeTrialSearchSchema,
  component: FreeTrialExplanationView,
})
