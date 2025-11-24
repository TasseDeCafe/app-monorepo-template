import { describe, it, expect } from 'vitest'
import { isEmoji, isPunctuationChar, isOnlyPunctuationOrEmojiOrWhiteSpace } from './text-utils'

describe('text-utils', () => {
  describe('isEmoji', () => {
    it('should return true for single emoji', () => {
      expect(isEmoji('😀')).toBe(true)
      expect(isEmoji('😊')).toBe(true)
      expect(isEmoji('🎉')).toBe(true)
      expect(isEmoji('💻')).toBe(true)
    })

    it('should return true for multiple emojis', () => {
      expect(isEmoji('😀😀')).toBe(true)
      expect(isEmoji('🎉💻')).toBe(true)
    })

    it('should return false for text', () => {
      expect(isEmoji('hello')).toBe(false)
      expect(isEmoji('a')).toBe(false)
    })

    it('should return false for mixed emoji and text', () => {
      expect(isEmoji('hello😀')).toBe(false)
      expect(isEmoji('😀hello')).toBe(false)
    })
  })

  describe('isPunctuationChar', () => {
    it('should return true for common punctuation', () => {
      expect(isPunctuationChar('.')).toBe(true)
      expect(isPunctuationChar(',')).toBe(true)
      expect(isPunctuationChar('!')).toBe(true)
      expect(isPunctuationChar('?')).toBe(true)
    })

    it('should return true for special punctuation', () => {
      expect(isPunctuationChar('¿')).toBe(true) // Spanish
      expect(isPunctuationChar('¡')).toBe(true) // Spanish
      expect(isPunctuationChar('«')).toBe(true) // French
      expect(isPunctuationChar('»')).toBe(true) // French
      expect(isPunctuationChar('„')).toBe(true) // Polish
    })

    it('should return false for non-punctuation', () => {
      expect(isPunctuationChar('a')).toBe(false)
      expect(isPunctuationChar('1')).toBe(false)
      expect(isPunctuationChar(' ')).toBe(false)
    })
  })

  describe('isOnlyPunctuationOrEmoji', () => {
    it('should return true for emoji', () => {
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('😀')).toBe(true)
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('😀😀')).toBe(true)
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('😊.')).toBe(true)
    })

    it('should return true for emoji 2', () => {
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('😊\n')).toBe(true)
    })
    it('should return true for punctuation', () => {
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('...')).toBe(true)
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('!?')).toBe(true)
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('¿¡')).toBe(true)
    })

    it('should return false for text', () => {
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('hello')).toBe(false)
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('hello!')).toBe(false)
      expect(isOnlyPunctuationOrEmojiOrWhiteSpace('!hello!')).toBe(false)
    })
  })
})
