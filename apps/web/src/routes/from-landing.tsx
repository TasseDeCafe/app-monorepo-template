import { createFileRoute } from '@tanstack/react-router'
import { FromLanding } from '@/components/auth/from-landing.tsx'
import { z } from 'zod'

const fromLandingSearchSchema = z.object({
  planInterval: z.string().optional(),
})

export const Route = createFileRoute('/from-landing')({
  validateSearch: fromLandingSearchSchema,
  component: FromLanding,
})
