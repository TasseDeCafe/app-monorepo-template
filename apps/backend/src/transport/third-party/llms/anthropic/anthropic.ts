import { getConfig } from '../../../../config/environment-config'
import { Anthropic } from '@posthog/ai'
import { posthogClient } from '../../posthog/posthog-client'

export const anthropic = new Anthropic({
  apiKey: getConfig().anthropicApiKey,
  posthog: posthogClient,
})
