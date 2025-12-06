import { createFileRoute } from '@tanstack/react-router'
import { RedirectToCheckOut } from '@/components/redirect-to-check-out.tsx'

export const Route = createFileRoute('/_protected/redirect-to-check-out/$planInterval')({
  component: RedirectToCheckOut,
})
