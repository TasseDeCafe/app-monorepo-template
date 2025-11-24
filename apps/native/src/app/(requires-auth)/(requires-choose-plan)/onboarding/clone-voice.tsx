import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { ArrowLeft } from 'lucide-react-native'
import {
  LANG_TO_TEXT_FOR_CLONING,
  MIN_LENGTH_OF_AUDIO_FOR_CLONING_IN_SECONDS,
} from '@template-app/core/constants/voice-cloning-constants'
import { AudioRecorder } from '@/components/audio-recorder'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { cn } from '@template-app/core/utils/tailwind-utils'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'
import { LinearGradient } from 'expo-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'
import { usePatchUser } from '@/hooks/api/user/user-hooks'
import * as Haptics from 'expo-haptics'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import {
  useOnboardingNavigationCleanup,
  useRedirectToNextOnboardingStep,
} from '@/hooks/use-onboarding-navigation-cleanup'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import * as FileSystem from 'expo-file-system/legacy'
import { ORPCError } from '@orpc/client'
import { AUDIO_TOO_SHORT_MESSAGE } from '@template-app/api-client/orpc-contracts/user-contract'
import type { BackendErrorResponse } from '@template-app/api-client/orpc-contracts/common/error-response-schema'
import { useLingui } from '@lingui/react/macro'

export default function CloneVoiceView() {
  const { t } = useLingui()

  const navigation = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  const motherLanguage = useUserOnboardingStore((state) => state.motherLanguage)
  const setHasJustClonedVoice = useUserOnboardingStore((state) => state.setHasJustClonedVoice)
  const setHasVoice = useUserOnboardingStore((state) => state.setHasVoice)
  const setHasJustAcceptedTerms = useUserOnboardingStore((state) => state.setHasJustAcceptedTerms)

  const { isRecording, toggleRecording, audioUri, isPermissionLoading, resetRecording } = useAudioRecorder()
  const { mutate: patchUser, isPending: isPatchUserPending } = usePatchUser({
    onSuccess: () => {
      setHasVoice(true)
      setHasJustClonedVoice(true)
    },
    onError: (error) => {
      if (error instanceof ORPCError && error.code === 'AUDIO_VALIDATION_ERROR') {
        const backendErrors = (error.data as BackendErrorResponse | undefined)?.errors ?? []

        if (backendErrors.some(({ message }) => message === AUDIO_TOO_SHORT_MESSAGE)) {
          Alert.alert(
            'Hey!',
            t`Your audio is too short, it has to be at least ${MIN_LENGTH_OF_AUDIO_FOR_CLONING_IN_SECONDS} second(s) long. Please record your voice again.`,
            [{ text: 'OK' }]
          )
          return
        }
      }

      Alert.alert(t`Error`, t`There was a problem cloning your voice. Please try again.`, [{ text: 'OK' }])
    },
    meta: {
      showErrorToast: false,
    },
  })

  useOnboardingNavigationCleanup(() => {
    setHasJustAcceptedTerms(false)
  }, [setHasJustAcceptedTerms])

  useRedirectToNextOnboardingStep()

  useEffect(() => {
    setCanGoBack(navigation.canGoBack())
  }, [navigation])

  useEffect(() => {
    if (audioUri && !isRecording && motherLanguage) {
      const submitVoiceCloning = async () => {
        try {
          // Read the file content using Expo FileSystem
          const base64 = await FileSystem.readAsStringAsync(audioUri, {
            encoding: 'base64',
          })

          patchUser({
            audio: {
              // React Native lacks Blob/File support, so send base64 payload instead
              base64,
              mimeType: 'audio/m4a',
              name: 'recording.m4a',
            },
            langCode: motherLanguage,
          })
        } catch (error) {
          logWithSentry('Failed to read audio file for voice cloning', error)
          Alert.alert(t`Error`, t`There was a problem cloning your voice. Please try again.`, [{ text: 'OK' }])
        }
      }

      submitVoiceCloning()
    }
  }, [audioUri, isRecording, motherLanguage, patchUser, navigation, setHasJustClonedVoice, setHasVoice, t])

  const textForCloning = motherLanguage ? LANG_TO_TEXT_FOR_CLONING[motherLanguage] : ''

  const handleRecordPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).then()
    await toggleRecording()
  }

  const handleBack = () => {
    POSTHOG_EVENTS.click('go_back')
    navigation.back()
  }

  // This effect will run when the screen loses focus
  // This is necessary to avoid re-triggering the voice cloning,
  // because this screen stays mounted
  // https://docs.expo.dev/versions/latest/sdk/router/#usefocuseffecteffect-do_not_pass_a_second_prop
  useFocusEffect(
    useCallback(() => {
      // Return cleanup function that runs when screen goes out of focus
      return () => {
        // Reset audio state when navigating away from this screen
        resetRecording().then()
      }
    }, [resetRecording])
  )

  if (isPatchUserPending) {
    return (
      <OnboardingLayout>
        <View className='flex-1 justify-center px-4'>
          <View className='items-center justify-center'>
            <Text className='mb-5 text-center text-2xl font-bold'>{t`Cloning your voice...`}</Text>
            <ActivityIndicator size='large' color='#4F46E5' />
          </View>
        </View>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout>
      {/* Header with Back button */}
      <View className='flex-row justify-between p-4'>
        {canGoBack && (
          <TouchableOpacity onPress={handleBack} disabled={isPatchUserPending || isRecording}>
            <ArrowLeft size={24} color='#6B7280' />
          </TouchableOpacity>
        )}
        <View />
      </View>
      <View className='flex-1 px-2'>
        <Text className='text-center text-3xl font-bold text-stone-900'>
          {t`Push the record button and`} {t`record the text slowly:`}
        </Text>
        <View className='mb-6 mt-4'>
          <Text className={cn('text-center text-gray-500', isRecording ? 'opacity-0' : 'opacity-100')}>
            {t`For best results, please record in a quiet environment.`}
          </Text>
        </View>

        <View className='items-center'>
          <AudioRecorder
            isRecording={isRecording}
            disabled={isPatchUserPending || isPermissionLoading}
            onRecordPress={handleRecordPress}
          />
        </View>

        <View className='flex-1'>
          {Platform.OS === 'ios' ? (
            <View className='flex-1'>
              <MaskedView
                style={{ flex: 1 }}
                maskElement={
                  <LinearGradient
                    style={{ flex: 1 }}
                    colors={['white', 'white', 'transparent']}
                    locations={[0, 0.85, 1]}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                  />
                }
              >
                <ScrollView
                  className='flex-1'
                  contentContainerStyle={{ paddingVertical: 20 }}
                  showsVerticalScrollIndicator={true}
                  indicatorStyle='black'
                >
                  <Text className='px-4 text-center text-2xl'>{textForCloning}</Text>
                </ScrollView>
              </MaskedView>
            </View>
          ) : (
            <ScrollView
              className='flex-1'
              contentContainerStyle={{ paddingVertical: 20 }}
              showsVerticalScrollIndicator={true}
              indicatorStyle='black'
              persistentScrollbar={true}
            >
              <Text className='px-4 text-center text-2xl'>{textForCloning}</Text>
            </ScrollView>
          )}

          {/* Visual indicator that content is scrollable */}
          <View className='mt-3 flex-row items-center justify-center'>
            <View className='h-1 w-10 rounded-full bg-gray-300'></View>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  )
}
