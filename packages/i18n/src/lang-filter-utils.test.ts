import { describe, expect, test } from 'vitest'
import type { I18n } from '@lingui/core'

import { LangCode, SUPPORTED_MOTHER_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import { createMotherLanguageFilter } from './lang-filter-utils'

// Create a mock i18n instance for testing
const mockI18n: I18n = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _: (message: any) => {
    // For message descriptors from langNameMessages, return the English translation
    const messageId = message?.id
    if (messageId) {
      // langNameMessages already contains the English text as the message value
      // We can use the message's string value directly
      return message.message || messageId
    }
    return String(message)
  },
} as I18n

const filterMotherLangsByInput = createMotherLanguageFilter(mockI18n)

describe('mother-lang-filter-utils', () => {
  test('empty input', () => {
    const result = filterMotherLangsByInput('')
    expect(result[0]).toStrictEqual(LangCode.ENGLISH)
    expect(result[1]).toStrictEqual(LangCode.SPANISH)
    expect(result.length).toStrictEqual(SUPPORTED_MOTHER_LANGUAGES.length)
  })

  test('ese', () => {
    expect(filterMotherLangsByInput('ese')).toStrictEqual([
      LangCode.PORTUGUESE,
      LangCode.VIETNAMESE,
      LangCode.CHINESE,
      LangCode.JAPANESE,
    ])
  })

  test('"ong w", like in "zhong wen", which means: "Chinese "', () => {
    expect(filterMotherLangsByInput('ong w')).toStrictEqual([LangCode.CHINESE])
  })

  test('user input should be converted to lower case before filtering', () => {
    expect(filterMotherLangsByInput('ESP')).toStrictEqual([LangCode.SPANISH])
  })
})
