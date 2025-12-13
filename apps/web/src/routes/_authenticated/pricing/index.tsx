import { createFileRoute } from '@tanstack/react-router'
import { PricingView } from '@/components/pricing/pricing-view.tsx'

export const Route = createFileRoute('/_authenticated/pricing/')({
  component: PricingView,
})
