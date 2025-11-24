'use client'

import React from 'react'
import { motion } from 'motion/react'
import { ButtonLeadingToWebapp } from '@/app/[lang]/(components)/(leading-to-apps)/button-leading-to-webapp'

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

import { ReactNode } from 'react'

type CTASectionProps = {
  titleLine1: ReactNode
  titleLine2: ReactNode
  titleLine3: ReactNode
  description: ReactNode
  buttonText: ReactNode
}

const CTASection = ({ titleLine1, titleLine2, titleLine3, description, buttonText }: CTASectionProps) => {
  return (
    <section className='relative mx-auto w-full max-w-4xl overflow-hidden px-4 py-8 md:py-16'>
      <div className='absolute inset-0'></div>
      <motion.div
        className='relative z-10 flex flex-col items-center text-center'
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.h2 className='text-3xl font-bold md:text-4xl lg:text-5xl lg:leading-tight' variants={fadeInUpVariants}>
          <span className='block bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 bg-clip-text text-transparent'>
            {titleLine1}
          </span>
          <span className='block bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 bg-clip-text text-transparent'>
            {titleLine2}
          </span>
          <span className='block bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400 bg-clip-text text-transparent'>
            {titleLine3}
          </span>
        </motion.h2>
        <motion.p className='mt-6 max-w-2xl text-lg text-gray-600' variants={fadeInUpVariants}>
          {description}
        </motion.p>
        <motion.div
          className='mt-8 flex w-full flex-col items-center justify-center gap-4 sm:flex-row'
          variants={fadeInUpVariants}
        >
          <ButtonLeadingToWebapp
            analyticsClickName='start_button_in_cta_section'
            buttonText={buttonText}
            className='flex h-14 w-72 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2 text-xl font-medium text-white shadow-lg shadow-orange-100 transition-transform duration-200 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 active:from-orange-700 active:to-amber-700'
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default CTASection
