import { useDispatch, useSelector } from 'react-redux'
import { selectEmail, selectImageUrl, selectInitials, selectIsSignedIn } from '@/state/slices/account-slice.ts'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../shadcn/dropdown.tsx'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client.ts'
import { toast } from 'sonner'
import {
  CircleHelp,
  CircleUserRound,
  CreditCard,
  GraduationCap,
  LogOut,
  Mail,
  Settings,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react'
import { modalActions } from '@/state/slices/modal-slice.ts'
import { ABOUT_MODAL_ID, ACCOUNT_MODAL_ID, CONTACT_MODAL_ID, PROFILE_SETTINGS_MODAL_ID } from '../modal/modal-ids.ts'
import { useMediaQuery } from 'usehooks-ts'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from '../shadcn/drawer.tsx'
import { ONBOARDING_PATHS, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { useState } from 'react'
import { Separator } from '../design-system/separator.tsx'
import { useQueryClient } from '@tanstack/react-query'
import posthog from 'posthog-js'
import { Avatar } from '../design-system/avatar.tsx'
import { checkIsTestUser } from '@/utils/test-users-utils.ts'
import { clearSentryUser } from '@/analytics/sentry/sentry-initializer.ts'
import { useLingui } from '@lingui/react/macro'

export const AccountDropdown = () => {
  const { t } = useLingui()
  const closeLabel = t`Close`

  const imgUrl = useSelector(selectImageUrl)
  const initials = useSelector(selectInitials)
  const navigate = useNavigate()
  const isSignedIn = useSelector(selectIsSignedIn)
  const dispatch = useDispatch()
  const isSmOrLarger: boolean = useMediaQuery('(min-width: 640px)')
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const location = useLocation()
  const queryClient = useQueryClient()

  const email = useSelector(selectEmail)
  const isTestUser = checkIsTestUser(email)

  const isOnboardingRouteButNotOnboardingSuccess =
    ONBOARDING_PATHS.includes(location.pathname) && location.pathname !== ROUTE_PATHS.ONBOARDING_SUCCESS

  const handleSignInOut = async () => {
    if (isSignedIn) {
      window.localStorage.clear()
      // supabase signs you out of all devices by default
      // so we use scope: 'local' to only sign out of the current device
      await getSupabaseClient().auth.signOut({ scope: 'local' })
      posthog.reset()
      queryClient.clear()
      clearSentryUser()
      toast.success(t`Sign out success`)
    }
  }

  const handleOpenSettingsModal = () => {
    dispatch(modalActions.openModal(PROFILE_SETTINGS_MODAL_ID))
    setIsDrawerOpen(false)
  }

  const handleOpenAboutModal = () => {
    dispatch(modalActions.openModal(ABOUT_MODAL_ID))
    setIsDrawerOpen(false)
  }

  const handleOpenPricing = () => {
    navigate(ROUTE_PATHS.PRICING)
    setIsDrawerOpen(false)
  }

  const handleOpenContactModal = () => {
    dispatch(modalActions.openModal(CONTACT_MODAL_ID))
    setIsDrawerOpen(false)
  }

  const handleExercisesClick = () => {
    navigate(ROUTE_PATHS.DASHBOARD)
    setIsDrawerOpen(false)
  }

  const handleProgressClick = () => {
    navigate(ROUTE_PATHS.PROGRESS)
    setIsDrawerOpen(false)
  }

  const handleLeaderboardClick = () => {
    navigate(ROUTE_PATHS.LEADERBOARD)
    setIsDrawerOpen(false)
  }

  const handleAccountClick = () => {
    dispatch(modalActions.openModal(ACCOUNT_MODAL_ID))
    setIsDrawerOpen(false)
  }

  const handleAdminSettingsClick = () => {
    navigate(ROUTE_PATHS.ADMIN_SETTINGS)
    setIsDrawerOpen(false)
  }

  return (
    <>
      {isSmOrLarger ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar initials={initials} url={imgUrl} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-60 bg-white'>
            <DropdownMenuItem className='cursor-pointer hover:bg-gray-200' onClick={handleAccountClick}>
              <div className='flex items-center'>
                <CircleUserRound size={24} className='mr-2' />
                <span className='text-lg text-gray-800'>{t`Account`}</span>
              </div>
            </DropdownMenuItem>
            {!isOnboardingRouteButNotOnboardingSuccess && (
              <DropdownMenuItem onSelect={handleOpenSettingsModal} className='cursor-pointer hover:bg-gray-200'>
                <div className='flex items-center'>
                  <Settings size={24} className='mr-2' />
                  <span className='text-lg text-gray-800'>{t`Settings`}</span>
                </div>
              </DropdownMenuItem>
            )}
            {!isOnboardingRouteButNotOnboardingSuccess && (
              <DropdownMenuItem className='cursor-pointer hover:bg-gray-200' onClick={handleExercisesClick}>
                <div className='flex items-center'>
                  <GraduationCap size={24} className='mr-2' />
                  <span className='text-lg text-gray-800'>{t`Exercises`}</span>
                </div>
              </DropdownMenuItem>
            )}
            {!isOnboardingRouteButNotOnboardingSuccess && (
              <DropdownMenuItem className='cursor-pointer hover:bg-gray-200' onClick={handleLeaderboardClick}>
                <div className='flex items-center'>
                  <Trophy size={24} className='mr-2' />
                  <span className='text-lg text-gray-800'>{t`Leaderboard`}</span>
                </div>
              </DropdownMenuItem>
            )}
            {!isOnboardingRouteButNotOnboardingSuccess && (
              <DropdownMenuItem className='cursor-pointer hover:bg-gray-200' onClick={handleProgressClick}>
                <div className='flex items-center'>
                  <TrendingUp size={24} className='mr-2' />
                  <span className='text-lg text-gray-800'>{t`Progress`}</span>
                </div>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={handleOpenPricing} className='cursor-pointer hover:bg-gray-200'>
              <div className='flex items-center'>
                <CreditCard size={24} className='mr-2' />
                <span className='text-lg text-gray-800'>{t`Pricing`}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleOpenContactModal} className='cursor-pointer hover:bg-gray-200'>
              <div className='flex items-center'>
                <Mail size={24} className='mr-2' />
                <span className='text-lg text-gray-800'>{t`Contact`}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleOpenAboutModal} className='cursor-pointer hover:bg-gray-200'>
              <div className='flex items-center'>
                <CircleHelp size={24} className='mr-2' />
                <span className='text-lg text-gray-800'>{t`About`}</span>
              </div>
            </DropdownMenuItem>
            {isTestUser && (
              <DropdownMenuItem className='cursor-pointer hover:bg-gray-200' onSelect={handleAdminSettingsClick}>
                <Settings size={24} className='mr-2' />
                <span className='text-lg text-gray-800'>{t`Admin Settings`}</span>
              </DropdownMenuItem>
            )}
            <Separator className='my-1 h-px bg-gray-200' />
            <DropdownMenuItem className='cursor-pointer hover:bg-gray-200' onSelect={handleSignInOut}>
              <LogOut size={24} className='mr-2' />
              <span className='text-lg text-gray-800'>{t`Sign out`}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction='right' autoFocus={true}>
          <DrawerTrigger asChild>
            <button onClick={() => setIsDrawerOpen(true)}>
              <Avatar initials={initials} url={imgUrl} />
            </button>
          </DrawerTrigger>
          <DrawerContent className='h-full bg-white px-6 backdrop-blur'>
            {/* RadixUI logs a warning if we don't have a title and a description inside a DrawerContent */}
            <DrawerTitle className='hidden'></DrawerTitle>
            <DrawerDescription className='hidden'></DrawerDescription>
            <div className='absolute right-4 top-4'>
              <DrawerClose
                onClick={() => {
                  setIsDrawerOpen(false)
                }}
              >
                <X size={30} aria-label={closeLabel} />
                <span className='sr-only'>{closeLabel}</span>
              </DrawerClose>
            </div>
            <div className='mt-8 flex flex-col gap-y-2'>
              <div
                className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
                onClick={handleAccountClick}
              >
                <CircleUserRound size={30} className='mr-2' />
                <span className='text-3xl text-gray-800'>{t`Account`}</span>
              </div>
              {!isOnboardingRouteButNotOnboardingSuccess && (
                <div
                  onClick={handleOpenSettingsModal}
                  className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
                >
                  <Settings size={30} className='mr-2' />
                  <span className='text-3xl text-gray-800'>{t`Settings`}</span>
                </div>
              )}
              {!isOnboardingRouteButNotOnboardingSuccess && (
                <div
                  className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
                  onClick={handleExercisesClick}
                >
                  <GraduationCap size={30} className='mr-2' />
                  <span className='text-3xl text-gray-800'>{t`Exercises`}</span>
                </div>
              )}
              {!isOnboardingRouteButNotOnboardingSuccess && (
                <div
                  className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
                  onClick={handleLeaderboardClick}
                >
                  <Trophy size={30} className='mr-2' />
                  <span className='text-3xl text-gray-800'>{t`Leaderboard`}</span>
                </div>
              )}
              {!isOnboardingRouteButNotOnboardingSuccess && (
                <div
                  className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
                  onClick={handleProgressClick}
                >
                  <TrendingUp size={30} className='mr-2' />
                  <span className='text-3xl text-gray-800'>{t`Progress`}</span>
                </div>
              )}
              <div
                onClick={handleOpenPricing}
                className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
              >
                <CreditCard size={30} className='mr-2' />
                <span className='text-3xl text-gray-800'>{t`Pricing`}</span>
              </div>
              <div
                onClick={handleOpenContactModal}
                className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
              >
                <Mail size={30} className='mr-2' />
                <span className='text-3xl text-gray-800'>{t`Contact`}</span>
              </div>
              <div
                onClick={handleOpenAboutModal}
                className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
              >
                <CircleHelp size={30} className='mr-2' />
                <span className='text-3xl text-gray-800'>{t`About`}</span>
              </div>
              {isTestUser && (
                <div
                  onClick={handleAdminSettingsClick}
                  className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'
                >
                  <Settings size={30} className='mr-2' />
                  <span className='text-3xl text-gray-800'>{t`Admin Settings`}</span>
                </div>
              )}
              <Separator className='my-1 h-px bg-gray-200' />
              <div onClick={handleSignInOut} className='flex cursor-pointer items-center rounded p-2 hover:bg-gray-300'>
                <LogOut size={30} className='mr-2' />
                <span className='text-3xl text-gray-800'>{t`Sign out`}</span>
              </div>
            </div>
            <DrawerFooter></DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
