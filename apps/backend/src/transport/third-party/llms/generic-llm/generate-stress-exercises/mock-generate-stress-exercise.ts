import { DialectCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import { FrequencyLists } from '../../../../../utils/frequency-list-utils'
import { StressExercise } from './generate-stress-exercise'

export const mockExercises: StressExercise[] = [
  {
    word: 'computer',
    sentence: 'I need to restart my computer before the meeting starts.',
    wordIpa: 'kəmˈpjutər',
    syllables: [{ text: 'com' }, { text: 'pu' }, { text: 'ter' }],
    stressIndex: 1,
  },
  {
    word: 'important',
    sentence: 'It is important to stay focused during the exam.',
    wordIpa: 'ɪmˈpɔrtənt',
    syllables: [{ text: 'im' }, { text: 'por' }, { text: 'tant' }],
    stressIndex: 1,
  },
  {
    word: 'beautiful',
    sentence: 'The sunset created a beautiful view of the mountains.',
    wordIpa: 'ˈbjutəfəl',
    syllables: [{ text: 'beau' }, { text: 'ti' }, { text: 'ful' }],
    stressIndex: 0,
  },
  {
    word: 'developer',
    sentence: 'The developer created an innovative solution for the problem.',
    wordIpa: 'dɪˈvɛləpər',
    syllables: [{ text: 'de' }, { text: 've' }, { text: 'lo' }, { text: 'per' }],
    stressIndex: 1,
  },
  {
    word: 'conversation',
    sentence: 'We had an interesting conversation about artificial intelligence.',
    wordIpa: 'kɒnvərˈseɪʃən',
    syllables: [{ text: 'con' }, { text: 'ver' }, { text: 'sa' }, { text: 'tion' }],
    stressIndex: 2,
  },
]

export const mockGenerateStressExercises = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  position: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  language: SupportedStudyLanguage,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dialect: DialectCode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frequencyLists: FrequencyLists
): Promise<StressExercise[] | null> => mockExercises
