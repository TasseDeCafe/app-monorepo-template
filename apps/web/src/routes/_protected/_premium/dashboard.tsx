import { createFileRoute } from '@tanstack/react-router'
import { DashboardView } from '@/components/dashboard/dashboard-view.tsx'

export const Route = createFileRoute('/_protected/_premium/dashboard')({
  component: DashboardView,
})
