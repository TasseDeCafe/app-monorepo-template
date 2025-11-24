'use client'

import React, { ReactNode } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'

type FeatureSectionProps = {
  title: ReactNode
  description: ReactNode
  imageUrl: string
  imageAlt: string
  reverse?: boolean
}

type AlternatingFeaturesSectionProps = {
  title: ReactNode
  features: FeatureSectionProps[]
}

const FeatureSection = ({ title, description, imageUrl, imageAlt, reverse }: FeatureSectionProps) => (
  <motion.div
    className={`mb-16 flex flex-col items-center ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}
    initial='hidden'
    whileInView='visible'
    viewport={{ once: true, amount: 0.1, margin: '100px' }}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    }}
  >
    <div className='mb-8 w-full lg:mb-0 lg:w-1/2 lg:px-6'>
      <div className='relative aspect-[3/2] w-full overflow-hidden rounded-lg shadow-lg shadow-indigo-100/50'>
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes='(min-width: 1024px) 50vw, 100vw'
          className='object-cover transition-transform duration-300 ease-in-out'
        />
      </div>
    </div>
    <div className='w-12'></div>
    <div className='w-full lg:w-1/2 lg:px-6'>
      <motion.h3
        className='mb-4 text-3xl font-bold text-stone-900'
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } },
        }}
      >
        {title}
      </motion.h3>
      <motion.p
        className='text-lg text-gray-600'
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } },
        }}
      >
        {description}
      </motion.p>
    </div>
  </motion.div>
)

export const AlternatingFeaturesSection = ({ title, features }: AlternatingFeaturesSectionProps) => {
  return (
    <section className='mt-16'>
      <div className='container mx-auto px-4'>
        <motion.h2
          className='mb-16 text-center text-4xl font-bold text-stone-900'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {title}
        </motion.h2>
        {features.map((feature, index) => (
          <FeatureSection key={index} {...feature} reverse={index % 2 !== 0} />
        ))}
      </div>
    </section>
  )
}
