import { EXTERNAL_LINKS } from '@template-app/core/constants/external-links'
import { CreatorVideo } from '@/app/[lang]/(components)/(video-grid-section)/creator-video'
import { Trans } from '@lingui/react/macro'

export const VideoGridSection = () => {
  return (
    <section className='w-full bg-gray-50 py-12'>
      <div className='container mx-auto px-4'>
        <h2 className='mb-12 text-center text-3xl font-bold text-gray-900 md:text-4xl'>
          <Trans>What Content Creators Say About Us</Trans>
        </h2>
        <div className='flex flex-col gap-8 gap-y-4 md:flex-row md:gap-x-12'>
          <CreatorVideo videoUrl={EXTERNAL_LINKS.YOUTUBE.TIENGOS_1_VIDEO} iframeTitle={'tiengos video'} />
          <CreatorVideo videoUrl={EXTERNAL_LINKS.YOUTUBE.ELISAPENA_DEMO} iframeTitle={'elisapena video'} />
        </div>
      </div>
    </section>
  )
}
