import { createFileRoute } from '@tanstack/react-router'
import { AccountRemovedSuccessView } from '@/features/auth/components/account-removed-success-view.tsx'

export const Route = createFileRoute('/account/removed')({
  component: AccountRemovedSuccessView,
})
