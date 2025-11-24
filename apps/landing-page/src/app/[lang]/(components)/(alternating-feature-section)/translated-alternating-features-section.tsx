'use server'

import React from 'react'
import { AlternatingFeaturesSection } from './alternating-features-section'
import { Trans } from '@lingui/react/macro'

export const TranslatedAlternatingFeaturesSection = async () => {
  const features = [
    {
      title: <Trans>Advanced Voice Cloning Technology</Trans>,
      description: (
        <Trans>
          Experience cutting-edge AI voice cloning that creates a natural-sounding version of your voice speaking
          fluently in your target language. Practice with your own voice to make learning more engaging and effective.
        </Trans>
      ),
      imageUrl: '/images/feature-image-voice-cloning.jpg',
      imageAlt: 'Voice cloning technology visualization',
    },
    {
      title: <Trans>Personalized Learning Path</Trans>,
      description: (
        <Trans>
          Track your progress with detailed analytics and insights. Our smart algorithm adapts to your learning style
          and focuses on areas where you need the most improvement, ensuring efficient and targeted practice sessions.
        </Trans>
      ),
      imageUrl: '/images/feature-image-progress-tracking.jpg',
      imageAlt: 'Progress tracking dashboard',
    },
    {
      title: <Trans>Real-Time Pronunciation Feedback</Trans>,
      description: (
        <Trans>
          Get instant feedback on your pronunciation with our advanced speech recognition technology. Identify and
          correct mistakes immediately, helping you develop accurate pronunciation faster than traditional methods.
        </Trans>
      ),
      imageUrl: '/images/feature-image-real-time-feedback.jpg',
      imageAlt: 'Real-time feedback interface',
    },
    {
      title: <Trans>Support for Multiple Languages and Dialects</Trans>,
      description: (
        <Trans>
          Choose from a wide range of languages and regional dialects. Whether you're learning European Spanish or Latin
          American Spanish, British English or American English, we've got you covered with authentic native
          pronunciations.
        </Trans>
      ),
      imageUrl: '/images/feature-image-multilingual-support.jpg',
      imageAlt: 'Multiple language flags',
    },
  ]

  return <AlternatingFeaturesSection title={<Trans>Powerful Features for Better Learning</Trans>} features={features} />
}
