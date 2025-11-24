import { UserSettings } from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'
import { SUPPORTED_STUDY_LANGUAGES } from '@yourbestaccent/core/constants/lang-codes'
import {
  DEFAULT_AUDIO_SPEED,
  DEFAULT_POSITION_IN_FREQUENCY_LIST,
  DEFAULT_WORD_LENGTH,
} from '@yourbestaccent/api-client/orpc-contracts/user-settings-contract'

export const createDefaultSettings = (): UserSettings => ({
  preferences: {
    exercises: {
      audioSpeed: {
        userPronunciation: DEFAULT_AUDIO_SPEED,
        clonePronunciation: DEFAULT_AUDIO_SPEED,
      },
      frequencyList: {
        exerciseLength: {
          byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
            language: lang,
            length: DEFAULT_WORD_LENGTH,
          })),
        },
        position: {
          byLanguage: SUPPORTED_STUDY_LANGUAGES.map((lang) => ({
            language: lang,
            position: DEFAULT_POSITION_IN_FREQUENCY_LIST,
          })),
        },
      },
    },
  },
})
