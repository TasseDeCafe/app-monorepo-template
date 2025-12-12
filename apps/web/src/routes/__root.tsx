import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Modal } from '@/components/modal/modal.tsx'
import { Toaster } from 'sonner'
import { AnalyticsInitializer } from '@/analytics/analytics-initializer.tsx'
import { SessionInitializer } from '@/components/gates/auth/session-initializer.tsx'
import { StateAndHashSynchronizer } from '@/components/synchronizers/hash-synchronizer/state-and-hash-synchronizer.tsx'
import { UserSetupGate } from '@/components/gates/user-setup-gate.tsx'

const RootComponent = () => (
  <SessionInitializer>
    <UserSetupGate>
      <Modal />
      <AnalyticsInitializer />
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
