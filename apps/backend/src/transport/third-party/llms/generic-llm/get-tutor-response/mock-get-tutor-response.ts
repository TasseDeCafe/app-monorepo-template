import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { LlmLayerMessage } from './get-tutor-response'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'
import { VoiceOption } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'

export const mockGetTutorResponse = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  lastMessages: LlmLayerMessage[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  motherLanguage: LangCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  studyLanguage: SupportedStudyLanguage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  personality: PersonalityCode | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  voiceOption: VoiceOption
): Promise<string | null> => 'AI response to user message'
