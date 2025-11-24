import { getRequestContextUserId } from '../../../context/request-context'

type PosthogLlmProperties = {
  $ai_span_name: string
}

type PosthogLlmMetadata = {
  posthogDistinctId: string
  posthogProperties: PosthogLlmProperties
}

export const buildPosthogLlmMetadata = (aiSpanName: string): PosthogLlmMetadata => {
  const userId = getRequestContextUserId() ?? 'anonymous-user'
  return {
    posthogDistinctId: userId,
    posthogProperties: {
      $ai_span_name: aiSpanName,
    },
  }
}
