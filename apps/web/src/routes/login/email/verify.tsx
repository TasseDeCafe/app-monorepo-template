import { createFileRoute } from '@tanstack/react-router'
import { AuthEmailVerifyView } from '@/components/auth/auth/auth-email-verify-view.tsx'

export const Route = createFileRoute('/login/email/verify')({
  component: AuthEmailVerifyView,
})
