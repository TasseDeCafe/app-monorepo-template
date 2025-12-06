import { createFileRoute } from '@tanstack/react-router'
import { FreeTrialExplanationView } from '@/components/pricing/free-trial-explanation-view.tsx'

type FreeTrialSearch = {
  planInterval?: string
}

export const Route = createFileRoute('/_protected/pricing/free-trial')({
  validateSearch: (search: Record<string, unknown>): FreeTrialSearch => {
    return {
      planInterval: search.planInterval as string | undefined,
    }
  },
  component: FreeTrialExplanationView,
})
