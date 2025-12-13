import { createFileRoute } from '@tanstack/react-router'
import { AdminSettings } from '@/components/views/admin-settings.tsx'

export const Route = createFileRoute('/_authenticated/admin-settings')({
  component: AdminSettings,
})
