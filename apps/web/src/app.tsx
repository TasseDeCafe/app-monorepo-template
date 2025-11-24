import { BrowserRouter } from 'react-router-dom'
import { Router } from './routing/router.tsx'
import { Provider } from 'react-redux'
import { store } from './state/store'
import { QueryClientProvider } from '@tanstack/react-query'
import { SilentSignInOut } from './components/auth/silent-sign-in-out.tsx'
import { UserRetrieving } from './components/auth/user-retrieving.tsx'
import { Modal } from './components/modal/modal.tsx'
import { Toaster } from 'sonner'
import { AnalyticsInitializer } from './analytics/analytics-initializer.tsx'
import { I18nProvider } from '@lingui/react'
import { i18n } from './i18n/i18n'

import { StateAndHashSynchronizer } from './components/synchronizers/hash-synchronizer/state-and-hash-synchronizer.tsx'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CookieBanner } from './components/cookie-banner/cookie-banner.tsx'
import { queryClient } from '@/config/react-query-config'

export const App = () => {
  return (
    <Provider store={store}>
      <I18nProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Modal />
            <AnalyticsInitializer />
            <Toaster />
            <SilentSignInOut />
            <StateAndHashSynchronizer />
            <UserRetrieving />
            <Router />
            <CookieBanner />
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </I18nProvider>
    </Provider>
  )
}
