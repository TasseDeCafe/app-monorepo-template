import { createFileRoute } from '@tanstack/react-router'
import { CheckoutSuccessView } from '@/components/checkout/checkout-success-view'

export const Route = createFileRoute('/_authenticated/pricing/checkout-success')({
  component: CheckoutSuccessView,
})
