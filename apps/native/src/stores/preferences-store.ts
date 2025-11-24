import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

type PreferencesStore = {
  shouldShowIpa: boolean
  shouldShowTransliteration: boolean
  setShouldShowIpa: (value: boolean) => void
  setShouldShowTransliteration: (value: boolean) => void
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      shouldShowIpa: false,
      shouldShowTransliteration: false,

      setShouldShowIpa: (value: boolean) => {
        set({ shouldShowIpa: value })
      },

      setShouldShowTransliteration: (value: boolean) => {
        set({ shouldShowTransliteration: value })
      },
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
