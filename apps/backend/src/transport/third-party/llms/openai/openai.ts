import { OpenAI } from '@posthog/ai'
import { getConfig } from '../../../../config/environment-config'
import { posthogClient } from '../../posthog/posthog-client'

export const openai = new OpenAI({
  apiKey: getConfig().openaiApiKey,
  posthog: posthogClient,
})
