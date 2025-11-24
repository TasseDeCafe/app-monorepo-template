'use client'

import { useEffect, useState } from 'react'
import { localStorageWrapper } from '@/local-storage/local-storage'
import { FAQItem } from '@/app/[lang]/(components)/(faq-section)/faq-item'
import { getConfig } from '@/config/environment-config'

import { ReactNode } from 'react'

interface FaqItemDependingOnFreeTrialProps {
  question: ReactNode
  answerWithCreditCardNeeded: ReactNode
  answerWithCreditCardNotNeeded: ReactNode
  isLast: boolean
}

export const FaqItemDependingOnCardDetails = ({
  question,
  answerWithCreditCardNeeded,
  answerWithCreditCardNotNeeded,
  isLast,
}: FaqItemDependingOnFreeTrialProps) => {
  const [referral, setReferral] = useState<string>('')

  useEffect(() => {
    setReferral(localStorageWrapper.getReferral())
  }, [])

  const answer =
    !referral && !getConfig().featureFlags.isCreditCardRequiredForAll()
      ? answerWithCreditCardNotNeeded
      : answerWithCreditCardNeeded

  return <FAQItem question={question} answer={answer} isLast={isLast} />
}
