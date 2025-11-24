import { z } from 'zod'
import { StressExerciseSchema } from '@yourbestaccent/api-client/orpc-contracts/stress-exercise-contract'
import { LLM_PROVIDER, LlmProviderConfig, StructuredLlmProviderConfig } from './generic-llm-types'

export const CORRECT_GRAMMAR_AND_EXPLAIN_SCHEMA = z
  .object({
    correction: z.string(),
    explanation: z.string(),
  })
  .strict()

export const GENERATE_TRANSLATION_EXERCISE_SCHEMA = z
  .object({
    study_language_sentence: z.string(),
    mother_language_sentence: z.string(),
  })
  .strict()

export const ANALYZE_GRAMMAR_PATTERNS_SCHEMA = z
  .object({
    patterns: z
      .array(
        z
          .object({
            structure: z.string(),
            hint: z.string().optional(),
            concept: z.string(),
          })
          .strict()
      )
      .max(5),
  })
  .strict()

export const GENERATE_STRESS_EXERCISES_SCHEMA = z
  .object({
    exercises: z.array(StressExerciseSchema),
  })
  .strict()

export const GET_ORTHOGRAPHIC_FORM_SCHEMA = z
  .object({
    orthographic_form: z.string().min(1),
  })
  .strict()

export const GET_ORTHOGRAPHIC_FORMS_SCHEMA = z
  .object({
    orthographic_forms: z.array(z.string().min(1)),
  })
  .strict()

export type GrammarCorrectionResponse = z.infer<typeof CORRECT_GRAMMAR_AND_EXPLAIN_SCHEMA>
export type GenerateTranslationExerciseResponse = z.infer<typeof GENERATE_TRANSLATION_EXERCISE_SCHEMA>
export type AnalyzeGrammarPatternsResponse = z.infer<typeof ANALYZE_GRAMMAR_PATTERNS_SCHEMA>
export type GenerateStressExercisesResponse = z.infer<typeof GENERATE_STRESS_EXERCISES_SCHEMA>
export type GetOrthographicFormResponse = z.infer<typeof GET_ORTHOGRAPHIC_FORM_SCHEMA>
export type GetOrthographicFormsResponse = z.infer<typeof GET_ORTHOGRAPHIC_FORMS_SCHEMA>

// Define provider configs with fallbacks
export const TRANSLATE_WORD_PROVIDER_CONFIG: LlmProviderConfig = {
  providers: [
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC },
  ],
  aiSpanName: 'translate_word_response',
}

export const CORRECT_GRAMMAR_END_EXPLAIN_PROVIDER_CONFIG: StructuredLlmProviderConfig<GrammarCorrectionResponse> = {
  providers: [
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC },
  ],
  schema: CORRECT_GRAMMAR_AND_EXPLAIN_SCHEMA,
  aiSpanName: 'grammar_correction_response',
}

export const CORRECT_GRAMMAR_PROVIDER_CONFIG: LlmProviderConfig = {
  providers: [
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC, temperature: 0 },
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
  ],
  aiSpanName: 'correct_grammar_response',
}

export const GET_TUTOR_RESPONSE_PROVIDER_CONFIG: LlmProviderConfig = {
  providers: [
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC },
  ],
  aiSpanName: 'get_tutor_response',
}

export const GENERATE_IPA_PROVIDER_CONFIG: LlmProviderConfig = {
  providers: [
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC },
  ],
  aiSpanName: 'generate_ipa_response',
}

export const GENERATE_EXERCISE_FROM_FREQUENCY_LIST_PROVIDER_CONFIG: LlmProviderConfig = {
  providers: [
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC },
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
  ],
  aiSpanName: 'generate_exercise_from_frequency_list_response',
}

export const TRANSLATE_TEXT_PROVIDER_CONFIG: LlmProviderConfig = {
  providers: [
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC },
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
  ],
  aiSpanName: 'translate_text_response',
}

export const GENERATE_TRANSLATION_EXERCISES_PROVIDER_CONFIG: StructuredLlmProviderConfig<GenerateTranslationExerciseResponse> =
  {
    providers: [
      { provider: LLM_PROVIDER.ANTHROPIC, temperature: 0.5 },
      { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
      { provider: LLM_PROVIDER.OPENAI },
    ],
    schema: GENERATE_TRANSLATION_EXERCISE_SCHEMA,
    aiSpanName: 'translation_exercise',
  }

export const ANALYZE_GRAMMAR_PATTERNS_PROVIDER_CONFIG: StructuredLlmProviderConfig<AnalyzeGrammarPatternsResponse> = {
  providers: [
    { provider: LLM_PROVIDER.ANTHROPIC },
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
    { provider: LLM_PROVIDER.OPENAI },
  ],
  schema: ANALYZE_GRAMMAR_PATTERNS_SCHEMA,
  aiSpanName: 'grammar_patterns',
}

export const GENERATE_STRESS_EXERCISES_PROVIDER_CONFIG: StructuredLlmProviderConfig<GenerateStressExercisesResponse> = {
  providers: [
    { provider: LLM_PROVIDER.OPENAI },
    { provider: LLM_PROVIDER.ANTHROPIC, temperature: 0 },
    { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
  ],
  schema: GENERATE_STRESS_EXERCISES_SCHEMA,
  aiSpanName: 'stress_exercises',
}

export const GET_ORTHOGRAPHIC_FORM_FOR_WORD_PROVIDER_CONFIG: StructuredLlmProviderConfig<GetOrthographicFormResponse> =
  {
    providers: [
      { provider: LLM_PROVIDER.ANTHROPIC },
      { provider: LLM_PROVIDER.OPENAI },
      { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
    ],
    schema: GET_ORTHOGRAPHIC_FORM_SCHEMA,
    aiSpanName: 'orthographic_form_response',
  }

export const GET_ORTHOGRAPHIC_FORMS_FOR_MULTIPLE_WORDS_PROVIDER_CONFIG: StructuredLlmProviderConfig<GetOrthographicFormsResponse> =
  {
    providers: [
      { provider: LLM_PROVIDER.ANTHROPIC },
      { provider: LLM_PROVIDER.OPENAI },
      { provider: LLM_PROVIDER.GOOGLE_GEN_AI },
    ],
    schema: GET_ORTHOGRAPHIC_FORMS_SCHEMA,
    aiSpanName: 'orthographic_forms_response',
  }
