import { createFileRoute } from '@tanstack/react-router'
import { AdminSettings } from '@/features/admin/components/admin-settings.tsx'

export const Route = createFileRoute('/_authenticated/admin-settings')({
  component: AdminSettings,
})
