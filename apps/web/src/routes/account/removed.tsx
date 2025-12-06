import { createFileRoute } from '@tanstack/react-router'
import { AccountRemovedSuccessView } from '@/components/auth/account-removed-success-view.tsx'

export const Route = createFileRoute('/account/removed')({
  component: AccountRemovedSuccessView,
})
