import { useState } from 'react'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

type CircularAvatarProps = {
  initials: string
  url: string
  youtubeUrl?: string
  name?: string
  title?: string
}

export const CreatorAvatar = ({ initials, url, youtubeUrl, name, title }: CircularAvatarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hadError, setHadError] = useState(false)

  const handleClick = () => {
    if (youtubeUrl) {
      window.open(youtubeUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className='flex items-center gap-3'>
      <div
        onClick={handleClick}
        className={cn(
          'relative flex h-10 w-10 flex-col items-center justify-center rounded-xl drop-shadow-sm transition-transform md:h-14 md:w-14',
          {
            'cursor-pointer hover:scale-105': !!youtubeUrl,
          }
        )}
      >
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
          <div className='flex h-full w-full items-center justify-center rounded-xl bg-gray-100 text-lg font-medium text-stone-900'>
            {initials}
          </div>
        )}
      </div>
      {(name || title) && (
        <div className='flex flex-col gap-0.5'>
          {title && <span className='text-base text-gray-600'>{title}</span>}
          {name && <span className='text-base font-semibold text-gray-900'>{name}</span>}
        </div>
      )}
    </div>
  )
}
