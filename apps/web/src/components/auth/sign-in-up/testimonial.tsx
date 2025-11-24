import { FC } from 'react'

interface TestimonialProps {
  quote: string
  author: string
  role: string
  image: string
}

export const Testimonial: FC<TestimonialProps> = ({ quote, author, role, image }) => {
  return (
    <div className='flex h-full flex-col items-center justify-center bg-gray-50 p-8'>
      <div className='mx-auto max-w-2xl text-center'>
        <img className='mx-auto mb-8 h-28 w-28 rounded-full border-2 border-indigo-600' src={image} alt={author} />
        <blockquote className='mb-8 text-2xl font-medium text-gray-900'>"{quote}"</blockquote>
        <div className='font-medium'>
          <div className='text-xl text-gray-900'>{author}</div>
          <div className='text-indigo-600'>{role}</div>
        </div>
      </div>
    </div>
  )
}
