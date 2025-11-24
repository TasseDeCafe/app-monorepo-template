import { DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { logWithSentry } from '../../transport/third-party/sentry/error-monitoring'
import { ElevenlabsApi } from '../../transport/third-party/elevenlabs/elevenlabs-api'
import { OpenaiApi } from '../../transport/third-party/llms/openai/openai-api'
import {
  GptAudioVoice,
  isGptAudioDialect,
} from '../../transport/third-party/llms/openai/generate-audio-with-gpt-audio/generate-audio-with-gpt-audio'
import {
  AudioGenerationServiceInterface,
  AudioGenerationTextParams,
  AudioGenerationWordParams,
  PronunciationSentenceResult,
  PronunciationWordResult,
} from './audio-generation.types'
import { dialectsToElevenlabsVoiceIds, voiceOptionsToElevenlabsVoices } from './predefined-elevenlabs-voices'
import { voiceOptionsToGptAudioVoices } from './predefined-gpt-audio-voices'
import { GenerateAudioTextWithAlignmentData } from '../../transport/third-party/elevenlabs/types'
import { VOICE_OF_THE_USER } from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { CartesiaApi } from '../../transport/third-party/cartesia/cartesia-api'

export const getPredefinedVoiceId = (dialect: DialectCode): string => {
  return dialectsToElevenlabsVoiceIds[dialect] || ''
}

const EUROPEAN_PORTUGUESE_CARTESIA_VOICE_ID = '6a360542-a117-4ed5-9e09-e8bf9b05eabb'

const generateAudioSentenceFailureResult = (crypticCode: string): PronunciationSentenceResult => ({
  isSuccess: false,
  crypticCode,
})

const generateAudioWordFailureResult = (crypticCode: string): PronunciationWordResult => ({
  isSuccess: false,
  crypticCode,
})

// how does voice changer work and why we use it?
// to make the user's voice (or any other voice, like our custom bot voices) have a given accent, we have to first
// generate the audio in the given accent in any voice (which can be done by a specific prompt in the case of gpt-audio and by
// finding a voice in the elevenlabs dashboard that has the accent we want), then we have to use voice changer to make
// the audio have a correct timbre. After a voice changer pass our audio will retain the accent,
// but will start sounding like the user's voice (or a custom voice, like our custom bot voices)
export const AudioGenerationService = (
  elevenlabsApi: ElevenlabsApi,
  openaiApi: OpenaiApi,
  cartesiaApi: CartesiaApi
): AudioGenerationServiceInterface => {
  const generateAudioText = async (params: AudioGenerationTextParams): Promise<PronunciationSentenceResult> => {
    const { text, language, dialect } = params

    // Determine voice configuration
    const userElevenlabsVoiceId = params.elevenlabsVoiceId
    const voiceOption = params.voiceOption || VOICE_OF_THE_USER
    const shouldUseClonedVoice = voiceOption === VOICE_OF_THE_USER && userElevenlabsVoiceId

    // todo: one user said that gpt-audio often slipped into Brazilian Portuguese
    // I decided to create a special branch for pt-PT here using the Cartesia API,
    // which has a more stable output for this dialect.
    // This will be a test of that API. If it works well, we could consider using it
    // more broadly for other dialects.
    if (dialect === DialectCode.EUROPEAN_PORTUGUESE) {
      // todo: pass the language param here
      const cartesiaResult = await cartesiaApi.generateAudioWithCartesia({
        text,
        voiceId: EUROPEAN_PORTUGUESE_CARTESIA_VOICE_ID,
      })

      if (!cartesiaResult) {
        return generateAudioSentenceFailureResult('210')
      }

      const cartesiaAudioBase64 = Buffer.from(cartesiaResult.generatedAudioData).toString('base64')

      if (shouldUseClonedVoice && userElevenlabsVoiceId) {
        const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(
          cartesiaAudioBase64,
          userElevenlabsVoiceId
        )
        if (!voiceChangerResult) {
          logWithSentry({
            message: 'failed to adapt Cartesia-generated audio with voice changer',
            params: { text, elevenlabsVoiceId: userElevenlabsVoiceId, language, dialect },
          })
          return generateAudioSentenceFailureResult('220')
        }
        return {
          isSuccess: true,
          generatedAudioData: voiceChangerResult.generatedAudioData,
          hasAlignment: false,
        }
      }

      const customVoiceId = voiceOption === VOICE_OF_THE_USER ? null : voiceOptionsToElevenlabsVoices[voiceOption]
      if (customVoiceId) {
        const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(cartesiaAudioBase64, customVoiceId)
        if (!voiceChangerResult) {
          logWithSentry({
            message: 'failed to adapt Cartesia-generated audio with custom voice changer',
            params: { text, elevenlabsVoiceId: customVoiceId, language, dialect },
          })
          return generateAudioSentenceFailureResult('230')
        }
        return {
          isSuccess: true,
          generatedAudioData: voiceChangerResult.generatedAudioData,
          hasAlignment: false,
        }
      }

      return {
        isSuccess: true,
        generatedAudioData: cartesiaResult.generatedAudioData,
        hasAlignment: false,
      }
    }

    if (shouldUseClonedVoice) {
      if (isGptAudioDialect(dialect)) {
        // any voice would work, not only ASH, this is passed through voice changer so it doesn't matter
        const gptAudioVoice = GptAudioVoice.ASH
        let audioBase64: string | null = null
        const gptAudioResult = await openaiApi.generateAudioWithGptAudio(text, gptAudioVoice, language, dialect)
        if (gptAudioResult) {
          audioBase64 = Buffer.from(gptAudioResult.generatedAudioData).toString('base64')
        } else {
          // fallback call to elevenlabs, if gpt-audio fails
          const predefinedVoiceId = getPredefinedVoiceId(dialect)
          const result = await elevenlabsApi.generateAudioTextWithAlignmentData(text, predefinedVoiceId)
          if (!result) {
            return generateAudioSentenceFailureResult('160')
          }
          audioBase64 = Buffer.from(result.generatedAudioData).toString('base64')
        }
        const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(audioBase64, userElevenlabsVoiceId)
        if (!voiceChangerResult) {
          logWithSentry({
            message: 'failed to generate audio with voice changer',
            params: { text, elevenlabsVoiceId: userElevenlabsVoiceId, language, dialect },
          })
          return generateAudioSentenceFailureResult('120')
        }
        return {
          isSuccess: true,
          generatedAudioData: voiceChangerResult.generatedAudioData,
          hasAlignment: false,
        }
      } else {
        const predefinedVoiceId = getPredefinedVoiceId(dialect)
        if (predefinedVoiceId) {
          // for example Andalusian Spanish, or African-American Vernacular English sound way better with elevenlabs
          const elevenlabsGenerationResult = await elevenlabsApi.generateAudioTextWithAlignmentData(
            text,
            predefinedVoiceId
          )
          if (!elevenlabsGenerationResult) {
            return generateAudioSentenceFailureResult('130')
          }
          const audioBase64 = Buffer.from(elevenlabsGenerationResult.generatedAudioData).toString('base64')
          const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(
            audioBase64,
            userElevenlabsVoiceId
          )
          if (!voiceChangerResult) {
            logWithSentry({
              message: 'failed to generate audio with voice changer',
              params: { text, elevenlabsVoiceId: userElevenlabsVoiceId, language, dialect },
            })
            return generateAudioSentenceFailureResult('140')
          }
          return {
            isSuccess: true,
            generatedAudioData: voiceChangerResult.generatedAudioData,
            alignmentData: elevenlabsGenerationResult.alignmentData,
            hasAlignment: true,
          }
        } else {
          // for languages that don't have dialects like Malay, we just go straight for elevenlabs generation
          const elevenlabsGenerationResult: GenerateAudioTextWithAlignmentData | null =
            await elevenlabsApi.generateAudioTextWithAlignmentData(text, userElevenlabsVoiceId)
          if (!elevenlabsGenerationResult) {
            return generateAudioSentenceFailureResult('150')
          }
          return {
            isSuccess: true,
            generatedAudioData: elevenlabsGenerationResult.generatedAudioData,
            alignmentData: elevenlabsGenerationResult.alignmentData,
            hasAlignment: true,
          }
        }
      }
    } else {
      // equivalent to !shouldUseClonedVoice
      if (isGptAudioDialect(dialect)) {
        const gptAudioVoice = voiceOptionsToGptAudioVoices[voiceOption]
        const gptAudioResult = await openaiApi.generateAudioWithGptAudio(text, gptAudioVoice, language, dialect)
        if (gptAudioResult) {
          return {
            isSuccess: true,
            generatedAudioData: gptAudioResult.generatedAudioData,
            hasAlignment: false,
          }
        } else {
          // fallback call to elevenlabs, if gpt-audio fails
          const predefinedVoiceId = getPredefinedVoiceId(dialect)
          const result = await elevenlabsApi.generateAudioTextWithAlignmentData(text, predefinedVoiceId)
          if (!result) {
            return generateAudioSentenceFailureResult('160')
          }
          const audioBase64 = Buffer.from(result.generatedAudioData).toString('base64')
          const elevenlabsVoiceId = voiceOptionsToElevenlabsVoices[voiceOption]
          const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(audioBase64, elevenlabsVoiceId)
          if (!voiceChangerResult) {
            logWithSentry({
              message: 'failed to generate audio with voice changer',
              params: { text, elevenlabsVoiceId, language, dialect },
            })
            return generateAudioSentenceFailureResult('170')
          }
          return {
            isSuccess: true,
            generatedAudioData: voiceChangerResult.generatedAudioData,
            alignmentData: result.alignmentData,
            hasAlignment: true,
          }
        }
      } else {
        const customVoiceId = voiceOptionsToElevenlabsVoices[voiceOption]
        const predefinedVoiceId = getPredefinedVoiceId(dialect)
        if (predefinedVoiceId) {
          // for example Andalusian Spanish, or African-American Vernacular English sound way better with elevenlabs
          const elevenlabsGenerationResult = await elevenlabsApi.generateAudioTextWithAlignmentData(
            text,
            predefinedVoiceId
          )
          if (!elevenlabsGenerationResult) {
            return generateAudioSentenceFailureResult('180')
          }
          const audioBase64 = Buffer.from(elevenlabsGenerationResult.generatedAudioData).toString('base64')
          const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(audioBase64, customVoiceId)
          if (!voiceChangerResult) {
            logWithSentry({
              message: 'failed to generate audio with voice changer',
              params: { text, elevenlabsVoiceId: customVoiceId, language, dialect },
            })
            return generateAudioSentenceFailureResult('190')
          }
          return {
            isSuccess: true,
            generatedAudioData: voiceChangerResult.generatedAudioData,
            alignmentData: elevenlabsGenerationResult.alignmentData,
            hasAlignment: true,
          }
        } else {
          const result = await elevenlabsApi.generateAudioTextWithAlignmentData(text, customVoiceId)
          if (!result) {
            return generateAudioSentenceFailureResult('200')
          }
          return {
            isSuccess: true,
            generatedAudioData: result.generatedAudioData,
            alignmentData: result.alignmentData,
            hasAlignment: true,
          }
        }
      }
    }
  }

  // note that we do not use gpt 4 audio for generating audio words
  const generateAudioWord = async (params: AudioGenerationWordParams): Promise<PronunciationWordResult> => {
    const { word, language, dialect } = params

    // Determine voice configuration
    const userElevenlabsVoiceId = params.elevenlabsVoiceId
    const voiceOption = params.voiceOption
    const shouldUseClonedVoice = voiceOption === VOICE_OF_THE_USER && userElevenlabsVoiceId
    const elevenlabsVoiceId = shouldUseClonedVoice ? userElevenlabsVoiceId : voiceOptionsToElevenlabsVoices[voiceOption]

    // todo: one user said that gpt-audio often slipped into Brazilian Portuguese
    // I decided to create a special branch for pt-PT here using the Cartesia API,
    // which has a more stable output for this dialect.
    // This will be a test of that API. If it works well, we could consider using it
    // more broadly for other dialects/languages.
    if (dialect === DialectCode.EUROPEAN_PORTUGUESE) {
      const cartesiaResult = await cartesiaApi.generateAudioWithCartesia({
        text: word,
        voiceId: EUROPEAN_PORTUGUESE_CARTESIA_VOICE_ID,
      })

      if (!cartesiaResult) {
        return generateAudioWordFailureResult('204')
      }

      const cartesiaAudioBase64 = Buffer.from(cartesiaResult.generatedAudioData).toString('base64')
      const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(
        cartesiaAudioBase64,
        elevenlabsVoiceId
      )
      if (!voiceChangerResult) {
        logWithSentry({
          message: 'failed to adapt Cartesia-generated word with voice changer',
          params: {
            word,
            elevenlabsVoiceId,
            language,
            dialect,
          },
        })
        return generateAudioWordFailureResult('205')
      }

      return { isSuccess: true, generatedAudioData: voiceChangerResult.generatedAudioData }
    }

    const isLanguageWithoutDialects = !Object.keys(dialectsToElevenlabsVoiceIds).includes(dialect)
    // for American English, we might skip voice changer because all 4 elevenlabs custom voices are native American English
    if (isLanguageWithoutDialects || dialect === DialectCode.AMERICAN_ENGLISH) {
      const result = await elevenlabsApi.generateAudioWord(word, elevenlabsVoiceId, language, dialect)
      if (!result) {
        return generateAudioWordFailureResult('200')
      }
      return { isSuccess: true, generatedAudioData: result }
    } else {
      const predefinedVoiceId = getPredefinedVoiceId(dialect)

      const resultAudioWithPredefinedVoice = await elevenlabsApi.generateAudioWord(
        word,
        predefinedVoiceId,
        language,
        dialect
      )
      if (!resultAudioWithPredefinedVoice) {
        return generateAudioWordFailureResult('202')
      }

      const audioBase64 = Buffer.from(resultAudioWithPredefinedVoice).toString('base64')
      const voiceChangerResult = await elevenlabsApi.generateAudioWithVoiceChanger(audioBase64, elevenlabsVoiceId)
      if (!voiceChangerResult) {
        logWithSentry({
          message: 'failed to generate audio with the voice changer',
          params: {
            word,
            elevenlabsVoiceId,
            language,
            dialect,
          },
        })
        return generateAudioWordFailureResult('203')
      }
      return { isSuccess: true, generatedAudioData: voiceChangerResult.generatedAudioData }
    }
  }

  return {
    generateAudioText,
    generateAudioWord,
  }
}
