import React from 'react'
import { FAQItem } from '../FAQItem'
import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links'
import { useSelector } from 'react-redux'
import { selectHasAllowedReferral } from '../../state/slices/account-slice.ts'
import { getConfig } from '../../config/environment-config.ts'
import { useLingui } from '@lingui/react/macro'
import { NUMBER_OF_DAYS_IN_FREE_TRIAL, REFUND_PERIOD_IN_DAYS } from '@template-app/core/constants/pricing-constants'

export const PricingFaqItems: React.FC = () => {
  const { t } = useLingui()

  const hasAllowedReferral = useSelector(selectHasAllowedReferral)

  const pricingFaqItems = [
    {
      question: t`How do I get a free trial?`,
      answer:
        !hasAllowedReferral && !getConfig().featureFlags.isCreditCardRequiredForAll()
          ? t`You can get a free trial by signing up to our Free Trial plan. No credit card is required, and the trial automatically cancels after ${NUMBER_OF_DAYS_IN_FREE_TRIAL} days.`
          : t`You can get a ${NUMBER_OF_DAYS_IN_FREE_TRIAL}-day free trial by signing up and entering your credit card details. Don't worry, you won't be charged during the trial period, and you can cancel anytime before it ends. Even if you forget and get charged, we do have a ${REFUND_PERIOD_IN_DAYS}-day refund guarantee.`,
    },
    {
      question: t`Can I get a refund?`,
      answer: (
        <>
          {t`Yes, you can get a refund within ${REFUND_PERIOD_IN_DAYS} after you've been charged. We do not want to charge customers who are not happy about the product. Please read more about our refund policy here:`}{' '}
          <a
            href={EXTERNAL_LINKS.REFUND_POLICY}
            target='_blank'
            rel='noopener noreferrer'
            className='text-indigo-600 underline hover:text-indigo-800'
          >
            {t`Refund Policy`}
          </a>
        </>
      ),
    },
    {
      question: t`Is the payment service secure?`,
      answer: t`Yes, our payment service is secure. We use Stripe for financial processing, and we do not store any information about your card. Stripe ensures bank-level security standards.`,
    },
    {
      question: t`Can I upgrade or downgrade my subscription?`,
      answer: t`Yes, you can upgrade or downgrade your subscription at any time. Go to the top right of the app when you are logged in, click on your profile image, open the Account section in the menu and click Manage Subscription, you will be redirected to Stripe's billing portal where you can switch choose-plan.`,
    },
    {
      question: t`Can I cancel my subscription anytime?`,
      answer: t`You can cancel your subscription at any time. Go to the Account section when you are logged in and click on Manage Subscription, you will be redirected to Stripe's billing portal where you can download invoices, switch choose-plan and cancel your subscription.`,
    },
  ]

  return (
    <>
      {pricingFaqItems.map((item, index) => (
        <FAQItem
          key={index}
          question={item.question}
          answer={item.answer}
          isLast={index === pricingFaqItems.length - 1}
        />
      ))}
    </>
  )
}
