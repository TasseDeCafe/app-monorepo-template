// src/__tests__/voiceIdConverter.test.ts

import { describe, it, expect } from 'vitest'
import { convertUuidToElevenlabsVoiceId } from './mock-clone-voice.utils'

describe('ElevenLabs Voice ID Converter', () => {
  describe('convertUuidToElevenlabsVoiceId', () => {
    it('should convert a valid UUID to voice ID format', () => {
      const uuid = 'cbf33671-df73-4683-ae37-d60eacd9cc6e'
      const expected = 'y_M2cd9zRoOuN9YOrNnMbg'
      const result = convertUuidToElevenlabsVoiceId(uuid)
      expect(result).toBe(expected)
    })

    it('should handle different UUID patterns correctly', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      const expected = 'Ej5FZ-ibEtOkVkJmFBdAAA'
      const result = convertUuidToElevenlabsVoiceId(uuid)
      expect(result).toBe(expected)
    })

    it('should throw error for invalid UUID format', () => {
      const invalidUuids = [
        'invalid-uuid',
        '123',
        'cbf33671-df73-4683-ae37', // incomplete
        'gggggggg-df73-4683-ae37-d60eacd9cc6e', // invalid characters
      ]

      invalidUuids.forEach((uuid) => {
        expect(() => convertUuidToElevenlabsVoiceId(uuid)).toThrow('Invalid UUID format')
      })
    })
  })
})
