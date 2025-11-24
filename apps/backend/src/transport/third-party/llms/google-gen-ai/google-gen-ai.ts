import { GoogleGenAI as PostHogGoogleGenAI } from '@posthog/ai'
import { getConfig } from '../../../../config/environment-config'
import { posthogClient } from '../../posthog/posthog-client'

const config = getConfig()

export const googleGenAi = new PostHogGoogleGenAI({
  apiKey: config.googleAiStudioApiKey,
  posthog: posthogClient,
})

export const geminiModelName = 'gemini-2.0-flash'
