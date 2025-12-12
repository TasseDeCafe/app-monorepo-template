import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ModalController } from '@/components/modal/modal-controller.tsx'
import { Toaster } from 'sonner'
import { SessionInitializer } from '@/components/gates/auth/session-initializer.tsx'
import { StateAndHashSynchronizer } from '@/components/synchronizers/hash-synchronizer/state-and-hash-synchronizer.tsx'
import { UserSetupGate } from '@/components/gates/user-setup-gate.tsx'

const RootComponent = () => (
  <SessionInitializer>
    <UserSetupGate>
      <ModalController />
      <Toaster />
      <StateAndHashSynchronizer />
      <Outlet />
      <TanStackRouterDevtools position='bottom-right' />
    </UserSetupGate>
  </SessionInitializer>
)

export const Route = createRootRoute({
  component: RootComponent,
})
