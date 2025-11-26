import { useEffect, useState } from 'react'
import { Circle } from 'lucide-react'
import { useSelector } from 'react-redux'
import { selectHasAllowedReferral } from '@/state/slices/account-slice.ts'
import { getConfig } from '@/config/environment-config.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { buildPricingFreeTrialPath, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { Button } from '../design-system/button.tsx'
import { Card } from '../design-system/card.tsx'
import { getPricingViewConfig, PlanOption, PricingViewConfig } from './pricing-view-utils.ts'
import { toast } from 'sonner'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry.ts'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { useNavigate } from 'react-router-dom'
import { WithNavbar } from '../navbar/with-navbar.tsx'
import { PlanInterval, SUPPORTED_STRIPE_CURRENCY } from '@template-app/core/constants/pricing-constants.ts'
import { PlanType } from '@template-app/api-client/orpc-contracts/billing-contract'
import { POLISH_LOCALE } from '@template-app/i18n/i18n-config'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'
import { useCreateCustomerPortalSession } from '@/hooks/api/portal-session/portal-session-hooks'
import { useCheckoutMutation } from '@/hooks/api/checkout/checkout-hooks'
import { useLingui } from '@lingui/react/macro'
import { getBrowserLocale } from '@/i18n/i18n'

const LeftPartOfButton = ({ option, isChosen }: { option: PlanOption; isChosen: boolean }) => {
  const desktopVersion = (
    <div className='hidden items-center md:flex'>
      <div className='mr-2'>
        {isChosen ? (
          <Circle className='h-5 w-5 fill-indigo-600 text-indigo-600' />
        ) : (
          <Circle className='h-5 w-5 text-gray-400' />
        )}
      </div>
      <div>
        <span>{option.label}</span>
        {option.additionalMessage && (
          <span className='ml-2 rounded-full bg-indigo-100 px-2 py-1 text-sm font-medium text-indigo-800'>
            {option.additionalMessage}
          </span>
        )}
      </div>
    </div>
  )

  const mobileVersion = (
    <div className='flex flex-col items-start gap-y-2 md:hidden'>
      <div className='flex items-center'>
        <div className='mr-2'>
          {isChosen ? (
            <Circle className='h-5 w-5 fill-indigo-600 text-indigo-600' />
          ) : (
            <Circle className='h-5 w-5 text-gray-400' />
          )}
        </div>
        <span>{option.label}</span>
      </div>
      {option.additionalMessage && (
        <span className='rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800'>
          {option.additionalMessage}
        </span>
      )}
    </div>
  )

  return (
    <>
      {desktopVersion}
      {mobileVersion}
    </>
  )
}

