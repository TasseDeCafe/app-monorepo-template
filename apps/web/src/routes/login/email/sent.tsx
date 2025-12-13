import { createFileRoute } from '@tanstack/react-router'
import { AuthEmailSentView } from '@/components/auth/auth/auth-email-sent-view.tsx'
import { z } from 'zod'

const emailSentSearchSchema = z.object({
  email: z.email().optional(),
})

export const Route = createFileRoute('/login/email/sent')({
  validateSearch: emailSentSearchSchema,
  component: AuthEmailSentView,
})
