import { FAQItem } from '@/app/[lang]/(components)/(faq-section)/faq-item'
import { FaqItemDependingOnCardDetails } from '@/app/[lang]/(components)/(faq-section)/faq-item-depending-on-card-details'
import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links'
import { Trans } from '@lingui/react/macro'
import { ReactNode } from 'react'
import { NUMBER_OF_DAYS_IN_FREE_TRIAL, REFUND_PERIOD_IN_DAYS } from '@template-app/core/constants/pricing-constants'

type PricingFaqItem = {
  question: ReactNode
  answer?: ReactNode
  type?: 'depends-on-free-trial'
  answerWithCreditCardNeeded?: ReactNode
  answerWithCreditCardNotNeeded?: ReactNode
}

export const PricingFaqItems = () => {
  const pricingFaqItems: PricingFaqItem[] = [
    {
      type: 'depends-on-free-trial',
      question: <Trans>How do I get a free trial?</Trans>,
      answerWithCreditCardNeeded: (
        <Trans>
          You can get a {NUMBER_OF_DAYS_IN_FREE_TRIAL}-day free trial by signing up and entering your credit card
          details. Don't worry, you won't be charged during the trial period, and you can cancel anytime before it ends.
          Even if you forget and get charged, we do have a {REFUND_PERIOD_IN_DAYS}-day refund guarantee.
        </Trans>
      ),
      answerWithCreditCardNotNeeded: (
        <Trans>
          You can get a free trial by signing up to our Free Trial plan. No credit card is required, and the trial
          automatically cancels after {NUMBER_OF_DAYS_IN_FREE_TRIAL} days.
        </Trans>
      ),
    },
    {
      question: <Trans>Can I get a refund?</Trans>,
      answer: (
        <>
          <Trans>
            Yes, you can get a refund within {REFUND_PERIOD_IN_DAYS} after you've been charged. We do not want to charge
            customers who are not happy about the product. Please read more about our refund policy here:
          </Trans>{' '}
          <a
            href={EXTERNAL_LINKS.REFUND_POLICY}
            target='_blank'
            rel='noopener noreferrer'
            className='text-indigo-600 underline hover:text-indigo-800'
          >
            <Trans>Refund Policy</Trans>
          </a>
        </>
      ),
    },
    {
      question: <Trans>Is the payment service secure?</Trans>,
      answer: (
        <Trans>
          Yes, our payment service is secure. We use Stripe for financial processing, and we do not store any
          information about your card. Stripe ensures bank-level security standards.
        </Trans>
      ),
    },
    {
      question: <Trans>Can I upgrade or downgrade my subscription?</Trans>,
      answer: (
        <Trans>
          Yes, you can upgrade or downgrade your subscription at any time. Once you're subscribed, just come back to
          this view and click "Manage Subscription", you will be redirected to the Stripe's billing portal where you can
          switch plan.
        </Trans>
      ),
    },
    {
      question: <Trans>Can I cancel my subscription anytime?</Trans>,
      answer: (
        <Trans>
          You can cancel your subscription at any time. Once you're subscribed, just come back to this page and click
          "Manage Subscription"; you will be redirected to Stripe's billing portal where you can download invoices,
          switch plan, and cancel your subscription.
        </Trans>
      ),
    },
  ]

  return (
    <>
      {pricingFaqItems.map((item, index) => {
        if (item.type === 'depends-on-free-trial') {
          return (
            <FaqItemDependingOnCardDetails
              key={index}
              question={item.question}
              answerWithCreditCardNeeded={item.answerWithCreditCardNeeded!}
              answerWithCreditCardNotNeeded={item.answerWithCreditCardNotNeeded!}
              isLast={index === pricingFaqItems.length - 1}
            />
          )
        }
        return (
          <FAQItem
            key={index}
            question={item.question}
            answer={item.answer!}
            isLast={index === pricingFaqItems.length - 1}
          />
        )
      })}
    </>
  )
}
