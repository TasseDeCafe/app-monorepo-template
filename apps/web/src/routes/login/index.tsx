import { createFileRoute } from '@tanstack/react-router'
import { AuthView } from '@/components/auth/auth/auth-view.tsx'
import { z } from 'zod'

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/login/')({
  validateSearch: loginSearchSchema,
  component: AuthView,
})
