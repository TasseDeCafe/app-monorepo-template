import type { ZodType } from 'zod'

export enum LLM_PROVIDER {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE_GEN_AI = 'google-gen-ai',
}

export type OpenAiConfig = {
  provider: LLM_PROVIDER.OPENAI
}

export type AnthropicConfig = {
  provider: LLM_PROVIDER.ANTHROPIC
  temperature?: number
  // todo: anthropic doesn't support structured output out of the box,
  // they might at some point, so check
}

export type GoogleGenAiConfig = {
  provider: LLM_PROVIDER.GOOGLE_GEN_AI
}

// https://cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/adjust-parameter-values
export type LlmConfig = OpenAiConfig | AnthropicConfig | GoogleGenAiConfig

export type LlmProviderConfig<T = unknown> = {
  providers: LlmConfig[]
  schema?: ZodType<T>
  aiSpanName: string
}

// Structured configs enforce schema presence for helpers that expect parsed JSON
export type StructuredLlmProviderConfig<T> = LlmProviderConfig<T> & {
  schema: ZodType<T>
}
