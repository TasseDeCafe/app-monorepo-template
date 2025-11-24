import { describe, expect, it } from 'vitest'
import { _getExtensionFromMimeType } from './get-audio-duration'

describe('get-audio-duration', () => {
  describe('_getExtensionFromMimeType', () => {
    it('should return correct extension for standard audio MIME types', () => {
      expect(_getExtensionFromMimeType('audio/webm')).toBe('.webm')
      expect(_getExtensionFromMimeType('audio/mpeg')).toBe('.mp3')
      expect(_getExtensionFromMimeType('audio/mp3')).toBe('.mp3')
      expect(_getExtensionFromMimeType('audio/ogg')).toBe('.ogg')
      expect(_getExtensionFromMimeType('audio/wav')).toBe('.wav')
      expect(_getExtensionFromMimeType('audio/x-wav')).toBe('.wav')
      expect(_getExtensionFromMimeType('audio/m4a')).toBe('.m4a')
      expect(_getExtensionFromMimeType('audio/mp4')).toBe('.mp4')
      expect(_getExtensionFromMimeType('audio/aac')).toBe('.aac')
    })

    it('should handle MIME types with codec parameters', () => {
      expect(_getExtensionFromMimeType('audio/webm;codecs=opus')).toBe('.webm')
      expect(_getExtensionFromMimeType('audio/webm; codecs=opus')).toBe('.webm')
      expect(_getExtensionFromMimeType('audio/mp4;codecs=mp4a.40.2')).toBe('.mp4')
    })

    it('should be case-insensitive', () => {
      expect(_getExtensionFromMimeType('AUDIO/WEBM')).toBe('.webm')
      expect(_getExtensionFromMimeType('Audio/Mpeg')).toBe('.mp3')
      expect(_getExtensionFromMimeType('AUDIO/OGG')).toBe('.ogg')
    })

    it('should handle MIME types with spaces around codec parameters', () => {
      expect(_getExtensionFromMimeType('audio/webm ; codecs=opus')).toBe('.webm')
      expect(_getExtensionFromMimeType('audio/webm;  codecs=opus  ')).toBe('.webm')
    })

    it('should return empty string for undefined or null MIME type', () => {
      expect(_getExtensionFromMimeType(undefined)).toBe('')
      expect(_getExtensionFromMimeType('')).toBe('')
    })

    it('should return empty string for unknown MIME types', () => {
      expect(_getExtensionFromMimeType('audio/unknown')).toBe('')
      expect(_getExtensionFromMimeType('video/mp4')).toBe('')
      expect(_getExtensionFromMimeType('application/json')).toBe('')
    })

    it('should handle edge cases with multiple semicolons', () => {
      expect(_getExtensionFromMimeType('audio/webm;codecs=opus;other=param')).toBe('.webm')
    })
  })
})
