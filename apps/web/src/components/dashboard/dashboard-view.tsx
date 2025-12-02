import { useLingui } from '@lingui/react/macro'
import { LogOut } from 'lucide-react'
import posthog from 'posthog-js'
import { toast } from 'sonner'

import { clearSentryUser } from '@/analytics/sentry/sentry-initializer'
import { queryClient } from '@/config/react-query-config'
import { NavbarContactButton } from '@/components/navbar/navbar-contact-button'
import { Button } from '@/components/shadcn/button'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client'

export const DashboardView = () => {
  const { t } = useLingui()

  const handleSignOut = async () => {
    window.localStorage.clear()
    await getSupabaseClient().auth.signOut({ scope: 'local' })
    posthog.reset()
    queryClient.clear()
    clearSentryUser()
    toast.success(t`Sign out success`)
  }

  return (
    <div className='w-full flex-col items-center p-2 py-4 text-center'>
      {t`Dashboard.`}
      <div className='mt-4 flex justify-center gap-4'>
        <Button variant='ghost' onClick={handleSignOut}>
          <LogOut size={20} />
          <span>{t`Sign out`}</span>
        </Button>
        <NavbarContactButton />
      </div>
    </div>
  )
}
