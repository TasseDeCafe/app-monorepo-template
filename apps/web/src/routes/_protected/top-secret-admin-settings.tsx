import { createFileRoute } from '@tanstack/react-router'
import { AdminSettings } from '@/components/views/admin-settings.tsx'

export const Route = createFileRoute('/_protected/top-secret-admin-settings')({
  component: AdminSettings,
})
