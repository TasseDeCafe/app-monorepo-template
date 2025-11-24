import { CustomVoice } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { GptAudioVoice } from '../../transport/third-party/llms/openai/generate-audio-with-gpt-audio/generate-audio-with-gpt-audio'

export const voiceOptionsToGptAudioVoices: Record<CustomVoice, GptAudioVoice> = {
  // taken from https://platform.openai.com/chat/edit?models=gpt-audio, click on the "Voice" dropdown
  [CustomVoice.NAMI]: GptAudioVoice.CORAL,
  [CustomVoice.WELA]: GptAudioVoice.SHIMMER,
  [CustomVoice.SIME]: GptAudioVoice.ECHO,
  [CustomVoice.LATU]: GptAudioVoice.ASH,
}
