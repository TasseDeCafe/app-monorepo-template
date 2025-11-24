import { ReactNode } from 'react'
import { NavBar } from './navbar.tsx'

export const WithNavbar = ({ children }: { children: ReactNode }) => {
  return (
    <div className='flex w-full flex-1 flex-col items-center bg-gradient-to-br from-indigo-50 to-white pt-2 font-inter text-slate-800 md:pt-4 3xl:pt-12'>
      <NavBar />
      <main className='flex w-full flex-1 flex-col items-center'>{children}</main>
    </div>
  )
}
