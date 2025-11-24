import { z } from 'zod'
import { ChatCompletion } from 'openai/resources/chat/completions'
import { openai } from '../openai/openai'
import { anthropic } from '../anthropic/anthropic'
import { logWithSentry } from '../../sentry/error-monitoring'
import { geminiModelName, googleGenAi } from '../google-gen-ai/google-gen-ai'
import { GenerationConfig, GenerateContentResponse } from '@google/genai'

import { AnthropicConfig, GoogleGenAiConfig, LLM_PROVIDER, LlmConfig, LlmProviderConfig } from './generic-llm-types'
import { MODEL_NAMES } from './llm-model-names'
import { buildPosthogLlmMetadata } from '../../posthog/posthog-llm-properties'

const DEFAULT_SCHEMA_NAME = 'structured_response'

const buildJsonSchema = (providerConfig: LlmProviderConfig): Record<string, unknown> | undefined => {
  if (!providerConfig.schema) {
    return undefined
  }

  return z.toJSONSchema(providerConfig.schema, {
    target: 'openapi-3.0',
    reused: 'inline',
  })
}

const extractTextFromGeminiResponse = (response: GenerateContentResponse): string | null => {
  if (response.text) {
    return response.text
  }

  const firstCandidate = response.candidates?.[0]
  if (!firstCandidate?.content?.parts) {
    return null
  }

  for (const part of firstCandidate.content.parts ?? []) {
    const maybeText = (part as { text?: string }).text
    if (maybeText) {
      return maybeText
    }
  }

  return null
}

type GeminiGenerationParams = Parameters<(typeof googleGenAi)['models']['generateContent']>[0]

const buildGeminiGenerationParams = (prompt: string, providerConfig: LlmProviderConfig): GeminiGenerationParams => {
  const config: GenerationConfig = {
    maxOutputTokens: 8096,
  }

  if (providerConfig.schema) {
    config.responseMimeType = 'application/json'
    config.responseJsonSchema = buildJsonSchema(providerConfig)
  }

  const posthogLlmMetadata = buildPosthogLlmMetadata(providerConfig.aiSpanName)

  return {
    model: geminiModelName,
    ...posthogLlmMetadata,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    config,
  }
}

const getGoogleGeminiLlmReply = async (
  prompt: string,
  providerConfig: LlmProviderConfig,
  llmConfig: GoogleGenAiConfig
): Promise<string | null> => {
  const params = buildGeminiGenerationParams(prompt, providerConfig)
  try {
    const response = await googleGenAi.models.generateContent(params)
    const text = extractTextFromGeminiResponse(response)

    if (!text) {
      logWithSentry({
        message: 'failed to generate content with google gemini api',
        params: {
          llmConfig,
        },
        error: 'empty or invalid response',
      })
      return null
    }
    return text
  } catch (error) {
    logWithSentry({
      message: 'fatal error with google gemini api',
      params: { llmConfig },
      error: error,
    })
    return null
  }
}

const extractTextFromAnthropicResponse = (
  response: Awaited<ReturnType<(typeof anthropic)['messages']['create']>>
): string | null => {
  // anthropic SDK returns a stream union when streaming is enabled; bail early if we somehow got the stream variant
  if (!('content' in response)) {
    return null
  }

  const firstBlock = response.content[0]
  if (!firstBlock || firstBlock.type !== 'text') {
    return null
  }

  return firstBlock.text
}

const getAnthropicLlmReply = async (
  prompt: string,
  providerConfig: LlmProviderConfig,
  llmConfig: AnthropicConfig
): Promise<string | null> => {
  const posthogLlmMetadata = buildPosthogLlmMetadata(providerConfig.aiSpanName)

  try {
    const response = await anthropic.messages.create({
      model: MODEL_NAMES[LLM_PROVIDER.ANTHROPIC],
      max_tokens: 8096,
      temperature: llmConfig.temperature || 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      ...posthogLlmMetadata,
    })
    const text = extractTextFromAnthropicResponse(response)
    if (!text) {
      logWithSentry({
        message: 'failed to generate content with anthropic',
        params: { llmConfig },
        error: 'missing text content',
      })
      return null
    }

    return text
  } catch (error) {
    logWithSentry({
      message: 'failed to generate content with anthropic',
      params: { llmConfig },
      error: error,
    })
    return null
  }
}

const getOpenaiApiLlmReply = async (
  prompt: string,
  providerConfig: LlmProviderConfig,
  llmConfig: LlmConfig
): Promise<string | null> => {
  const posthogLlmMetadata = buildPosthogLlmMetadata(providerConfig.aiSpanName)

  try {
    const responseFormat = providerConfig.schema
      ? {
          type: 'json_schema' as const,
          json_schema: {
            name: providerConfig.aiSpanName ?? DEFAULT_SCHEMA_NAME,
            schema: buildJsonSchema(providerConfig),
            strict: true,
          },
        }
      : undefined

    const response: ChatCompletion = await openai.chat.completions.create({
      model: MODEL_NAMES[LLM_PROVIDER.OPENAI],
      verbosity: 'medium',
      reasoning_effort: 'minimal',
      store: false,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: responseFormat,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      ...posthogLlmMetadata,
    })

    return response.choices[0].message.content || ''
  } catch (error) {
    logWithSentry({
      message: 'failed to generate content with openai',
      params: { llmConfig },
      error: error,
    })
    return null
  }
}

const getLlmReply = async (
  prompt: string,
  llmConfig: LlmConfig,
  providerConfig: LlmProviderConfig
): Promise<string | null> => {
  const provider = llmConfig.provider
  if (provider === LLM_PROVIDER.OPENAI) {
    return getOpenaiApiLlmReply(prompt, providerConfig, llmConfig)
  } else if (provider === LLM_PROVIDER.ANTHROPIC) {
    return getAnthropicLlmReply(prompt, providerConfig, llmConfig)
  } else {
    return getGoogleGeminiLlmReply(prompt, providerConfig, llmConfig)
  }
}

export const getLlmReplyWithFallback = async (
  prompt: string,
  llmProviderConfig: LlmProviderConfig
): Promise<string | null> => {
  const { providers } = llmProviderConfig

  if (!providers || providers.length === 0) {
    logWithSentry({
      message: 'No LLM providers configured',
      params: { llmProviderConfig },
      error: 'Empty providers array',
    })
    return null
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]
    const providerName = provider.provider

    try {
      const result = await getLlmReply(prompt, provider, llmProviderConfig)

      if (result !== null) {
        if (i > 0) {
          logWithSentry({
            message: `Used fallback LLM provider ${providerName} (attempt ${i + 1}/${providers.length})`,
            params: { providers: providers.map((p) => p.provider) },
          })
        }
        return result
      }
    } catch (error) {
      logWithSentry({
        message: `LLM provider ${providerName} failed (attempt ${i + 1}/${providers.length})`,
        params: { provider },
        error: error,
      })
    }
  }

  logWithSentry({
    message: 'All LLM providers failed',
    params: { providers: providers.map((p) => p.provider) },
    error: 'Exhausted all providers',
  })
  return null
}
