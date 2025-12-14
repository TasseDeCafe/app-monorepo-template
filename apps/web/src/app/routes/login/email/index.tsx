import { createFileRoute } from '@tanstack/react-router'
import { AuthEmailView } from '@/features/auth/components/auth-email-view.tsx'

export const Route = createFileRoute('/login/email/')({
  component: AuthEmailView,
})
