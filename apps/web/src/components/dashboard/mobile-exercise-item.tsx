import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ComponentType } from 'react'

interface MobileExerciseItemProps {
  icon: ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  to: string
}

export const MobileExerciseItem = ({ icon: Icon, title, description, to }: MobileExerciseItemProps) => {
  return (
    <Link to={to} className='block w-full active:brightness-90'>
      <div className='h-30 flex flex-row items-center rounded-2xl bg-white p-3'>
        <div className='mr-4 rounded-xl bg-slate-100 p-5'>
          <Icon size={30} className='text-indigo-500' />
        </div>
        <div className='flex-1 pr-6'>
          <div className='flex flex-row items-center'>
            <p className='text-sm font-medium text-slate-800'>{title}</p>
          </div>
          <p className='mt-1 text-xs text-gray-500'>{description}</p>
        </div>
        <div className='ml-auto'>
          <ArrowRight size={30} className='text-slate-300' />
        </div>
      </div>
    </Link>
  )
}
