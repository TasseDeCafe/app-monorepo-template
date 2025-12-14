import { createFileRoute } from '@tanstack/react-router'
import { AuthEmailVerifyView } from '@/features/auth/components/auth-email-verify-view.tsx'

export const Route = createFileRoute('/login/email/verify')({
  component: AuthEmailVerifyView,
})
