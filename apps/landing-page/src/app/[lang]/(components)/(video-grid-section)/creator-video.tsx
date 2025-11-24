'use client'

import { useDidScroll } from '@/hooks/use-did-scroll'
import { VIDEO_ELEMENT_ID } from '@/constants/html-ids'

type VideoProps = {
  videoUrl: string
  iframeTitle: string
}

export const CreatorVideo = ({ videoUrl, iframeTitle }: VideoProps) => {
  const userScrolled = useDidScroll()

  return (
    <div id={VIDEO_ELEMENT_ID} className='w-full'>
      {userScrolled ? (
        <div className='relative aspect-video w-full max-w-[1000px]'>
          <iframe
            width='560'
            height='315'
            src={videoUrl}
            title={iframeTitle}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
            referrerPolicy='strict-origin-when-cross-origin'
            allowFullScreen
            className='absolute left-0 top-0 h-full w-full rounded-lg shadow-lg'
          ></iframe>
        </div>
      ) : (
        <div className='h-[56.25vw] max-h-[390px]' />
      )}
    </div>
  )
}
