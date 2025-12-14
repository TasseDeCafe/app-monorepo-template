import { Loader2 } from 'lucide-react'

export const FullViewLoader = () => {
  return (
    <div className='flex w-full flex-1 items-center justify-center'>
      <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
    </div>
  )
}
