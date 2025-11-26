import { useSelector } from 'react-redux'
import { selectIsSignedIn } from '@/state/slices/account-slice.ts'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { NavbarContactButton } from './navbar-contact-button.tsx'
import { useLingui } from '@lingui/react/macro'

export const NavBar = () => {
  const { t } = useLingui()

  const isSignedIn: boolean = useSelector(selectIsSignedIn)

  return (
    <nav className='w-full px-2 md:container md:px-14'>
      <div className='flex h-16 w-full flex-row items-center justify-between rounded-3xl bg-white px-3 md:h-20 md:px-5'>
        <>
          <div>
            <Link to={ROUTE_PATHS.DASHBOARD} className='flex w-full px-2 md:px-4'>
              <div className='flex cursor-pointer flex-row justify-start gap-x-3'>
                <span className='hidden items-center justify-end gap-x-3 text-base font-semibold text-slate-800 md:flex'>
                  TemplateApp
                </span>
              </div>
            </Link>
          </div>
          <div className='flex flex-row gap-x-10'>
            <div className='flex flex-1 items-center justify-end gap-x-3'>
              <NavbarContactButton />
              {!isSignedIn && <Link to={ROUTE_PATHS.SIGN_IN}>{t`Sign in`}</Link>}
            </div>
          </div>
        </>
      </div>
    </nav>
  )
}
