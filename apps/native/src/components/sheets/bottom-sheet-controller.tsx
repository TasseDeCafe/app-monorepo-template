import React, { ComponentType, FC, memo, useCallback, useMemo } from 'react'
import { BottomSheetBackdropProps, BottomSheetModal } from '@gorhom/bottom-sheet'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { IndividualSheetName } from './bottom-sheet-ids'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'

import { DeleteAccountSheetContent } from './content/delete-account-sheet-content'
import { DeleteVoiceSheetContent } from './content/delete-voice-sheet-content'
import { VoiceRemovedSuccessSheetContent } from './content/voice-removed-success-sheet-content'
import { NicknameSheetContent } from './content/nickname-sheet-content'
import { ContactUsSheetContent } from './content/contact-us-sheet-content'
import { BottomSheetBackdrop } from '@/components/sheets/bottom-sheet-backdrop'
import { LeaderboardNicknameRequiredSheetContent } from '@/components/sheets/content/leaderboard-nickname-required-sheet-content'
import { StressExerciseSettingsSheetContent } from '@/components/sheets/content/stress-exercise-settings-sheet-content'
import { StudyLanguageSettingsSelectorSheetContent } from '@/components/sheets/content/language-selectors/study-language-settings-selector-sheet-content'
import { MotherLanguageSettingsSelectorSheetContent } from '@/components/sheets/content/language-selectors/mother-language-settings-selector-sheet-content'
import { CustomExerciseStudyLanguageSelectorSheetContent } from '@/components/sheets/content/language-selectors/custom-exercise-language-selector-sheet-content'
import { DialectSettingsSelectorSheetContent } from '@/components/sheets/content/dialect-settings-selector-sheet-content'
import { TopicSelectionSheetContent } from './content/topic-selection-sheet-content'
import { TranslationSheetContent } from './content/translation-sheet-content'
import { ExerciseLengthSettingsSheetContent } from './content/exercise-length-settings-sheet-content'
import { CefrLevelSettingsSheetContent } from './content/cefr-level-settings-sheet-content'
import { DailyStudyTimeSettingsSheetContent } from './content/daily-study-time-settings-sheet-content'
import { SpeedPickerSheetContent } from './content/speed-picker-sheet-content'
import { LeaderboardTimePeriodSelectorSheetContent } from './content/leaderboard/leaderboard-time-period-selector-sheet-content'
import { LeaderboardLanguageSelectorSheetContent } from './content/leaderboard/leaderboard-language-selector-sheet-content'

interface SheetConfig {
  component: ComponentType<any>
  snapPoints?: (string | number)[]
  enableDynamicSizing?: boolean
  enableContentPanningGesture?: boolean
  adjustForKeyboard?: boolean
}

const BOTTOM_SHEET_CONFIG: Record<IndividualSheetName, SheetConfig> = {
  [IndividualSheetName.DELETE_ACCOUNT]: {
    component: DeleteAccountSheetContent,
  },
  [IndividualSheetName.DELETE_VOICE]: {
    component: DeleteVoiceSheetContent,
  },
  [IndividualSheetName.VOICE_REMOVED_SUCCESS]: {
    component: VoiceRemovedSuccessSheetContent,
  },
  [IndividualSheetName.NICKNAME]: {
    component: NicknameSheetContent,
  },
  [IndividualSheetName.NICKNAME_REQUIRED]: {
    component: LeaderboardNicknameRequiredSheetContent,
  },
  [IndividualSheetName.CONTACT_US]: {
    component: ContactUsSheetContent,
    enableContentPanningGesture: false,
  },
  [IndividualSheetName.STRESS_EXERCISE_SETTINGS]: {
    component: StressExerciseSettingsSheetContent,
  },
  [IndividualSheetName.STUDY_LANGUAGE_SETTINGS_SELECTOR]: {
    component: StudyLanguageSettingsSelectorSheetContent,
    snapPoints: ['50%'],
  },
  [IndividualSheetName.MOTHER_LANGUAGE_SETTINGS_SELECTOR]: {
    component: MotherLanguageSettingsSelectorSheetContent,
    snapPoints: ['50%'],
  },
  [IndividualSheetName.CUSTOM_EXERCISE_STUDY_LANGUAGE_SELECTOR]: {
    component: CustomExerciseStudyLanguageSelectorSheetContent,
    snapPoints: ['50%'],
  },
  [IndividualSheetName.DIALECT_SETTINGS_SELECTOR]: {
    component: DialectSettingsSelectorSheetContent,
    snapPoints: ['50%'],
  },
  [IndividualSheetName.FREQUENCY_LIST_TOPIC_SELECTOR]: {
    component: TopicSelectionSheetContent,
    snapPoints: ['80%'],
  },
  [IndividualSheetName.TRANSLATION]: {
    component: TranslationSheetContent,
    snapPoints: ['50%'],
  },
  [IndividualSheetName.EXERCISE_LENGTH_SETTINGS]: {
    component: ExerciseLengthSettingsSheetContent,
  },
  [IndividualSheetName.CEFR_LEVEL_SETTINGS]: {
    component: CefrLevelSettingsSheetContent,
  },
  [IndividualSheetName.DAILY_STUDY_TIME_SETTINGS]: {
    component: DailyStudyTimeSettingsSheetContent,
  },
  [IndividualSheetName.SPEED_PICKER]: {
    component: SpeedPickerSheetContent,
  },
  [IndividualSheetName.LEADERBOARD_TIME_PERIOD_SELECTOR]: {
    component: LeaderboardTimePeriodSelectorSheetContent,
  },
  [IndividualSheetName.LEADERBOARD_LANGUAGE_SELECTOR]: {
    component: LeaderboardLanguageSelectorSheetContent,
    snapPoints: ['50%'],
  },
}

