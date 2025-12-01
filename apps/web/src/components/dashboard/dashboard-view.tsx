import { useLingui } from '@lingui/react/macro'
import { LogOut } from 'lucide-react'
import posthog from 'posthog-js'
import { toast } from 'sonner'

import { clearSentryUser } from '@/analytics/sentry/sentry-initializer'
import { queryClient } from '@/config/react-query-config'
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
      <button
        onClick={handleSignOut}
        className='mt-4 flex cursor-pointer items-center rounded bg-gray-100 p-2 hover:bg-gray-300'
      >
        <LogOut size={20} className='mr-2' />
        <span className='text-gray-800'>{t`Sign out`}</span>
      </button>
    </div>
  )
}
