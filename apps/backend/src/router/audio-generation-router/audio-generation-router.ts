import { Router } from 'express'
import { implement } from '@orpc/server'
import { createOrpcExpressRouter } from '../orpc/helpers/create-orpc-express-router'
import { type OrpcContext } from '../orpc/orpc-context'
import {
  audioGenerationContract,
  CustomVoice,
} from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import type {
  AudioGenerationServiceInterface,
  PronunciationSentenceResult,
} from '../../service/audio-generation-service/audio-generation.types'
import type { UsersRepositoryInterface } from '../../transport/database/users/users-repository'
import { getConfig } from '../../config/environment-config'

export const getVoiceId = (voiceId: string): string => {
  const personalVoiceId = getConfig().personalElevenlabsVoiceId

  // If we're in development mode and the voice ID follows our pattern (personalId_userId)
  // This is set when cloning the voice.
  if (personalVoiceId && voiceId.startsWith(personalVoiceId + '_')) {
    return personalVoiceId
  }

  return voiceId
}

export const AudioGenerationRouter = (
  usersRepository: UsersRepositoryInterface,
  audioGenerationService: AudioGenerationServiceInterface
): Router => {
  const implementer = implement(audioGenerationContract).$context<OrpcContext>()

  const router = implementer.router({
    generateAudio: implementer.generateAudio.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId

      const dbUser = await usersRepository.findUserByUserId(userId)

      const elevenlabsVoiceId = dbUser?.elevenlabs_voice_id ? getVoiceId(dbUser.elevenlabs_voice_id) : null

      const result: PronunciationSentenceResult = elevenlabsVoiceId
        ? await audioGenerationService.generateAudioText({
            text: input.text,
            elevenlabsVoiceId,
            language: input.language,
            dialect: input.dialect,
            voiceOption: input.voiceOption,
          })
        : await audioGenerationService.generateAudioText({
            text: input.text,
            elevenlabsVoiceId: null,
            language: input.language,
            dialect: input.dialect,
            voiceOption: input.voiceOption as CustomVoice,
          })

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to generate audio.', code: result.crypticCode }],
          },
        })
      }

      const generatedAudioBase64 = Buffer.from(result.generatedAudioData).toString('base64')

      return {
        data: result.hasAlignment
          ? {
              audio: generatedAudioBase64,
              alignment: result.alignmentData,
              hasAlignment: true,
            }
          : {
              audio: generatedAudioBase64,
              hasAlignment: false,
            },
      }
    }),

    generateAudioWord: implementer.generateAudioWord.handler(async ({ input, context, errors }) => {
      const userId = context.res.locals.userId

      const dbUser = await usersRepository.findUserByUserId(userId)

      const elevenlabsVoiceId = dbUser?.elevenlabs_voice_id ? getVoiceId(dbUser.elevenlabs_voice_id) : null

      const result = elevenlabsVoiceId
        ? await audioGenerationService.generateAudioWord({
            word: input.word,
            elevenlabsVoiceId,
            language: input.language,
            dialect: input.dialect,
            voiceOption: input.voiceOption,
          })
        : await audioGenerationService.generateAudioWord({
            word: input.word,
            elevenlabsVoiceId: null,
            language: input.language,
            dialect: input.dialect,
            voiceOption: input.voiceOption as CustomVoice,
          })

      if (!result.isSuccess) {
        throw errors.INTERNAL_SERVER_ERROR({
          data: {
            errors: [{ message: 'Failed to generate audio for individual word.', code: result.crypticCode }],
          },
        })
      }

      const audioBase64 = Buffer.from(result.generatedAudioData).toString('base64')

      return {
        data: {
          audio: audioBase64,
        },
      }
    }),
  })

  return createOrpcExpressRouter(router, { contract: audioGenerationContract })
}
