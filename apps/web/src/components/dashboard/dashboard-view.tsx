import { useLingui } from '@lingui/react/macro'
import { LogOut, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { ContactUsButton } from '@/components/navbar/contact-us-button'
import { Button } from '@/components/shadcn/button'
import { useDeleteAccount } from '@/hooks/api/removals/removals-hooks'
import { useAuthStore } from '@/stores/auth-store'

export const DashboardView = () => {
  const { t } = useLingui()
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useDeleteAccount()
  const signOut = useAuthStore((state) => state.signOut)

  const handleSignOut = async () => {
    await signOut()
    toast.success(t`Sign out success`)
  }

  return (
    <div className='w-full flex-col items-center p-2 py-4 text-center'>
      {t`Dashboard.`}
      <div className='mt-4 flex justify-center gap-4'>
        <Button variant='outline' onClick={handleSignOut}>
          <LogOut size={20} />
          <span>{t`Sign out`}</span>
        </Button>
        <Button variant='destructive' onClick={() => deleteAccount({})} disabled={isDeletingAccount}>
          <Trash2 size={20} />
          <span>{t`Delete account`}</span>
        </Button>
        <ContactUsButton />
      </div>
    </div>
  )
}
