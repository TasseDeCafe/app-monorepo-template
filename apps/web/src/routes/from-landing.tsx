import { createFileRoute } from '@tanstack/react-router'
import { FromLanding } from '@/components/auth/from-landing.tsx'

type FromLandingSearch = {
  planInterval?: string
}

export const Route = createFileRoute('/from-landing')({
  validateSearch: (search: Record<string, unknown>): FromLandingSearch => {
    return {
      planInterval: search.planInterval as string | undefined,
    }
  },
  component: FromLanding,
})
