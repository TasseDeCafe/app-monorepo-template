import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { langCodeToLanguageName } from '../../../../../utils/lang-code-utils'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { GET_TUTOR_RESPONSE_PROVIDER_CONFIG } from '../llm-configs'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'
import { VOICE_OF_THE_USER, VoiceOption } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'

const buildPrompt = (
  lastMessages: LlmLayerMessage[],
  motherLanguage: LangCode,
  studyLanguage: SupportedStudyLanguage,
  personality: PersonalityCode | null,
  voiceOption: VoiceOption
): string => {
  let tutorDescription = 'friendly and encouraging'

  if (personality !== null) {
    const personalityTraits: Record<PersonalityCode, string> = {
      [PersonalityCode.FRIENDLY]: 'friendly and encouraging',
      [PersonalityCode.PROFESSIONAL]: 'professional and formal',
      [PersonalityCode.HUMOROUS]: 'humorous and light-hearted',
      [PersonalityCode.STRICT]: 'strict and detail-oriented',
      [PersonalityCode.ENCOURAGING]: 'highly encouraging and supportive',
      [PersonalityCode.MISCHIEVOUS]: 'mischievous and playfully naughty, often making harmless jokes',
      [PersonalityCode.JOKER]: 'constantly making jokes and puns while teaching',
      [PersonalityCode.ANGRY]: 'perpetually grumpy but still teaching effectively',
      [PersonalityCode.SAD]: 'melancholic but caring, often sighing while teaching',
      [PersonalityCode.CUTE]: 'adorably sweet and nurturing, using lots of gentle encouragement',
      [PersonalityCode.INTROVERT]: 'quiet and thoughtful, preferring brief but meaningful interactions',
      [PersonalityCode.CRAZY]: 'wildly enthusiastic and unpredictable, but still focused on teaching',
    }
    tutorDescription = personalityTraits[personality]
  }

  // Get current date and time
  const now = new Date()
  const currentDateTime = now.toISOString().replace('T', ' ').substring(0, 19)

  return `${voiceOption !== VOICE_OF_THE_USER && `Your name is ${voiceOption}.`} You are a ${tutorDescription} language tutor, your partner's mother language is: ${langCodeToLanguageName(motherLanguage)}. Your role is to:
- Help your partner practice and improve ${langCodeToLanguageName(studyLanguage)} language skills
- Use mostly only ${langCodeToLanguageName(studyLanguage)}
- You can use ${langCodeToLanguageName(motherLanguage)} only in exceptional situations where the user asks for it
- encourage your partner to speak in ${langCodeToLanguageName(studyLanguage)}
- Correct grammar and vocabulary mistakes gently
- Encourage natural conversation while subtly teaching
- Keep responses concise (max 2-4 sentences, unless the partner is asking for more) and at an appropriate level
- Stay in character as a supportive conversation partner

The current date and time is: ${currentDateTime}

Below is the conversation history between the partner and yourself, from the oldest to the most recent at the bottom:
${lastMessages
  .reverse()
  .map((message, index) => {
    const timestamp = message.timestamp ? new Date(message.timestamp) : null
    const dateStr = timestamp ? ` (${timestamp.toISOString().replace('T', ' ').substring(0, 19)})` : ''
    return `${index + 1}. ${message.role === 'user' ? 'Student' : 'Tutor'}${dateStr}: ${message.content}`
  })
  .join('\n')}
`
}

export type MessageRole = 'bot' | 'user'

export interface LlmLayerMessage {
  content: string
  role: MessageRole
  language: LangCode
  timestamp: string
}

export const getTutorResponse = async (
  lastMessages: LlmLayerMessage[],
  motherLanguage: LangCode,
  studyLanguage: SupportedStudyLanguage,
  personality: PersonalityCode | null,
  voiceOption: VoiceOption
): Promise<string | null> => {
  const prompt = buildPrompt(lastMessages, motherLanguage, studyLanguage, personality, voiceOption)
  const response: string | null = await getLlmReplyWithFallback(prompt, GET_TUTOR_RESPONSE_PROVIDER_CONFIG)
  if (response === null) {
    logWithSentry({
      message: 'getLlmReply error',
      params: {
        motherLanguage,
        studyLanguage,
        personality,
        llmConfig: GET_TUTOR_RESPONSE_PROVIDER_CONFIG,
      },
    })
    return null
  }
  return response
}
