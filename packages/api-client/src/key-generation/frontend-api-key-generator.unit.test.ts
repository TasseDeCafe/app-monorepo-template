import { describe, expect, test } from 'vitest'
import { __generateCurrentFrontendApiKey } from './frontend-api-key-generator'

describe('frontend-api-key-generator', () => {
  test('when falling into the same 60 second windows the api keys are the same', () => {
    const apiKey1 = __generateCurrentFrontendApiKey(60000)
    const apiKey2 = __generateCurrentFrontendApiKey(119999)
    expect(apiKey1).toEqual(apiKey2)
  })

  test('when falling into different 60 second windows the api keys are not the same', () => {
    const apiKey1 = __generateCurrentFrontendApiKey(60000)
    const apiKey2 = __generateCurrentFrontendApiKey(120001)
    expect(apiKey1 === apiKey2).toBeFalsy()
  })
})
