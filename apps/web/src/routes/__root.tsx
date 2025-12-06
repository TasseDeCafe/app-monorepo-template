import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Modal } from '@/components/modal/modal.tsx'
import { Toaster } from 'sonner'
import { AnalyticsInitializer } from '@/analytics/analytics-initializer.tsx'
import { SilentSignInOut } from '@/components/auth/silent-sign-in-out.tsx'
import { StateAndHashSynchronizer } from '@/components/synchronizers/hash-synchronizer/state-and-hash-synchronizer.tsx'
import { UserSetup } from '@/components/auth/user-setup.tsx'

const RootComponent = () => (
  <>
    <Modal />
    <AnalyticsInitializer />
    <Toaster />
    <SilentSignInOut />
    <StateAndHashSynchronizer />
    <UserSetup />
    <Outlet />
    <TanStackRouterDevtools position='bottom-right' />
  </>
)

export const Route = createRootRoute({
  component: RootComponent,
})
