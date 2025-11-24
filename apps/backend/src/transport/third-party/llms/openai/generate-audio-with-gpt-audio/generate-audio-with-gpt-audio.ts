import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { buildPosthogLlmMetadata } from '../../../posthog/posthog-llm-properties'
import { openai } from '../openai'
import { dialectCodeToDialectName } from '../../../../../utils/lang-code-utils'

export const DIALECTS_USING_GPT_AUDIO = [
  DialectCode.AMERICAN_ENGLISH,
  DialectCode.BRITISH_ENGLISH,
  DialectCode.AUSTRALIAN_ENGLISH,
  DialectCode.SCOTTISH_ENGLISH,
  DialectCode.INDIAN_ENGLISH,
  // we prefer to generate African-American Vernacular English with elevenlabs
  // DialectCode.AFRICAN_AMERICAN_VERNACULAR_ENGLISH,
  DialectCode.CASTILIAN_SPANISH,
  DialectCode.MEXICAN_SPANISH,
  DialectCode.COLOMBIAN_SPANISH,
  DialectCode.ARGENTINIAN_SPANISH,
  DialectCode.PERUVIAN_SPANISH,
  // we prefer to generate Andalusian Spanish with elevenlabs
  // DialectCode.ANDALUSIAN_SPANISH,
  DialectCode.PARISIAN_FRENCH,
  DialectCode.BELGIAN_FRENCH,
  DialectCode.CANADIAN_FRENCH,

  DialectCode.BRAZILIAN_PORTUGUESE,
  DialectCode.EUROPEAN_PORTUGUESE,

  DialectCode.STANDARD_ITALIAN,

  DialectCode.STANDARD_POLISH,

  DialectCode.STANDARD_RUSSIAN,

  DialectCode.STANDARD_DUTCH,
] as const

export type GptAudioDialect = (typeof DIALECTS_USING_GPT_AUDIO)[number]

const SYSTEM_PROMPT =
  'I am a native speaker with a natural accent. I know how to read sentences with proper intonation and emotions appropriate to the context.'

const USER_PROMPT_TEMPLATE = `Read exactly what is after '---' with a {dialect} accent --- {text}`

const getLlmFriendlyDialectName = (dialect: DialectCode): string => {
  switch (dialect) {
    case DialectCode.AMERICAN_ENGLISH:
      return 'General American English'
    case DialectCode.BRITISH_ENGLISH:
      return 'Received Pronunciation'
    default:
      return dialectCodeToDialectName(dialect)
  }
}

export const isGptAudioDialect = (dialect: DialectCode): dialect is GptAudioDialect => {
  return DIALECTS_USING_GPT_AUDIO.includes(dialect as GptAudioDialect)
}

const getPromptForLanguageAndDialect = (dialect: DialectCode, text: string): string => {
  const mappedDialect = getLlmFriendlyDialectName(dialect)
  return USER_PROMPT_TEMPLATE.replace('{dialect}', mappedDialect).replace('{text}', text)
}

export enum GptAudioVoice {
  CORAL = 'coral',
  SHIMMER = 'shimmer',
  ECHO = 'echo',
  ASH = 'ash',
}

export const generateAudioWithGptAudio = async (
  text: string,
  gptAudioVoice: GptAudioVoice,
  language: SupportedStudyLanguage,
  dialect: GptAudioDialect
): Promise<{ generatedAudioData: Uint8Array } | null> => {
  const posthogLlmMetadata = buildPosthogLlmMetadata('gpt-audio')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-audio',
      modalities: ['text', 'audio'],
      audio: { voice: gptAudioVoice, format: 'mp3' },
      ...posthogLlmMetadata,
      store: false,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: getPromptForLanguageAndDialect(dialect, text),
            },
          ],
        },
      ],
    })

    const audioData = response.choices[0].message.audio?.data
    if (!audioData) {
      logWithSentry({
        message: 'No audio data received from gpt-audio',
        params: {
          text,
          gptAudioVoice,
          language,
          dialect,
        },
      })
      return null
    }

    return {
      generatedAudioData: Buffer.from(audioData, 'base64'),
    }
  } catch (error) {
    logWithSentry({
      message: 'Error while generating audio with gpt-audio',
      params: {
        text,
        gptAudioVoice,
        language,
        dialect,
      },
      error: error,
    })
    return null
  }
}
