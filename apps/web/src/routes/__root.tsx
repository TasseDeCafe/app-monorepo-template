import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ModalController } from '@/components/modal/modal-controller.tsx'
import { Toaster } from 'sonner'
import { SessionInitializer } from '@/components/gates/auth/session-initializer.tsx'
import { UserSetupGate } from '@/components/gates/user-setup-gate.tsx'
import { z } from 'zod'
import { URL_MODAL_IDS } from '@/components/modal/modal-ids.ts'

const rootSearchSchema = z.object({
  modal: z.enum(URL_MODAL_IDS).optional(),
})

const RootComponent = () => (
  <SessionInitializer>
    <UserSetupGate>
      <ModalController />
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
