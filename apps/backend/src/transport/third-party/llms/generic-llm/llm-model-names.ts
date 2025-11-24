import { LLM_PROVIDER } from './generic-llm-types'

export const MODEL_NAMES = {
  [LLM_PROVIDER.OPENAI]: 'gpt-5',
  [LLM_PROVIDER.ANTHROPIC]: 'claude-sonnet-4-5-20250929',
  [LLM_PROVIDER.GOOGLE_GEN_AI]: 'gemini-1.5-pro',
} as const

export const getModelName = (provider: LLM_PROVIDER): string => {
  return MODEL_NAMES[provider] || 'unknown'
}
