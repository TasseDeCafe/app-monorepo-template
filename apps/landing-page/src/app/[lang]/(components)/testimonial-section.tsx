import React, { ReactNode } from 'react'
import { Trans } from '@lingui/react/macro'

type TestimonialProps = {
  quote: ReactNode
  author: ReactNode
  role: ReactNode
}

export const TestimonialSection = () => {
  const testimonials: TestimonialProps[] = [
    {
      quote: <Trans>Your website is a game changer for me.</Trans>,
      author: <Trans>Sarah L.</Trans>,
      role: <Trans>English native, learning Polish</Trans>,
    },
    {
      quote: (
        <Trans>
          Having a voice clone to practice accents? That's like having a personal language coach who never gets tired of
          hearing you speak!
        </Trans>
      ),
      author: <Trans>Michael T.</Trans>,
      role: <Trans>Spanish native, learning Russian</Trans>,
    },
    {
      quote: (
        <Trans>
          As a long-time language learner, this is so cool! Pronunciation is tough especially if you are using new
          muscles in your mouth.
        </Trans>
      ),
      author: <Trans>Yuki H.</Trans>,
      role: <Trans>Japanese native, learning English</Trans>,
    },
  ]

  return (
    <section className='py-8 sm:py-16'>
      <div className='container mx-auto px-4'>
        <h2 className='mb-12 text-center text-4xl font-bold text-stone-900'>
          <Trans>What Our Users Say</Trans>
        </h2>
        <div className='grid gap-8 md:grid-cols-3'>
          {testimonials.map((testimonial, index) => (
            <Testimonial key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  )
}

const Testimonial = ({ quote, author, role }: TestimonialProps) => (
  <div className='flex flex-col rounded-lg bg-white p-6 shadow-lg shadow-indigo-100/50'>
    <p className='mb-4 flex-grow italic text-gray-600'>&ldquo;{quote}&ldquo;</p>
    <div>
      <p className='font-semibold text-stone-900'>{author}</p>
      <p className='text-sm text-gray-500'>{role}</p>
    </div>
  </div>
)
