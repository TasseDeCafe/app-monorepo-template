import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import { Home, Dumbbell, CircleUserRound, Menu } from 'lucide-react'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { ContactUsButton } from '@/components/navbar/contact-us-button'
import { useLingui } from '@lingui/react/macro'
import { Route as homeRoute } from '@/routes/_protected/_tabs/home'
import { Route as dashboardRoute } from '@/routes/_protected/_tabs/dashboard'
import { Route as profileRoute } from '@/routes/_protected/_tabs/profile'

const TabLink = ({
  to,
  label,
  icon: Icon,
  isActive,
}: {
  to: string
  label: string
  icon: typeof Home
  isActive: boolean
}) => (
  <Link
    to={to}
    className={cn(
      'flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
      isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
    )}
  >
    <Icon className='h-6 w-6' strokeWidth={2} />
    <span className='text-xs font-medium'>{label}</span>
  </Link>
)

const TabsLayout = () => {
  const { t } = useLingui()
  const location = useLocation()

  const isHomeActive = location.pathname.includes(homeRoute.to)
  const isDashboardActive = location.pathname.includes(dashboardRoute.to)
  const isProfileActive = location.pathname.includes(profileRoute.to)

  const getTitle = () => {
    if (isHomeActive) return t`Home`
    if (isDashboardActive) return t`Dashboard`
    if (isProfileActive) return t`Profile`
    return t`Home`
  }

  return (
    <div className='flex min-h-screen flex-col bg-indigo-50'>
      {/* Header */}
      <header className='sticky top-0 z-10 flex h-14 items-center justify-between border-b border-indigo-100 bg-indigo-50 px-4'>
        <button className='flex h-10 w-10 items-center justify-center rounded-lg hover:bg-indigo-100'>
          <Menu className='h-6 w-6' />
        </button>
        <h1 className='text-lg font-semibold'>{getTitle()}</h1>
        <ContactUsButton />
      </header>

      {/* Main content */}
      <main className='flex-1 pb-20'>
        <Outlet />
      </main>

      {/* Bottom tabs */}
      <nav className='fixed bottom-0 left-0 right-0 z-10 rounded-t-3xl bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]'>
        <div className='flex h-16 items-center justify-around'>
          <TabLink to={homeRoute.to} label={t`Home`} icon={Home} isActive={isHomeActive} />
          <TabLink to={dashboardRoute.to} label={t`Dashboard`} icon={Dumbbell} isActive={isDashboardActive} />
          <TabLink to={profileRoute.to} label={t`Profile`} icon={CircleUserRound} isActive={isProfileActive} />
        </div>
      </nav>
    </div>
  )
}

export const Route = createFileRoute('/_protected/_tabs')({
  component: TabsLayout,
})
