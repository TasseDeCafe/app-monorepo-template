import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { OverlayController } from '@/components/overlay/overlay-controller'
import { Toaster } from 'sonner'
import { SessionInitializer } from '@/components/gates/auth/session-initializer.tsx'
import { UserSetupGate } from '@/components/gates/user-setup-gate.tsx'
import { z } from 'zod'
import { URL_OVERLAY_IDS } from '@/components/overlay/overlay-ids'

const rootSearchSchema = z.object({
  // some overlays should be accessible via URL
  modal: z.enum(URL_OVERLAY_IDS).optional(),
})

const RootComponent = () => (
  <SessionInitializer>
    <UserSetupGate>
      <OverlayController />
      <Toaster />
      <Outlet />
      <TanStackRouterDevtools position='bottom-right' />
    </UserSetupGate>
  </SessionInitializer>
)

export const Route = createRootRoute({
  component: RootComponent,
  validateSearch: rootSearchSchema,
})
