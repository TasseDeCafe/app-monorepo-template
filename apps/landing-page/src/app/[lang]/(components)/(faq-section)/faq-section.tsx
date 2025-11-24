'use server'

import { Trans } from '@lingui/react/macro'
import { FAQItem } from '@/app/[lang]/(components)/(faq-section)/faq-item'
import { PricingFaqItems } from '@/app/[lang]/(components)/(faq-section)/pricing-faq-items'

const FAQSection = () => {
  const faqItems = [
    {
      question: <Trans>Why should I practice with my voice clone?</Trans>,
      answer: (
        <Trans>
          For decades, the best way to improve pronunciation was to learn language phonetics, listen to, and repeat
          after native speakers. Unfortunately, perfect pronunciation requires much more than these elements—it also
          involves prosody, intonation, rhythm, and a specific way of expressing emotions. When practicing, it's better
          to repeat after your own native voice instead of mimicking other people's native voices. This makes learning
          more natural, immersive and motivating.
        </Trans>
      ),
    },
    {
      question: <Trans>How long will it take to clone my voice?</Trans>,
      answer: (
        <Trans>
          You will be asked to read a very short text for about 30 seconds. The process then takes a few seconds.
        </Trans>
      ),
    },
    {
      question: <Trans>Who created this app?</Trans>,
      answer: (
        <Trans>
          We are two software engineers, Kamil and Sébastien, who are absolutely crazy about language learning;
          together, we speak over 15 languages. We always dreamed of using an app like this, but we never found one, so
          we decided to create it ourselves.
        </Trans>
      ),
    },
    {
      question: <Trans>Why is this app different?</Trans>,
      answer: (
        <Trans>
          Voice cloning technology and AI have improved dramatically in the last 2 years. We are the first to offer
          voice cloning to practice pronunciation in a language-learning app.
        </Trans>
      ),
    },
    {
      question: <Trans>How do you ensure the security of my voice data?</Trans>,
      answer: (
        <Trans>
          We take data security very seriously. Our team consists of experienced software engineers with over 15+ years
          of combined experience in both small and large companies. We regularly consult with external security experts
          to ensure we're following best practices in data protection. We use industry-standard solutions for
          authentication and data storage to maintain the highest level of security.
        </Trans>
      ),
    },
    {
      question: <Trans>Can I delete my voice data if I want to?</Trans>,
      answer: (
        <Trans>
          Absolutely! Unlike many companies, we allow users to remove their accounts and/or voices with a simple click
          in the account settings. There's no need to contact support or wait for days. Your voice data is removed
          immediately from our database and our voice cloning provider.
        </Trans>
      ),
    },
    {
      question: <Trans>How do you clone voices?</Trans>,
      answer: (
        <Trans>
          We use ElevenLabs as our voice cloning provider. They do not share voice clones or data with any big tech
          companies. ElevenLabs provides automated and moderated ways of securing voices. You can read more about their
          safety measures at: https://elevenlabs.io/safety
        </Trans>
      ),
    },
    {
      question: <Trans>Why should I trust YourBestAccent with my voice data?</Trans>,
      answer: (
        <Trans>
          We understand your concerns about data privacy. We are committed to transparency in our data handling
          practices. We only use your voice data for the purpose of improving pronunciation, and we give you full
          control over your data, including the ability to delete it at any time.
        </Trans>
      ),
    },
  ]

  return (
    <section className='container mx-auto px-4 py-8 sm:py-12' id='faq'>
      <h2 className='mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl'>
        <Trans>Frequently Asked Questions</Trans>
      </h2>
      <div className='mx-auto max-w-3xl rounded-lg bg-white p-6 shadow-lg shadow-indigo-100/50'>
        {faqItems.map((item, index) => (
          <FAQItem key={index} question={item.question} answer={item.answer} isLast={index === faqItems.length - 1} />
        ))}
        <div className='border-b border-gray-200' />
        <PricingFaqItems />
      </div>
    </section>
  )
}

export default FAQSection