export const PricingView = () => {
  const { t } = useLingui()

  const [clickedPlan, setClickedPlan] = useState<PlanType>('year')
  const hasAllowedReferral = useSelector(selectHasAllowedReferral)
  const navigate = useNavigate()

  const handlePlanOptionClick = (planType: PlanType) => {
    POSTHOG_EVENTS.clickPlan('plan_radio_button', planType)
    if (isPremiumUser) {
      if (planType === 'free_trial') {
        toast.info(t`You have already used your free trial.`)
      } else {
        toast.info(t`To change your current plan type, please click on "Manage Subscription".`)
      }
    } else {
      setClickedPlan(planType)
    }
  }

  const { mutate: mutateCustomerPortalSession, isPending: isCustomerPortalMutationPending } =
    useCreateCustomerPortalSession()

  const { mutate, isPending: isPendingCheckoutMutation } = useCheckoutMutation()
  const currency: SUPPORTED_STRIPE_CURRENCY =
    getBrowserLocale() === POLISH_LOCALE ? SUPPORTED_STRIPE_CURRENCY.PLN : SUPPORTED_STRIPE_CURRENCY.EUR

  const { data: subscriptionData } = useGetSubscriptionDetails(currency)

  const stripeDetails = subscriptionData?.stripeDetails
  const currentActivePlan = stripeDetails?.currentActivePlan || null
  const pricing = stripeDetails?.userPricingDetails || null

  useEffect(() => {
    if (currentActivePlan) {
      if (hasAllowedReferral || getConfig().featureFlags.isCreditCardRequiredForAll()) {
        // referral users should never see free_trial plan
        if (currentActivePlan !== 'free_trial') {
          setClickedPlan(currentActivePlan)
        }
      } else {
        if (currentActivePlan === 'free_trial') {
          setClickedPlan(currentActivePlan)
        } else {
          setClickedPlan(currentActivePlan)
        }
      }
    }
  }, [currentActivePlan, hasAllowedReferral])

  const isPremiumUser = !!subscriptionData?.isPremiumUser

  const handleCTAClick = () => {
    POSTHOG_EVENTS.click('subscribe_button')
    if (isPremiumUser) {
      if (subscriptionData?.billingPlatform === 'stripe') {
        const currentPath = location.pathname + location.search
        mutateCustomerPortalSession({ returnPath: currentPath })
      } else {
        if (subscriptionData?.revenueCatDetails?.managementUrl) {
          window.location.href = subscriptionData.revenueCatDetails.managementUrl
        } else {
          logWithSentry('Unexpected billing state in PricingScreen, no management url', { subscriptionData })
          toast.error(t`There was an error. Please contact support.`)
        }
      }
    } else if (hasAllowedReferral || getConfig().featureFlags.isCreditCardRequiredForAll()) {
      navigate(buildPricingFreeTrialPath(clickedPlan as 'month' | 'year'))
    } else {
      mutate({
        successPathAndHash: ROUTE_PATHS.CHECKOUT_SUCCESS,
        cancelPathAndHash: ROUTE_PATHS.PRICING,
        planInterval: clickedPlan as PlanInterval,
        currency,
      })
    }
  }

  const handleGoPracticeNowClick = () => {
    POSTHOG_EVENTS.click('go_practice_now_button')
    navigate(ROUTE_PATHS.DASHBOARD)
  }

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  const pricingViewConfig: PricingViewConfig = getPricingViewConfig({
    isPendingMutation: isPendingCheckoutMutation || isCustomerPortalMutationPending,
    clickedPlan: clickedPlan,
    pricingDetails: pricing || {
      amountInEurosThatUserIsCurrentlyPayingPerInterval: null,
      hasSubscribedWithADiscount: false,
      currentlyAvailableDiscounts: null,
      currentDiscountInPercentage: 0,
    },
    isCreditCardRequiredForAll: getConfig().featureFlags.isCreditCardRequiredForAll(),
    isPremiumUser: isPremiumUser,
    hasAllowedReferral,
    currentActivePlan,
  })

  return (
    <WithNavbar>
      <div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-y-4 px-1 py-4 md:gap-y-8 md:px-4 md:py-8'>
        <Card className='max-w-2xl p-0 shadow'>
          <div className='px-6 py-4 md:py-8'>
            <h1 className='w-full text-center text-3xl font-bold text-stone-800'>{t`Choose your plan`}</h1>
          </div>
          <div className='px-2 pb-2 md:px-6 md:pb-6'>
            <div className='mb-6 flex flex-col gap-y-4'>
              {pricingViewConfig.plans.map((option) => {
                return (
                  <Button
                    key={option.value}
                    onClick={() => handlePlanOptionClick(option.value as PlanType)}
                    className={cn('flex h-auto min-h-20 justify-between rounded-lg border px-2 py-4 md:px-4', {
                      'border-indigo-600 bg-indigo-50': clickedPlan === option.value,
                      'border-gray-200': clickedPlan === option.value,
                      'opacity-60': clickedPlan !== option.value && isPremiumUser,
                    })}
                    shouldHaveHoverAndActiveStyles={!isPremiumUser}
                  >
                    <LeftPartOfButton option={option} isChosen={clickedPlan === option.value} />
                    <div className='text-right'>
                      <div className='font-semibold'>{option.priceMessage}</div>
                      {option.discountMessage && <div className='text-sm text-green-600'>{option.discountMessage}</div>}
                      {option.billedYearly && <div className='text-sm text-gray-500'>{option.billedYearly}</div>}
                    </div>
                  </Button>
                )
              })}
            </div>

            <div className='flex w-full flex-col gap-y-4'>
              <Button
                className='h-12 w-full bg-green-500 text-lg text-white'
                onClick={handleCTAClick}
                disabled={pricingViewConfig.subscribeButton.isDisabled}
              >
                {pricingViewConfig.subscribeButton.text}
              </Button>
              {pricingViewConfig.startButton.shouldBeShown && (
                <Button className='h-12 w-full bg-indigo-600 text-lg text-white' onClick={handleGoPracticeNowClick}>
                  {pricingViewConfig.startButton.text}
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className='max-w-2xl shadow'>
          <h2 className='mb-2 text-center text-3xl font-bold text-gray-900 md:mb-8'>{t`Frequently Asked Questions`}</h2>
        </Card>
      </div>
    </WithNavbar>
  )
}
