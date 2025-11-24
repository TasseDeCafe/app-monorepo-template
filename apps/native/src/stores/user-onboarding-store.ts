import { create } from 'zustand'
import { LangCode, SupportedStudyLanguage, DialectCode } from '@yourbestaccent/core/constants/lang-codes'
import { Topic } from '@yourbestaccent/core/constants/topics'

// todo onboarding: try to remove this store completely and use react query instead
// Note that we used to use react query here, but our onboarding flow was buggy, for instance:
// if a step X < N was missing we forced the user to go through all onboarding steps again: X, X+1, X+2, ..., N
// which would result in a fatal error once the user tried to clone his voice again
//
// In the ideal world we would not need this store, but Kamil had lots of problems with making onboarding flow work with react query
// React query has more states too handle, not only the data, but also all isFetching, isPending, isError states
// to avoid that Kamil came up with a convention:
// 1. you can use this state only if you're absolutely sure that initializeOnboardingStore was called
// 2. we should not use this store outside of the onboarding flow, instead we should keep using react query
type UserOnboardingStore = {
  initializeOnboardingStore: (data: {
    motherLanguage?: LangCode | null
    studyLanguage?: SupportedStudyLanguage | null
    dialect?: DialectCode | null
    hasVoice?: boolean
    topics?: Topic[]
    dailyStudyMinutes?: number | null
  }) => void
  motherLanguage: LangCode | null
  setMotherLanguage: (language: LangCode | null) => void
  studyLanguage: SupportedStudyLanguage | null
  setStudyLanguage: (language: SupportedStudyLanguage | null) => void
  dialect: DialectCode | null
  setDialect: (dialect: DialectCode | null) => void
  hasVoice: boolean
  setHasVoice: (hasVoice: boolean) => void
  topics: Topic[]
  setTopics: (topics: Topic[]) => void
  dailyStudyMinutes: number | null
  setDailyStudyMinutes: (minutes: number | null) => void
  // users are allowed to skip the topics onboarding step
  hasJustSelectedTopics: boolean
  setHasJustSelectedTopics: (hasJustSelected: boolean) => void
  // we do not store it in the database, instead we store it temporarily in the client state, and once the user cloned their voice
  // we assume that he gave us this consent
  hasJustAcceptedTerms: boolean
  setHasJustAcceptedTerms: (hasJustAccepted: boolean) => void
  // this one is useful for showing the success screen, note that we show it to the user only right after a successful voice cloning
  // which for most of the users should happen only once
  hasJustClonedVoice: boolean
  setHasJustClonedVoice: (hasJustCloned: boolean) => void
}

export const useUserOnboardingStore = create<UserOnboardingStore>((set) => ({
  motherLanguage: null,
  setMotherLanguage: (language) => set({ motherLanguage: language }),
  studyLanguage: null,
  setStudyLanguage: (language) => set({ studyLanguage: language }),
  dialect: null,
  setDialect: (dialect) => set({ dialect: dialect }),
  hasVoice: false,
  setHasVoice: (hasVoice) => set({ hasVoice: hasVoice }),
  topics: [],
  setTopics: (topics) => set({ topics: topics }),
  dailyStudyMinutes: null,
  setDailyStudyMinutes: (minutes) => set({ dailyStudyMinutes: minutes }),
  hasJustAcceptedTerms: false,
  setHasJustAcceptedTerms: (hasJustAccepted) => set({ hasJustAcceptedTerms: hasJustAccepted }),
  hasJustSelectedTopics: false,
  setHasJustSelectedTopics: (hasJustSelected) => set({ hasJustSelectedTopics: hasJustSelected }),
  hasJustClonedVoice: false,
  setHasJustClonedVoice: (hasJustCloned) => set({ hasJustClonedVoice: hasJustCloned }),

  initializeOnboardingStore: (data) =>
    set((state) => ({
      ...state,
      motherLanguage: data.motherLanguage !== undefined ? data.motherLanguage : state.motherLanguage,
      studyLanguage: data.studyLanguage !== undefined ? data.studyLanguage : state.studyLanguage,
      dialect: data.dialect !== undefined ? data.dialect : state.dialect,
      hasVoice: data.hasVoice !== undefined ? data.hasVoice : state.hasVoice,
      topics: data.topics !== undefined ? data.topics : state.topics,
      dailyStudyMinutes: data.dailyStudyMinutes !== undefined ? data.dailyStudyMinutes : state.dailyStudyMinutes,
    })),
}))
