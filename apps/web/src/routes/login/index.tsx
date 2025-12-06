import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@/components/auth/auth/auth-view.tsx'

export const Route = createFileRoute('/login/')({
  component: AuthView,
})
