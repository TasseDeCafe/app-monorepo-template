import { ReactNode } from 'react'
import { NavBar } from './navbar.tsx'

export const WithFixedNavbar = ({ children }: { children: ReactNode }) => {
  return (
    <div className='fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-indigo-50 to-white font-inter text-slate-800'>
      <div className='absolute top-2 z-[100] w-full md:top-4 3xl:top-12'>
        <NavBar />
      </div>
      <main className='flex flex-1 flex-col items-center overflow-hidden pt-20 md:mb-8 md:pt-28 3xl:mb-16 3xl:pt-48'>
        {children}
      </main>
    </div>
  )
}
