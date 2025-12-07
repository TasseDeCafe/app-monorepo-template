import { createFileRoute } from '@tanstack/react-router'
import { FromLanding } from '@/components/auth/from-landing.tsx'
import { z } from 'zod'
import { PLAN_INTERVALS } from '@template-app/core/constants/pricing-constants'

const fromLandingSearchSchema = z.object({
  planInterval: z.enum(PLAN_INTERVALS).optional(),
})

export const Route = createFileRoute('/from-landing')({
  validateSearch: fromLandingSearchSchema,
  component: FromLanding,
})