interface SheetInstanceProps {
  name: IndividualSheetName
  config: SheetConfig
  renderBackdrop?: FC<BottomSheetBackdropProps>
}

const SheetInstance = memo(({ name, config, renderBackdrop }: SheetInstanceProps) => {
  const register = useBottomSheetStore((state) => state.register)
  const unregister = useBottomSheetStore((state) => state.unregister)
  const closeSheet = useBottomSheetStore((state) => state.close)
  const snapToIndexSheet = useBottomSheetStore((state) => state.snapToIndex)
  const snapToPositionSheet = useBottomSheetStore((state) => state.snapToPosition)
  const specificProps = useBottomSheetStore(useCallback((state) => state.props.get(name), [name]))
  const insets = useSafeAreaInsets()

  const SheetComponent = config.component

  const refCallback = useCallback(
    (ref: BottomSheetModal | null) => {
      if (ref) {
        register(name, ref)
      } else {
        unregister(name)
      }
    },
    [name, register, unregister]
  )

  const handleDismiss = useCallback(() => {
    closeSheet(name)
  }, [name, closeSheet])

  const modalProps = useMemo(() => {
    const baseProps = {
      name: name.toString(),
      ref: refCallback,
      onDismiss: handleDismiss,
      enablePanDownToClose: true,
      keyboardBehavior: 'interactive' as const,
      keyboardBlurBehavior: 'restore' as const,
      android_keyboardInputMode: 'adjustPan' as const,
      stackBehavior: 'replace' as const,
      enableDynamicSizing: true,
      topInset: insets.top,
    }

    let modalSpecificProps = {}

    if (config.snapPoints) {
      modalSpecificProps = {
        index: 0,
        snapPoints: config.snapPoints,
        enableDynamicSizing: false,
      }
    } else if (config.enableDynamicSizing === false) {
      modalSpecificProps = {
        index: 0,
        snapPoints: ['50%'],
        enableDynamicSizing: false,
      }
    }

    return { ...baseProps, ...modalSpecificProps, backdropComponent: renderBackdrop }
  }, [name, config, refCallback, handleDismiss, renderBackdrop, insets.top])

  const componentProps = useMemo(
    () => ({
      close: () => closeSheet(name),
      snapToIndex: (index: number) => snapToIndexSheet(name, index),
      snapToPosition: (position: string) => snapToPositionSheet(name, position),
      ...(specificProps || {}),
    }),
    [specificProps, name, closeSheet, snapToIndexSheet, snapToPositionSheet]
  )

  if (!SheetComponent) {
    console.error(`[SheetInstance ${name}] SheetComponent is null or undefined!`)
    return null
  }

  return (
    <BottomSheetModal {...modalProps}>
      <SheetComponent {...componentProps} />
    </BottomSheetModal>
  )
})

SheetInstance.displayName = 'SheetInstance'

const BottomSheetControllerComponent = () => {
  return (
    <>
      {Object.keys(BOTTOM_SHEET_CONFIG).map((key) => {
        const name = key as IndividualSheetName
        const config: SheetConfig = BOTTOM_SHEET_CONFIG[name]

        return <SheetInstance key={name} name={name} config={config} renderBackdrop={BottomSheetBackdrop} />
      })}
    </>
  )
}

export const BottomSheetController = memo(BottomSheetControllerComponent)

BottomSheetController.displayName = 'BottomSheetController'
