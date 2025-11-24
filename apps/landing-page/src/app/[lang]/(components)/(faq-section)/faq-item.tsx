'use client'

import React, { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type FAQItemProps = {
  question: ReactNode
  answer: ReactNode
  isLast: boolean
}

export const FAQItem = ({ question, answer, isLast }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`py-4 ${isLast ? '' : 'border-b border-gray-200'}`}>
      <button className='flex w-full items-center justify-between text-left' onClick={() => setIsOpen(!isOpen)}>
        <span className='mt-2 text-xl font-medium text-gray-900'>{question}</span>
        <div
          className={`h-6 w-6 flex-shrink-0 transform transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <ChevronDown className='h-full w-full text-indigo-600' />
        </div>
      </button>
      <div
        className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className='text-gray-600'>{answer}</div>
      </div>
    </div>
  )
}
