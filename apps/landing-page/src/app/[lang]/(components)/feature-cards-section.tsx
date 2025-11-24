import { Book, Mic, TrendingUp } from 'lucide-react'
import React, { ReactNode } from 'react'
import { Trans } from '@lingui/react/macro'

type FeatureCardProps = {
  Icon: React.ElementType
  title: ReactNode
  description: ReactNode
}

export const FeatureCardsSection = () => {
  return (
    <section aria-label='Features' className='container mx-auto px-4 py-8 sm:px-10 sm:py-16'>
      <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
        <FeatureCard
          Icon={Mic}
          title={<Trans>Voice Cloning</Trans>}
          description={
            <Trans>Create a digital clone of your voice to practice pronunciation in your target language.</Trans>
          }
        />
        <FeatureCard
          Icon={Book}
          title={<Trans>Personalized Practice</Trans>}
          description={
            <Trans>Get tailored exercises and feedback based on your native language and learning goals.</Trans>
          }
        />
        <FeatureCard
          Icon={TrendingUp}
          title={<Trans>Track Progress</Trans>}
          description={<Trans>Monitor your improvement over time with detailed analytics and progress reports.</Trans>}
        />
      </div>
    </section>
  )
}

const FeatureCard = ({ Icon, title, description }: FeatureCardProps) => (
  <div className='flex flex-col items-start rounded-lg bg-white p-6 shadow-lg shadow-indigo-100/50'>
    <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100'>
      <Icon className='text-indigo-600' size={24} />
    </div>
    <h2 className='mb-2 text-xl font-semibold'>{title}</h2>
    <p className='text-gray-600'>{description}</p>
  </div>
)
