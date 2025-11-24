'use client'

import { useDidScroll } from '@/hooks/use-did-scroll'
import { VIDEO_ELEMENT_ID } from '@/constants/html-ids'

const VIDEO_ID = 'RtLS_fStgiw'

import { ReactNode } from 'react'

type VideoProps = {
  title: ReactNode
  iframeTitle: string
}

const DemoVideo = ({ title, iframeTitle }: VideoProps) => {
  const userScrolled = useDidScroll()

  return (
    <div id={VIDEO_ELEMENT_ID} className='w-full'>
      {userScrolled ? (
        <section className='bg-gray-50 py-12'>
          <div className='container mx-auto px-4'>
            <h2 className='mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl'>{title}</h2>
            <div className='flex justify-center'>
              <div className='relative aspect-video w-full max-w-[1000px]'>
                <iframe
                  width='560'
                  height='315'
                  src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}`}
                  title={iframeTitle}
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  referrerPolicy='strict-origin-when-cross-origin'
                  allowFullScreen
                  className='absolute left-0 top-0 h-full w-full rounded-lg shadow-lg'
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className='h-[56.25vw] max-h-[390px]' />
      )}
    </div>
  )
}

export default DemoVideo
