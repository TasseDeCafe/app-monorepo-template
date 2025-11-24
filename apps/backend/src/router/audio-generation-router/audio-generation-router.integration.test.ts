import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import { buildApp } from '../../app'
import type { Response as SuperTestResponse } from 'supertest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __createUserRightAfterSignup,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'
import { ElevenlabsApi, MockElevenlabsApi } from '../../transport/third-party/elevenlabs/elevenlabs-api'
import { MockOpenaiApi, OpenaiApi } from '../../transport/third-party/llms/openai/openai-api'
import { Express } from 'express'
import {
  AMERICAN_ENGLISH_MALE_VOICE_ID,
  COLOMBIAN_SPANISH,
  MARK_NATURAL_CONVERSATIONS_VOICE_ID,
} from '../../service/audio-generation-service/predefined-elevenlabs-voices'
import { AlignmentData } from '@yourbestaccent/core/common-types/alignment-types'
import {
  CustomVoice,
  VOICE_OF_THE_USER,
  VoiceOption,
} from '@yourbestaccent/api-client/orpc-contracts/audio-generation-contract'
import { GptAudioVoice } from '../../transport/third-party/llms/openai/generate-audio-with-gpt-audio/generate-audio-with-gpt-audio'

const validateAudioResponse = (response: SuperTestResponse, shouldHaveAlignment: boolean) => {
  expect(response.status).toBe(200)
  expect(response.body).toHaveProperty('data')
  expect(response.body.data).toHaveProperty('audio')
  expect(response.body.data).toHaveProperty('hasAlignment')

  // Validate base64 audio
  const audioContent = response.body.data.audio
  expect(audioContent).toBeTruthy()
  expect(audioContent).toMatch(/^[a-zA-Z0-9+/]+={0,2}$/)

  if (shouldHaveAlignment) {
    expect(response.body.data.hasAlignment).toBe(true)
    expect(response.body.data).toHaveProperty('alignment')
    const alignmentData = response.body.data.alignment as AlignmentData

    expect(alignmentData).toHaveProperty('chars')
    expect(alignmentData).toHaveProperty('charStartTimesMs')
    expect(alignmentData).toHaveProperty('charDurationsMs')

    expect(Array.isArray(alignmentData.chars)).toBe(true)
    expect(Array.isArray(alignmentData.charStartTimesMs)).toBe(true)
    expect(Array.isArray(alignmentData.charDurationsMs)).toBe(true)

    expect(alignmentData.chars.length).toBe(alignmentData.charStartTimesMs.length)
    expect(alignmentData.chars.length).toBe(alignmentData.charDurationsMs.length)
    expect(alignmentData.chars.length).toBeGreaterThan(0)

    alignmentData.charStartTimesMs.forEach((startTime) => {
      expect(typeof startTime).toBe('number')
      expect(startTime).toBeGreaterThanOrEqual(0)
    })

    alignmentData.charDurationsMs.forEach((duration) => {
      expect(typeof duration).toBe('number')
      expect(duration).toBeGreaterThan(0)
    })

    const isInAscendingOrder = alignmentData.charStartTimesMs.every((startTime, index) => {
      return index === 0 || startTime >= alignmentData.charStartTimesMs[index - 1]
    })
    expect(isInAscendingOrder).toBe(true)
  } else {
    expect(response.body.data.hasAlignment).toBe(false)
    expect(response.body.data).not.toHaveProperty('alignment')
  }
}

const generateAudioText = async (
  app: Express,
  token: string,
  text: string,
  language: LangCode,
  dialect: DialectCode,
  voiceOption: VoiceOption = VOICE_OF_THE_USER
) => {
  return request(app)
    .post('/api/v1/audio-generation/text')
    .set(buildAuthorizationHeaders(token))
    .send({ text, language, dialect, voiceOption })
}

const generateAudioWord = async (
  app: Express,
  token: string,
  word: string,
  language: LangCode,
  dialect: DialectCode,
  voiceOption: VoiceOption = VOICE_OF_THE_USER
) => {
  return request(app)
    .post('/api/v1/audio-generation/word')
    .set(buildAuthorizationHeaders(token))
    .send({ word, language, dialect, voiceOption })
}

