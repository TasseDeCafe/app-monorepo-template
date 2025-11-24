import { create } from 'zustand'
import * as Haptic from 'expo-haptics'
import { Keyboard } from 'react-native'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import { DialectCode, LangCode, SupportedStudyLanguage } from '@template-app/core/constants/lang-codes'
import { Topic } from '@template-app/core/constants/topics'
import { AudioSpeedType } from '@template-app/api-client/orpc-contracts/user-settings-contract'

export interface IndividualSheetProps {
  [IndividualSheetName.DELETE_ACCOUNT]: undefined
  [IndividualSheetName.DELETE_VOICE]: undefined
  [IndividualSheetName.VOICE_REMOVED_SUCCESS]: undefined
  [IndividualSheetName.NICKNAME]: { currentNickname: string }
  [IndividualSheetName.NICKNAME_REQUIRED]: undefined
  [IndividualSheetName.CONTACT_US]: undefined
  [IndividualSheetName.STRESS_EXERCISE_SETTINGS]: undefined
  [IndividualSheetName.STUDY_LANGUAGE_SETTINGS_SELECTOR]: {
    onLanguageSelect: (language: SupportedStudyLanguage) => void
    initialLanguage: SupportedStudyLanguage
  }
  [IndividualSheetName.MOTHER_LANGUAGE_SETTINGS_SELECTOR]: {
    onLanguageSelect: (language: LangCode) => void
    initialLanguage: LangCode
  }
  [IndividualSheetName.CUSTOM_EXERCISE_STUDY_LANGUAGE_SELECTOR]: {
    onLanguageSelect: (language: SupportedStudyLanguage) => void
    initialLanguage: SupportedStudyLanguage
  }
  [IndividualSheetName.DIALECT_SETTINGS_SELECTOR]: {
    onDialectSelect: (dialect: DialectCode) => void
    initialDialect: DialectCode
    studyLanguage: SupportedStudyLanguage
  }
  [IndividualSheetName.TRANSLATION]: undefined
  [IndividualSheetName.FREQUENCY_LIST_TOPIC_SELECTOR]: {
    currentTopic: Topic | null
    onTopicSelect: (topic: Topic | null) => void
  }
  [IndividualSheetName.EXERCISE_LENGTH_SETTINGS]: {
    initialWordCount: number
    onWordCountCommit: (newWordCount: number) => void
  }
  [IndividualSheetName.CEFR_LEVEL_SETTINGS]: {
    initialPosition: number
    onPositionCommit: (newPosition: number) => void
  }
  [IndividualSheetName.DAILY_STUDY_TIME_SETTINGS]: {
    initialMinutes: number | null
    onMinutesChange: (minutes: number) => void
  }
  [IndividualSheetName.SPEED_PICKER]: {
    currentSpeed: number
    onSpeedChange: (speed: string) => void
    audioSpeedType?: AudioSpeedType
  }
  [IndividualSheetName.LEADERBOARD_TIME_PERIOD_SELECTOR]: {
    onTimePeriodSelect: (timePeriod: 'allTime' | 'weekly') => void
    initialTimePeriod: 'allTime' | 'weekly'
  }
  [IndividualSheetName.LEADERBOARD_LANGUAGE_SELECTOR]: {
    onLanguageSelect: (language: SupportedStudyLanguage | undefined) => void
    initialLanguage: LangCode | undefined
  }
}

// Interface for the internal state of the store
interface BottomSheetState {
  // Store refs in a Map for efficient lookup (Sheet Name -> Ref)
  refs: Map<IndividualSheetName, BottomSheetModal | null>
  // Store props passed during 'open' (Sheet Name -> Props)
  props: Map<IndividualSheetName, any>
  // Name of the currently active sheet, if any
  activeSheetName: IndividualSheetName | null
}

// Interface for the store's public API (state + actions)
interface BottomSheetStore extends BottomSheetState {
  /** Close a bottom sheet by its name */
  close: (name: IndividualSheetName) => void
  /** Register a bottom sheet ref */
  register: (name: IndividualSheetName, ref: BottomSheetModal | null) => void
  /** Unregister a bottom sheet ref (e.g., on unmount) */
  unregister: (name: IndividualSheetName) => void
  /** Snap a bottom sheet to a specific index */
  snapToIndex: (name: IndividualSheetName, index: number) => void
  /** Snap a bottom sheet to a specific position */
  snapToPosition: (name: IndividualSheetName, position: string) => void
  /** Open a bottom sheet by its name, optionally passing props */
  open: <T extends IndividualSheetName>(name: T, props?: IndividualSheetProps[T]) => void
  /** Get the props for a specific sheet */
  getProps: <T extends IndividualSheetName>(name: T) => IndividualSheetProps[T] | undefined
  /** Update the props for a specific sheet */
  updateProps: <T extends IndividualSheetName>(
    name: T,
    updater: (currentProps: IndividualSheetProps[T] | undefined) => IndividualSheetProps[T] | undefined
  ) => void
}

export const useBottomSheetStore = create<BottomSheetStore>((set, get) => {
  const initialState: BottomSheetState = {
    refs: new Map(),
    props: new Map(),
    activeSheetName: null,
  }

  const open = <T extends IndividualSheetName>(name: T, sheetProps?: IndividualSheetProps[T]) => {
    const ref = get().refs.get(name)
    if (ref) {
      Keyboard.dismiss()
      Haptic.selectionAsync().then(() => {})
      set((state) => ({
        props: new Map(state.props).set(name, sheetProps),
        activeSheetName: name,
      }))
      ref.present()
    } else {
      console.warn(`[BottomSheetStore] Attempted to open unregistered sheet: ${name}`)
    }
  }

  const close = (name: IndividualSheetName) => {
    const ref = get().refs.get(name)
    if (ref) {
      ref.dismiss()
      if (get().activeSheetName === name) {
        set({ activeSheetName: null })
      }
    }
  }

  const snapToIndex = (name: IndividualSheetName, index: number) => {
    const ref = get().refs.get(name)
    if (ref) {
      ref.snapToIndex(index)
    }
  }

  const snapToPosition = (name: IndividualSheetName, position: string) => {
    const ref = get().refs.get(name)
    if (ref) {
      ref.snapToPosition(position)
    }
  }

  const register = (name: IndividualSheetName, ref: BottomSheetModal | null) => {
    set((state) => ({
      refs: new Map(state.refs).set(name, ref),
    }))
  }

  const unregister = (name: IndividualSheetName) => {
    set((state) => {
      const newRefs = new Map(state.refs)
      newRefs.delete(name)
      return { refs: newRefs }
    })
  }

  const getProps = <T extends IndividualSheetName>(name: T): IndividualSheetProps[T] | undefined => {
    return get().props.get(name) as IndividualSheetProps[T] | undefined
  }

  const updateProps = <T extends IndividualSheetName>(
    name: T,
    updater: (currentProps: IndividualSheetProps[T] | undefined) => IndividualSheetProps[T] | undefined
  ) => {
    set((state) => {
      const currentProps = state.props.get(name) as IndividualSheetProps[T] | undefined
      const nextProps = updater(currentProps)
      const newProps = new Map(state.props)

      if (nextProps === undefined) {
        newProps.delete(name)
      } else {
        newProps.set(name, nextProps)
      }

      return { props: newProps }
    })
  }

  return {
    ...initialState,
    open,
    close,
    snapToIndex,
    snapToPosition,
    register,
    unregister,
    getProps,
    updateProps,
  }
})
