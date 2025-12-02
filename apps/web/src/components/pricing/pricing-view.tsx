import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import posthog from 'posthog-js'
import { getConfig } from '@/config/environment-config.ts'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { buildPricingFreeTrialPath, ROUTE_PATHS } from '@/routing/route-paths.ts'
import { Button } from '../shadcn/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card.tsx'
import { RadioGroup, RadioGroupItem } from '../shadcn/radio-group.tsx'
import { Label } from '../shadcn/label.tsx'
import { Badge } from '../shadcn/badge.tsx'
import { getPricingViewConfig, PricingViewConfig } from './pricing-view-utils.ts'
import { toast } from 'sonner'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry.ts'
import { clearSentryUser } from '@/analytics/sentry/sentry-initializer'
import { useNavigate } from 'react-router-dom'
import { PlanInterval } from '@template-app/core/constants/pricing-constants.ts'
import { PlanType } from '@template-app/api-client/orpc-contracts/billing-contract'
import { useGetSubscriptionDetails } from '@/hooks/api/billing/billing-hooks'
import { useCreateCustomerPortalSession } from '@/hooks/api/portal-session/portal-session-hooks'
import { useCheckoutMutation } from '@/hooks/api/checkout/checkout-hooks'
import { useLingui } from '@lingui/react/macro'
import { queryClient } from '@/config/react-query-config'
import { getSupabaseClient } from '@/transport/third-party/supabase/supabase-client'
import { useTrackingStore, getHasAllowedReferral } from '@/stores/tracking-store'

export const PricingView = () => {
  const { t } = useLingui()

  const [clickedPlan, setClickedPlan] = useState<PlanType>('year')
  const hasAllowedReferral = useTrackingStore(getHasAllowedReferral)
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

  const { data: subscriptionData } = useGetSubscriptionDetails()

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
      })
    }
  }

  const handleGoPracticeNowClick = () => {
    POSTHOG_EVENTS.click('go_practice_now_button')
    navigate(ROUTE_PATHS.DASHBOARD)
  }

  const handleSignOut = async () => {
    window.localStorage.clear()
    await getSupabaseClient().auth.signOut({ scope: 'local' })
    posthog.reset()
    queryClient.clear()
    clearSentryUser()
    toast.success(t`Sign out success`)
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
    <div className='mx-auto flex w-full max-w-md flex-col items-center gap-4 p-4'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-center'>{t`Choose your plan`}</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          <RadioGroup
            value={clickedPlan ?? undefined}
            onValueChange={(value) => handlePlanOptionClick(value as PlanType)}
            disabled={isPremiumUser}
          >
            {pricingViewConfig.plans.map((option) => (
              <div key={option.value ?? 'none'} className='flex items-start space-x-3 rounded-lg border p-4'>
                <RadioGroupItem value={option.value ?? ''} id={option.value ?? undefined} />
                <div className='flex flex-1 flex-col gap-1'>
                  <div className='flex items-center gap-2'>
                    <Label htmlFor={option.value ?? undefined} className='cursor-pointer font-medium'>
                      {option.label}
                    </Label>
                    {option.additionalMessage && <Badge variant='secondary'>{option.additionalMessage}</Badge>}
                  </div>
                  <div className='text-sm font-semibold'>{option.priceMessage}</div>
                  {option.discountMessage && <div className='text-sm text-green-600'>{option.discountMessage}</div>}
                  {option.billedYearly && <div className='text-sm text-muted-foreground'>{option.billedYearly}</div>}
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className='flex flex-col gap-2'>
            <Button onClick={handleCTAClick} disabled={pricingViewConfig.subscribeButton.isDisabled}>
              {pricingViewConfig.subscribeButton.text}
            </Button>
            {pricingViewConfig.startButton.shouldBeShown && (
              <Button variant='secondary' onClick={handleGoPracticeNowClick}>
                {pricingViewConfig.startButton.text}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Button variant='ghost' onClick={handleSignOut}>
        <LogOut size={16} />
        {t`Sign out`}
      </Button>
    </div>
  )
}
