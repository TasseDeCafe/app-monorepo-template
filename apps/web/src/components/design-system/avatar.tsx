import { useState } from 'react'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

type CircularAvatarProps = {
  initials: string
  url: string
}

export const Avatar = ({ initials, url }: CircularAvatarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hadError, setHadError] = useState(false)

  return (
    <div className='relative flex h-10 w-10 flex-col items-center justify-center rounded-xl drop-shadow-sm'>
      {!hadError && (
        <img
          src={url}
          alt={initials}
          className={cn(`z-10 h-full w-full rounded-xl object-cover transition-opacity duration-300`, {
            hidden: !imageLoaded,
          })}
          onLoad={() => setImageLoaded(true)}
          onError={() => setHadError(true)}
        />
      )}
      {(!imageLoaded || hadError) && (
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-bl from-indigo-500 to-indigo-600 font-medium text-white'>
          {initials}
        </div>
      )}
    </div>
  )
}
