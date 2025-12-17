import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/features/auth/components/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})
