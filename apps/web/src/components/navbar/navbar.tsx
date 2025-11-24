import { AccountDropdown } from './account-dropdown.tsx'
import { useSelector } from 'react-redux'
import { selectHasFinishedOnboarding, selectIsSignedIn } from '@/state/slices/account-slice.ts'
import { XpCounter } from './xp-counter.tsx'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { Logo } from '../design-system/logo.tsx'
import { NavbarContactButton } from './navbar-contact-button.tsx'
import { useLingui } from '@lingui/react/macro'

export const NavBar = () => {
  const { t } = useLingui()

  const isSignedIn: boolean = useSelector(selectIsSignedIn)
  const hasFinishedOnboarding: boolean = useSelector(selectHasFinishedOnboarding)

  return (
    <nav className='w-full px-2 md:container md:px-14'>
      <div className='flex h-16 w-full flex-row items-center justify-between rounded-3xl bg-white px-3 md:h-20 md:px-5'>
        <>
          <div>
            <Link to={ROUTE_PATHS.DASHBOARD} className='flex w-full px-2 md:px-4'>
              <div className='flex cursor-pointer flex-row justify-start gap-x-3'>
                <div className='relative items-center text-center font-semibold text-cyan-600 md:flex lg:text-3xl'>
                  <Logo size={28} />
                  <span className='absolute -top-2 left-[26px] font-nunito text-xs text-indigo-600'>{t`beta`}</span>
                </div>
                <span className='hidden items-center justify-end gap-x-3 text-base font-semibold text-slate-800 md:flex'>
                  TemplateApp
                </span>
              </div>
            </Link>
          </div>
          <div className='flex flex-row gap-x-10'>
            <div className='flex flex-1 items-center justify-end gap-x-3'>
              <NavbarContactButton />
              {hasFinishedOnboarding && <XpCounter />}
              {isSignedIn && <AccountDropdown />}
              {!isSignedIn && <Link to={ROUTE_PATHS.SIGN_IN}>{t`Sign in`}</Link>}
            </div>
          </div>
        </>
      </div>
    </nav>
  )
}
