import { LOCAL_STORAGE_CONSTANTS } from './local-storage-constants.ts'

export const localStorageWrapper = {
  setReferral: (referral: string | null): void => {
    if (referral) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.REFERRAL, referral)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.REFERRAL)
    }
  },
  getReferral: (): string => {
    const referral: string | null = localStorage.getItem(LOCAL_STORAGE_CONSTANTS.REFERRAL)
    if (!referral) {
      return ''
    }
    return referral
  },
  setShouldShowIpa: (shouldShowIpa: boolean): void => {
    if (shouldShowIpa) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.SHOULD_SHOW_IPA, shouldShowIpa.toString())
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.SHOULD_SHOW_IPA)
    }
  },
  getShouldShowIpa: (): boolean => {
    const shouldShowIpa: string | null = localStorage.getItem(LOCAL_STORAGE_CONSTANTS.SHOULD_SHOW_IPA)
    return !!shouldShowIpa
  },
  setShouldShowTransliteration: (shouldShowIpa: boolean): void => {
    if (shouldShowIpa) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.SHOULD_SHOW_TRANSLITERATION, shouldShowIpa.toString())
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.SHOULD_SHOW_TRANSLITERATION)
    }
  },
  getShouldShowTransliteration: (): boolean => {
    const shouldShowTransliteration: string | null = localStorage.getItem(
      LOCAL_STORAGE_CONSTANTS.SHOULD_SHOW_TRANSLITERATION
    )
    return !!shouldShowTransliteration
  },
  setUtmSource: (utmSource: string | null): void => {
    if (utmSource) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.UTM_SOURCE, utmSource)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.UTM_SOURCE)
    }
  },
  getUtmSource: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_CONSTANTS.UTM_SOURCE)
  },
  setUtmMedium: (utmMedium: string | null): void => {
    if (utmMedium) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.UTM_MEDIUM, utmMedium)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.UTM_MEDIUM)
    }
  },
  getUtmMedium: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_CONSTANTS.UTM_MEDIUM)
  },
  setUtmCampaign: (utmCampaign: string | null): void => {
    if (utmCampaign) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.UTM_CAMPAIGN, utmCampaign)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.UTM_CAMPAIGN)
    }
  },
  getUtmCampaign: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_CONSTANTS.UTM_CAMPAIGN)
  },
  setUtmTerm: (utmTerm: string | null): void => {
    if (utmTerm) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.UTM_TERM, utmTerm)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.UTM_TERM)
    }
  },
  getUtmTerm: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_CONSTANTS.UTM_TERM)
  },
  setUtmContent: (utmContent: string | null): void => {
    if (utmContent) {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.UTM_CONTENT, utmContent)
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CONSTANTS.UTM_CONTENT)
    }
  },
  getUtmContent: (): string | null => {
    return localStorage.getItem(LOCAL_STORAGE_CONSTANTS.UTM_CONTENT)
  },
  getIpaTranscriptionCount: (): number => {
    const count: string | null = localStorage.getItem(LOCAL_STORAGE_CONSTANTS.IPA_TRANSCRIPTION_COUNT)
    return count ? parseInt(count, 10) : 0
  },
  setIpaTranscriptionCount: (count: number): void => {
    localStorage.setItem(LOCAL_STORAGE_CONSTANTS.IPA_TRANSCRIPTION_COUNT, count.toString())
  },
  incrementIpaTranscriptionCount: (): number => {
    const currentCount = localStorageWrapper.getIpaTranscriptionCount()
    const newCount = currentCount + 1
    localStorageWrapper.setIpaTranscriptionCount(newCount)
    return newCount
  },
}
