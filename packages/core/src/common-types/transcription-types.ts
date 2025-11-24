import { z } from 'zod'

export const wordBaseSchema = z.object({
  word: z.string(),
  start: z.number(),
  end: z.number(),
  confidence: z.number(),
  punctuated_word: z.string().optional(),
  speaker: z.number().optional(),
  speaker_confidence: z.number().optional(),
})

const hitSchema = z.object({
  confidence: z.number(),
  start: z.number(),
  end: z.number(),
  snippet: z.string(),
})

const searchSchema = z.object({
  query: z.string(),
  hits: z.array(hitSchema),
})

const summarySchema = z.object({
  summary: z.string().optional(),
  start_word: z.number().optional(),
  end_word: z.number().optional(),
})

const sentenceSchema = z.object({
  text: z.string(),
  start: z.number(),
  end: z.number(),
})

const paragraphSchema = z.object({
  sentences: z.array(sentenceSchema),
  start: z.number(),
  end: z.number(),
  num_words: z.number(),
})

const paragraphGroupSchema = z.object({
  transcript: z.string(),
  paragraphs: z.array(paragraphSchema),
})

const entitySchema = z.object({
  label: z.string(),
  value: z.string(),
  confidence: z.number(),
  start_word: z.number(),
  end_word: z.number(),
})

const translationSchema = z.object({
  language: z.string(),
  translation: z.string(),
})

const topicSchema = z.object({
  topic: z.string(),
  confidence_score: z.number(),
})

const topicGroupSchema = z.object({
  topics: z.array(topicSchema),
  text: z.string(),
  start_word: z.number(),
  end_word: z.number(),
})

const alternativeSchema = z.object({
  transcript: z.string(),
  confidence: z.number(),
  words: z.array(wordBaseSchema),
  summaries: z.array(summarySchema).optional(),
  paragraphs: paragraphGroupSchema.optional(),
  entities: z.array(entitySchema).optional(),
  translations: z.array(translationSchema).optional(),
  topics: z.array(topicGroupSchema).optional(),
})

const channelSchema = z.object({
  search: z.array(searchSchema).optional(),
  alternatives: z.array(alternativeSchema),
  detected_language: z.string().optional(),
  language_confidence: z.number().optional(),
})

const intentSchema = z.object({
  intent: z.string(),
  confidence_score: z.number(),
})

const segmentSchema = z.object({
  text: z.string(),
  start_word: z.number(),
  end_word: z.number(),
  sentiment: z.string().optional(),
  sentiment_score: z.number().optional(),
  topics: z.array(topicSchema).optional(),
  intents: z.array(intentSchema).optional(),
})

const averageSchema = z.object({
  sentiment: z.string(),
  sentiment_score: z.number(),
})

const sentimentsSchema = z.object({
  segments: z.array(segmentSchema),
  average: averageSchema,
})

const topicsSchema = z.object({
  segments: z.array(segmentSchema),
})

const intentsSchema = z.object({
  segments: z.array(segmentSchema),
})

const utteranceSchema = z.object({
  start: z.number(),
  end: z.number(),
  confidence: z.number(),
  channel: z.number(),
  transcript: z.string(),
  words: z.array(wordBaseSchema),
  speaker: z.number().optional(),
  id: z.string(),
})

const transcriptionSummarySchema = z.object({
  result: z.string(),
  short: z.string(),
})

const resultSchema = z.object({
  channels: z.array(channelSchema),
  utterances: z.array(utteranceSchema).optional(),
  summary: transcriptionSummarySchema.optional(),
  sentiments: sentimentsSchema.optional(),
  topics: topicsSchema.optional(),
  intents: intentsSchema.optional(),
})

const warningSchema = z.object({
  parameter: z.string(),
  type: z.string(),
  message: z.string(),
})

const modelInfoSchema = z.object({
  name: z.string(),
  version: z.string(),
  arch: z.string(),
})

const summaryInfoSchema = z.object({
  input_tokens: z.number(),
  output_tokens: z.number(),
  model_uuid: z.string(),
})

const intentsInfoSchema = z.object({
  model_uuid: z.string(),
  input_tokens: z.number(),
  output_tokens: z.number(),
})

const sentimentInfoSchema = z.object({
  model_uuid: z.string(),
  input_tokens: z.number(),
  output_tokens: z.number(),
})

const topicsInfoSchema = z.object({
  model_uuid: z.string(),
  input_tokens: z.number(),
  output_tokens: z.number(),
})

const metadataSchema = z.object({
  transaction_key: z.string(),
  request_id: z.string(),
  sha256: z.string(),
  created: z.string(),
  duration: z.number(),
  channels: z.number(),
  models: z.array(z.string()),
  warnings: z.array(warningSchema).optional(),
  model_info: z.record(z.string(), modelInfoSchema),
  summary_info: summaryInfoSchema.optional(),
  intents_info: intentsInfoSchema.optional(),
  sentiment_info: sentimentInfoSchema.optional(),
  topics_info: topicsInfoSchema.optional(),
  extra: z.record(z.string(), z.unknown()).optional(),
})

export const transcriptionResponseSchema = z.object({
  metadata: metadataSchema,
  results: resultSchema,
})

export type TranscriptionResponse = z.infer<typeof transcriptionResponseSchema>
export type WordBase = z.infer<typeof wordBaseSchema>
