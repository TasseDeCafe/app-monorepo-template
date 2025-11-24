import { afterAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import {
  __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding,
  __removeAllAuthUsersFromSupabase,
  buildAuthorizationHeaders,
} from '../../test/test-utils'
import { __deleteAllHandledStripeEvents } from '../../transport/database/webhook-events/handled-stripe-events-repository'
import fs from 'fs'
import path from 'path'

describe('audio-router', async () => {
  beforeEach(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  afterAll(async () => {
    await __removeAllAuthUsersFromSupabase()
    await __deleteAllHandledStripeEvents()
  })

  describe('convert audio', () => {
    const audioFormats = ['mp4', 'webm', 'ogg']

    audioFormats.forEach((format) => {
      test(`converts ${format} to mp3`, async () => {
        const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

        const audioPath = path.join(__dirname, `../../assets/audio/mock-audio-individual-word.${format}`)
        const audioBuffer = fs.readFileSync(audioPath)
        const base64Audio = audioBuffer.toString('base64')

        const response = await request(testApp)
          .post('/api/v1/audio/convert-to-mp3')
          .set(buildAuthorizationHeaders(token))
          .send({
            audio: `data:audio/${format};base64,${base64Audio}`,
            fromFormat: format,
            toFormat: 'mp3',
          })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toHaveProperty('convertedAudio')
        expect(response.body.data).toHaveProperty('format')
        expect(response.body.data.format).toBe('mp3')

        // Check that the converted audio is a non-empty base64 string
        const convertedAudio = response.body.data.convertedAudio
        expect(convertedAudio).toBeTruthy()
        expect(convertedAudio).toMatch(/^[a-zA-Z0-9+/]+={0,2}$/)
        expect(convertedAudio.length).toBeGreaterThan(0)
      })
    })

    test('returns 500 for invalid input', async () => {
      const { token, testApp } = await __createDefaultInitialStateAfterIntroducingCreditCardAndOnboarding({})

      const response = await request(testApp)
        .post('/api/v1/audio/convert-to-mp3')
        .set(buildAuthorizationHeaders(token))
        .send({
          audio: 'invalid-audio-data',
          fromFormat: 'invalid',
          toFormat: 'mp3',
        })

      expect(response.status).toBe(500)
      expect(response.body.data).toHaveProperty('errors')
      expect(response.body.data.errors[0].message).toBe('Error converting audio')
    })
  })
})
