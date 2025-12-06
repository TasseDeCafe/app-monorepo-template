import { createFileRoute } from '@tanstack/react-router'
import { AuthEmailSentView } from '@/components/auth/auth/auth-email-sent-view.tsx'

type EmailSentSearch = {
  email?: string
}

export const Route = createFileRoute('/login/email/sent')({
  validateSearch: (search: Record<string, unknown>): EmailSentSearch => {
    return {
      email: search.email as string | undefined,
    }
  },
  component: AuthEmailSentView,
})
