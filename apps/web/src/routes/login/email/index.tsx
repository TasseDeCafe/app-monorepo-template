import { createFileRoute } from '@tanstack/react-router'
import { AuthEmailView } from '@/components/auth/auth/auth-email-view.tsx'

export const Route = createFileRoute('/login/email/')({
  component: AuthEmailView,
})
