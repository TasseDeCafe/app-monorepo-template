import { z } from 'zod'
import { type StructuredLlmProviderConfig } from './generic-llm-types'
import { getLlmReplyWithFallback } from './generic-llm-utils'

export type StructuredJsonAttemptError = {
  attempt: number
  kind: 'no_response' | 'json_parse' | 'schema_validation' | 'custom_validation'
  error: string
  rawResponse?: string
}

export type StructuredJsonSuccess<T> = {
  success: true
  data: T
  rawResponse: string
  attempts: number
  previousErrors: StructuredJsonAttemptError[]
}

export type StructuredJsonFailure = {
  success: false
  reason: 'no_response' | 'invalid_json'
  attempts: number
  errors: StructuredJsonAttemptError[]
}

export type StructuredJsonResult<T> = StructuredJsonSuccess<T> | StructuredJsonFailure

type StructuredJsonRequest<T> = {
  prompt: string
  llmConfig: StructuredLlmProviderConfig<T>
  maxAttempts?: number
  repairInstructions?: string
  validateData?: (data: T) => string | null
}

const buildRepairPrompt = (
  originalPrompt: string,
  rawResponse: string,
  errorMessage: string,
  repairInstructions?: string
) => {
  const followUpInstructions =
    'Return only valid JSON that satisfies the original instructions. Do not include explanations, markdown, or code fences.'

  const additionalInstructions = repairInstructions ? `\n${repairInstructions}` : ''

  return `${originalPrompt}

The JSON response you produced was invalid. Review the error and provide a corrected response.

Error: ${errorMessage}

Invalid JSON:
${rawResponse}

${followUpInstructions}${additionalInstructions}`
}

export const getStructuredLlmJson = async <T>(request: StructuredJsonRequest<T>): Promise<StructuredJsonResult<T>> => {
  const { prompt, llmConfig, maxAttempts = 3, repairInstructions, validateData } = request

  let currentPrompt = prompt
  const attemptErrors: StructuredJsonAttemptError[] = []

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const llmReply = await getLlmReplyWithFallback(currentPrompt, llmConfig)

    if (!llmReply) {
      attemptErrors.push({
        attempt,
        kind: 'no_response',
        error: 'No response returned by any configured LLM provider',
      })
      continue
    }

    try {
      const parsedJson = JSON.parse(llmReply)
      const validation = llmConfig.schema.safeParse(parsedJson)

      if (!validation.success) {
        const errorMessage = z.prettifyError(validation.error)
        attemptErrors.push({
          attempt,
          kind: 'schema_validation',
          error: errorMessage,
          rawResponse: llmReply,
        })

        if (attempt === maxAttempts) {
          break
        }

        currentPrompt = buildRepairPrompt(prompt, llmReply, errorMessage, repairInstructions)
        continue
      }

      if (validateData) {
        const validationError = validateData(validation.data)

        if (validationError) {
          attemptErrors.push({
            attempt,
            kind: 'custom_validation',
            error: validationError,
            rawResponse: llmReply,
          })

          if (attempt === maxAttempts) {
            break
          }

          currentPrompt = buildRepairPrompt(prompt, llmReply, validationError, repairInstructions)
          continue
        }
      }

      return {
        success: true,
        data: validation.data,
        rawResponse: llmReply,
        attempts: attempt,
        previousErrors: attemptErrors,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      attemptErrors.push({
        attempt,
        kind: 'json_parse',
        error: message,
        rawResponse: llmReply,
      })

      if (attempt === maxAttempts) {
        break
      }

      currentPrompt = buildRepairPrompt(prompt, llmReply, message, repairInstructions)
    }
  }

  if (attemptErrors.length === 0) {
    return {
      success: false,
      reason: 'no_response',
      attempts: maxAttempts,
      errors: [
        {
          attempt: maxAttempts,
          kind: 'no_response',
          error: 'Failed to obtain any response from the LLM',
        },
      ],
    }
  }

  const reason = attemptErrors.some((error) => error.kind !== 'no_response') ? 'invalid_json' : 'no_response'

  return {
    success: false,
    reason,
    attempts: attemptErrors.length,
    errors: attemptErrors,
  }
}