describe('audio-generation-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  describe('generateAudioText', () => {
    describe('basic failures', () => {
      test('happy path with alignment data (Indonesian)', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await generateAudioText(
          testApp,
          token,
          'Some random sentence',
          LangCode.INDONESIAN,
          DialectCode.STANDARD_INDONESIAN
        )
        validateAudioResponse(response, true)
      })

      test('happy path without alignment data', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await generateAudioText(
          testApp,
          token,
          'Some random sentence',
          LangCode.ENGLISH,
          DialectCode.AMERICAN_ENGLISH
        )

        validateAudioResponse(response, false)
      })

      test('when user is unauthenticated', async () => {
        const testApp = buildApp({})
        const response = await request(testApp)
          .post(`/api/v1/audio-generation/text`)
          .send({ text: 'Some random sentence' })
        expect(response.status).toBe(401)
      })

      test('when user has an expired subscription', async () => {
        const { token, testApp } = await __createUserRightAfterSignup({})

        const response = await request(testApp)
          .post(`/api/v1/audio-generation/text`)
          .send({
            text: 'Some random sentence',
            language: LangCode.ENGLISH,
            dialect: DialectCode.AMERICAN_ENGLISH,
          })
          .set(buildAuthorizationHeaders(token))

        expect(response.status).toBe(403)
      })

      test('should return 400 when text contains emojis', async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const response = await generateAudioText(
          testApp,
          token,
          'Hello 😀 World',
          LangCode.ENGLISH,
          DialectCode.AMERICAN_ENGLISH
        )

        expect(response.status).toBe(400)
      })
    })
    describe("with user's voice", () => {
      const voiceOption = VOICE_OF_THE_USER
      test('for GPT dialect; use GPT with mapped American English; use voice changer', async () => {
        let voiceChangerWasCalled = false
        let gptAudioWasCalled = false

        const mockOpenaiApi: OpenaiApi = {
          ...MockOpenaiApi,
          generateAudioWithGptAudio: async (text, voiceId) => {
            gptAudioWasCalled = true
            expect(voiceId).toBe(GptAudioVoice.ASH)
            return {
              generatedAudioData: new Uint8Array([1, 2, 3]),
            }
          },
        }

        const mockElevenlabsApi: ElevenlabsApi = {
          ...MockElevenlabsApi,
          generateAudioWithVoiceChanger: async () => {
            voiceChangerWasCalled = true
            return {
              generatedAudioData: new Uint8Array([4, 5, 6]),
            }
          },
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            openaiApi: mockOpenaiApi,
            elevenlabsApi: mockElevenlabsApi,
          },
        })

        const response = await generateAudioText(
          testApp,
          token,
          'Test sentence',
          LangCode.ENGLISH,
          DialectCode.AMERICAN_ENGLISH,
          voiceOption
        )

        expect(gptAudioWasCalled).toBe(true)
        expect(voiceChangerWasCalled).toBe(true)
        validateAudioResponse(response, false)
      })

      test('for GPT dialect; if GPT call fails fall back to elevenlabs; use voice changer', async () => {
        let voiceChangerWasCalled = false
        let gptAudioWasCalled = false
        let elevenlabsAudioTextWasCalled = false

        const mockOpenaiApi: OpenaiApi = {
          ...MockOpenaiApi,
          generateAudioWithGptAudio: async (text, voiceId) => {
            gptAudioWasCalled = true
            expect(voiceId).toBe(GptAudioVoice.ASH)
            return null
          },
        }

        const mockElevenlabsApi: ElevenlabsApi = {
          ...MockElevenlabsApi,
          generateAudioTextWithAlignmentData: async (text, voiceId) => {
            elevenlabsAudioTextWasCalled = true
            expect(voiceId).toBe(COLOMBIAN_SPANISH)
            return {
              generatedAudioData: new Uint8Array([1, 2, 3]),
              alignmentData: {
                chars: ['T', 'e', 's', 't'],
                charStartTimesMs: [0, 100, 200, 300],
                charDurationsMs: [100, 100, 100, 100],
              },
            }
          },
          generateAudioWithVoiceChanger: async () => {
            voiceChangerWasCalled = true
            return {
              generatedAudioData: new Uint8Array([4, 5, 6]),
            }
          },
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            openaiApi: mockOpenaiApi,
            elevenlabsApi: mockElevenlabsApi,
          },
        })

        const response = await generateAudioText(
          testApp,
          token,
          'Test sentence',
          LangCode.SPANISH,
          DialectCode.COLOMBIAN_SPANISH,
          voiceOption
        )

        expect(gptAudioWasCalled).toBe(true)
        expect(elevenlabsAudioTextWasCalled).toBe(true)
        expect(voiceChangerWasCalled).toBe(true)
        validateAudioResponse(response, false)
      })

      test('for non GPT dialect without a predefined elevenlabs_voide_id; do NOT use voice changer', async () => {
        let gptAudioWasCalled = false
        let voiceChangerWasCalled = false

        const mockOpenaiApi: OpenaiApi = {
          ...MockOpenaiApi,
          generateAudioWithGptAudio: async () => {
            gptAudioWasCalled = true
            return null
          },
        }

        const mockElevenlabsApi: ElevenlabsApi = {
          ...MockElevenlabsApi,
          generateAudioTextWithAlignmentData: async () => ({
            generatedAudioData: new Uint8Array([1, 2, 3]),
            alignmentData: {
              chars: ['T', 'e', 's', 't'],
              charStartTimesMs: [0, 100, 200, 300],
              charDurationsMs: [100, 100, 100, 100],
            },
          }),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          generateAudioWithVoiceChanger: async (audioBase64: string, voiceId: string) => {
            voiceChangerWasCalled = true
            return {
              generatedAudioData: new Uint8Array([4, 5, 6]),
            }
          },
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            openaiApi: mockOpenaiApi,
            elevenlabsApi: mockElevenlabsApi,
          },
        })

        const response = await generateAudioText(
          testApp,
          token,
          'Test sentence',
          LangCode.INDONESIAN,
          DialectCode.STANDARD_INDONESIAN,
          voiceOption
        )

        expect(response.status).toBe(200)
        expect(gptAudioWasCalled).toBe(false)
        expect(voiceChangerWasCalled).toBe(false)
        validateAudioResponse(response, true)
      })
      test('for non GPT dialect with a predefined elevenlabs_voide_id; use voice changer', async () => {
        let gptAudioWasCalled = false
        let voiceChangerWasCalled = false

        const mockOpenaiApi: OpenaiApi = {
          ...MockOpenaiApi,
          generateAudioWithGptAudio: async () => {
            gptAudioWasCalled = true
            return null
          },
        }

        const mockElevenlabsApi: ElevenlabsApi = {
          ...MockElevenlabsApi,
          generateAudioTextWithAlignmentData: async () => ({
            generatedAudioData: new Uint8Array([1, 2, 3]),
            alignmentData: {
              chars: ['T', 'e', 's', 't'],
              charStartTimesMs: [0, 100, 200, 300],
              charDurationsMs: [100, 100, 100, 100],
            },
          }),
          generateAudioWithVoiceChanger: async () => {
            voiceChangerWasCalled = true
            return {
              generatedAudioData: new Uint8Array([4, 5, 6]),
            }
          },
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            openaiApi: mockOpenaiApi,
            elevenlabsApi: mockElevenlabsApi,
          },
        })

        const response = await generateAudioText(
          testApp,
          token,
          'Test sentence',
          LangCode.SPANISH,
          DialectCode.ANDALUSIAN_SPANISH,
          voiceOption
        )

        expect(response.status).toBe(200)
        expect(gptAudioWasCalled).toBe(false)
        expect(voiceChangerWasCalled).toBe(true)
        validateAudioResponse(response, true)
      })
    })

    describe('with custom voice like Nami, Sime...', () => {
      test('for GPT dialect; use GPT with mapped voice; do NOT use voice changer', async () => {
        let voiceChangerWasCalled = false
        let gptAudioWasCalled = false
        let usedGptAudioVoice: string | null = null

        const mockOpenaiApi: OpenaiApi = {
          ...MockOpenaiApi,

          generateAudioWithGptAudio: async (text, voiceId) => {
            gptAudioWasCalled = true
            usedGptAudioVoice = voiceId
            return {
              generatedAudioData: new Uint8Array([1, 2, 3]),
            }
          },
        }

        const mockElevenlabsApi: ElevenlabsApi = {
          ...MockElevenlabsApi,
          generateAudioWithVoiceChanger: async () => {
            voiceChangerWasCalled = true
            return {
              generatedAudioData: new Uint8Array([4, 5, 6]),
            }
          },
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            openaiApi: mockOpenaiApi,
            elevenlabsApi: mockElevenlabsApi,
          },
        })

        const response = await generateAudioText(
          testApp,
          token,
          'Test sentence',
          LangCode.ENGLISH,
          DialectCode.AMERICAN_ENGLISH,
          CustomVoice.NAMI
        )

        expect(gptAudioWasCalled).toBe(true)
        expect(voiceChangerWasCalled).toBe(false)
        expect(usedGptAudioVoice).toBe(GptAudioVoice.CORAL) // our NAMI voice maps to openai CORAL voice
        validateAudioResponse(response, false)
      })

      test('for GPT dialect; if GPT call fails; fall back to elevenlabs; use voice changer', async () => {
        let voiceChangerWasCalled = false
        let elevenlabsAudioTextWasCalled = false
        let gptAudioWasCalled = false
        let usedGptAudioVoice: string | null = null

        const mockOpenaiApi: OpenaiApi = {
          ...MockOpenaiApi,

          generateAudioWithGptAudio: async (text, voiceId) => {
            gptAudioWasCalled = true
            usedGptAudioVoice = voiceId
            return null
          },
        }

        const mockElevenlabsApi: ElevenlabsApi = {
          ...MockElevenlabsApi,
          generateAudioTextWithAlignmentData: async (text, voiceId) => {
            elevenlabsAudioTextWasCalled = true
            expect(voiceId).toBe(AMERICAN_ENGLISH_MALE_VOICE_ID)
            return {
              generatedAudioData: new Uint8Array([1, 2, 3]),
              alignmentData: {
                chars: ['T', 'e', 's', 't'],
                charStartTimesMs: [0, 100, 200, 300],
                charDurationsMs: [100, 100, 100, 100],
              },
            }
          },
          generateAudioWithVoiceChanger: async (audioBase64: string, voiceId: string) => {
            voiceChangerWasCalled = true
            expect(voiceId).toBe(MARK_NATURAL_CONVERSATIONS_VOICE_ID)
            return {
              generatedAudioData: new Uint8Array([4, 5, 6]),
            }
          },
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            openaiApi: mockOpenaiApi,
            elevenlabsApi: mockElevenlabsApi,
          },
        })

        const response = await generateAudioText(
          testApp,
          token,
          'Test sentence',
          LangCode.ENGLISH,
          DialectCode.AMERICAN_ENGLISH,
          CustomVoice.SIME
        )

        expect(gptAudioWasCalled).toBe(true)
        expect(elevenlabsAudioTextWasCalled).toBe(true)
        expect(voiceChangerWasCalled).toBe(true)
        expect(usedGptAudioVoice).toBe(GptAudioVoice.ECHO) // our NAMI voice maps to openai CORAL voice
        validateAudioResponse(response, true)
      })

      test('for non-GPT dialect, use ElevenLabs with mapped voice; do NOT use voice changer', async () => {
        let elevenlabsWasCalled = false
        let voiceChangerWasCalled = false
        let usedElevenLabsVoiceId: string | null = null

        const mockElevenlabsApi: ElevenlabsApi = {
          ...MockElevenlabsApi,

          generateAudioTextWithAlignmentData: async (text, voiceId) => {
            elevenlabsWasCalled = true
            usedElevenLabsVoiceId = voiceId
            return {
              generatedAudioData: new Uint8Array([1, 2, 3]),
              alignmentData: {
                chars: ['T', 'e', 's', 't'],
                charStartTimesMs: [0, 100, 200, 300],
                charDurationsMs: [100, 100, 100, 100],
              },
            }
          },
          generateAudioWithVoiceChanger: async () => {
            voiceChangerWasCalled = true
            return {
              generatedAudioData: new Uint8Array([4, 5, 6]),
            }
          },
        }

        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
          appDependencies: {
            elevenlabsApi: mockElevenlabsApi,
          },
          referral: null,
        })

        const response = await generateAudioText(
          testApp,
          token,
          'Test sentence',
          LangCode.INDONESIAN,
          DialectCode.STANDARD_INDONESIAN,
          CustomVoice.SIME
        )

        expect(elevenlabsWasCalled).toBe(true)
        expect(voiceChangerWasCalled).toBe(false)
        expect(usedElevenLabsVoiceId).toBe(MARK_NATURAL_CONVERSATIONS_VOICE_ID) // Sime maps to Mark
        validateAudioResponse(response, true)
      })
    })
  })

  describe('generateAudioWord', () => {
    test('should successfully generate audio for a dialect', async () => {
      let voiceChangerWasCalled = false
      let generateAudioWordWasCalled = false
      const mockElevenlabsApi: ElevenlabsApi = {
        ...MockElevenlabsApi,
        generateAudioWord: async (word, voiceId, language, dialect) => {
          expect(word).toBe('hello')
          expect(voiceId).toBeTruthy()
          expect(language).toBe(LangCode.SPANISH)
          expect(dialect).toBe(DialectCode.COLOMBIAN_SPANISH)
          generateAudioWordWasCalled = true
          return new Uint8Array([1, 2, 3])
        },
        generateAudioWithVoiceChanger: async (audioBase64, voiceId) => {
          expect(audioBase64).toBeTruthy()
          expect(voiceId).toBeTruthy()
          voiceChangerWasCalled = true
          return {
            generatedAudioData: new Uint8Array([4, 5, 6]),
          }
        },
      }

      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: mockElevenlabsApi,
        },
      })

      const response = await generateAudioWord(testApp, token, 'hello', LangCode.SPANISH, DialectCode.COLOMBIAN_SPANISH)

      expect(response.status).toBe(200)
      expect(generateAudioWordWasCalled).toBe(true)
      expect(voiceChangerWasCalled).toBe(true)
      expect(response.body.data.audio).toBeDefined()
      expect(response.body.data.audio).toMatch(/^[a-zA-Z0-9+/]+={0,2}$/)
    })

    test('for should successfully generate audio for a language without dialects, it should not call voice changer', async () => {
      let voiceChangerWasCalled = false
      let generateAudioWordWasCalled = false

      const mockElevenlabsApi: ElevenlabsApi = {
        ...MockElevenlabsApi,
        generateAudioWord: async (word, voiceId, language, dialect) => {
          generateAudioWordWasCalled = true
          expect(word).toBe('hello')
          expect(voiceId).toBeTruthy()
          expect(language).toBe(LangCode.INDONESIAN)
          expect(dialect).toBe(DialectCode.STANDARD_INDONESIAN)
          return new Uint8Array([1, 2, 3])
        },
        generateAudioWithVoiceChanger: async () => {
          voiceChangerWasCalled = true
          return {
            generatedAudioData: new Uint8Array([4, 5, 6]),
          }
        },
      }

      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: mockElevenlabsApi,
        },
      })

      const response = await generateAudioWord(
        testApp,
        token,
        'hello',
        LangCode.INDONESIAN,
        DialectCode.STANDARD_INDONESIAN
      )

      expect(response.status).toBe(200)
      expect(generateAudioWordWasCalled).toBe(true)
      expect(voiceChangerWasCalled).toBe(false)
      expect(response.body.data.audio).toBeDefined()
      expect(response.body.data.audio).toMatch(/^[a-zA-Z0-9+/]+={0,2}$/)
    })

    test('for American English when using custom voice, should not call voice changer, as all our custom voices are kinda American English native', async () => {
      let voiceChangerWasCalled = false
      let generateAudioWordWasCalled = false

      const mockElevenlabsApi: ElevenlabsApi = {
        ...MockElevenlabsApi,
        generateAudioWord: async (word, voiceId, language, dialect) => {
          generateAudioWordWasCalled = true
          expect(word).toBe('hello')
          expect(voiceId).toBeTruthy()
          expect(language).toBe(LangCode.ENGLISH)
          expect(dialect).toBe(DialectCode.AMERICAN_ENGLISH)
          return new Uint8Array([1, 2, 3])
        },
        generateAudioWithVoiceChanger: async () => {
          voiceChangerWasCalled = true
          return {
            generatedAudioData: new Uint8Array([4, 5, 6]),
          }
        },
      }

      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: mockElevenlabsApi,
        },
      })

      const response = await generateAudioWord(testApp, token, 'hello', LangCode.ENGLISH, DialectCode.AMERICAN_ENGLISH)

      expect(response.status).toBe(200)
      expect(generateAudioWordWasCalled).toBe(true)
      expect(voiceChangerWasCalled).toBe(false)
      expect(response.body.data.audio).toBeDefined()
      expect(response.body.data.audio).toMatch(/^[a-zA-Z0-9+/]+={0,2}$/)
    })

    test('should return 500 when audio generation fails', async () => {
      const elevenlabsApi: ElevenlabsApi = {
        ...MockElevenlabsApi,
        generateAudioWord: async () => null,
      }

      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({
        appDependencies: {
          elevenlabsApi: elevenlabsApi,
        },
      })

      const response = await generateAudioWord(testApp, token, 'hello', LangCode.ENGLISH, DialectCode.AMERICAN_ENGLISH)

      expect(response.status).toBe(500)
      expect(response.body.data.errors[0].code).toBeDefined()
    })

    test('should return 400 when word contains emojis', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const response = await generateAudioWord(
        testApp,
        token,
        'hello😀',
        LangCode.ENGLISH,
        DialectCode.AMERICAN_ENGLISH
      )

      expect(response.status).toBe(400)
    })
  })
})
