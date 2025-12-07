import { createFileRoute } from '@tanstack/react-router'
import { FreeTrialExplanationView } from '@/components/pricing/free-trial-explanation-view.tsx'
import { z } from 'zod'
import { PLAN_INTERVALS } from '@template-app/core/constants/pricing-constants'

const freeTrialSearchSchema = z.object({
  planInterval: z.enum(PLAN_INTERVALS),
})

export const Route = createFileRoute('/_protected/pricing/free-trial')({
  validateSearch: freeTrialSearchSchema,
  component: FreeTrialExplanationView,
})
