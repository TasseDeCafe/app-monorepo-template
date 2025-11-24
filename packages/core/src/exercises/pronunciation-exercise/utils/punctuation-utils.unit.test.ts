import { describe, expect, test } from 'vitest'
import { isPunctuationChar, removePunctuationFromBeginningAndEnd } from '../../../utils/text-utils'

describe('punctuation utils', () => {
  describe('removePunctuationFromBeginningAndEnd', () => {
    test('1', () => {
      const result = removePunctuationFromBeginningAndEnd("¿!The argument, the fight, and the pain! You'd never now.")
      expect(result).toEqual("The argument, the fight, and the pain! You'd never now")
    })
    test('2', () => {
      const result = removePunctuationFromBeginningAndEnd('«sub-optimal»')
      expect(result).toEqual('sub-optimal')
    })
    test('3', () => {
      const result = removePunctuationFromBeginningAndEnd('¿áè?')
      expect(result).toEqual('áè')
    })
    test('1', () => {
      const result = removePunctuationFromBeginningAndEnd('-York')
      expect(result).toEqual('York')
    })
  })
  describe('isPunctuationChar', () => {
    test('-', () => {
      expect(isPunctuationChar('.')).toEqual(true)
    })
  })
})
