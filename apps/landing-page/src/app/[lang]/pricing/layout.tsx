'use client'

import { AnalyticsPageViewLauncher } from '@/analytics/posthog/analytics-page-view-launcher'
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AnalyticsPageViewLauncher />
      {children}
    </>
  )
}

export default Layout
