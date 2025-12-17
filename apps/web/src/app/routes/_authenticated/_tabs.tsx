import { createFileRoute } from '@tanstack/react-router'
import { Home, Dumbbell, CircleUserRound } from 'lucide-react'
import { useLingui } from '@lingui/react/macro'
import { TabsLayout } from '@/features/navigation/components/tabs-layout'
import { Route as homeRoute } from '@/app/routes/_authenticated/_tabs/home'
import { Route as dashboardRoute } from '@/app/routes/_authenticated/_tabs/dashboard'
import { Route as profileRoute } from '@/app/routes/_authenticated/_tabs/profile'

const TabsLayoutWrapper = () => {
  const { t } = useLingui()

  const tabs = [
    { to: homeRoute.to, label: t`Home`, icon: Home },
    { to: dashboardRoute.to, label: t`Dashboard`, icon: Dumbbell },
    { to: profileRoute.to, label: t`Profile`, icon: CircleUserRound },
  ]

  return <TabsLayout tabs={tabs} />
}

export const Route = createFileRoute('/_authenticated/_tabs')({
  component: TabsLayoutWrapper,
})
