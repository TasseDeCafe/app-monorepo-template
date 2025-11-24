import { describe, it, expect } from 'vitest'
import { generateQueryString } from './query-params-utils.ts'
import { GetCorrectUserPronunciationsRequest } from '@template-app/api-client/orpc-contracts/words-contract'

describe('generateQueryString', () => {
  it('should generate a query string with all parameters', () => {
    const params: GetCorrectUserPronunciationsRequest = {
      cursor: 'abc123',
      limit: 10,
    }
    const result = generateQueryString(params)
    expect(result).toBe('cursor=abc123&limit=10')
  })

  it('should generate a query string with only cursor', () => {
    const params: GetCorrectUserPronunciationsRequest = {
      cursor: 'def456',
    }
    const result = generateQueryString(params)
    expect(result).toBe('cursor=def456')
  })

  it('should generate a query string with only limit', () => {
    const params: GetCorrectUserPronunciationsRequest = {
      limit: 5,
    }
    const result = generateQueryString(params)
    expect(result).toBe('limit=5')
  })

  it('should return an empty string when no parameters are provided', () => {
    const params: GetCorrectUserPronunciationsRequest = {}
    const result = generateQueryString(params)
    expect(result).toBe('')
  })

  it('should handle undefined values', () => {
    const params: GetCorrectUserPronunciationsRequest = {
      cursor: undefined,
      limit: 20,
    }
    const result = generateQueryString(params)
    expect(result).toBe('limit=20')
  })

  it('should properly encode special characters', () => {
    const params: GetCorrectUserPronunciationsRequest = {
      cursor: 'special&char=value',
    }
    const result = generateQueryString(params)
    expect(result).toBe('cursor=special%26char%3Dvalue')
  })

  it('should handle zero as a valid limit value', () => {
    const params: GetCorrectUserPronunciationsRequest = {
      limit: 0,
    }
    const result = generateQueryString(params)
    expect(result).toBe('limit=0')
  })
})
