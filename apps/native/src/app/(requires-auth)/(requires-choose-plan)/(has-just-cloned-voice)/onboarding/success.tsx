import { ScrollView, Text, View } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { OnboardingLayout } from '@/components/ui/onboarding-layout'
import { Button } from '@/components/ui/button'
import { VisibleAudioPlayer } from '@/components/ui/audio-player/visible-audio-player'
import { ONBOARDING_SUCCESS_DEMO_DATA_OBJECTS } from '@yourbestaccent/core/constants/onboarding-success-demo-data-objects'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import { useGenerateAudio } from '@/hooks/api/audio-generation/audio-generation-hooks'
import { BigCard } from '@/components/ui/big-card'
import { useCallback, useEffect, useState } from 'react'
import { useUserOnboardingStore } from '@/stores/user-onboarding-store'
import { PLAYER_TYPE } from '@/components/ui/audio-player/audio-player-types'
import { useAudioPlayerStore } from '@/stores/audio-player-store'
import { useLingui } from '@lingui/react/macro'

export default function SuccessView() {
  const { t } = useLingui()

  const { defaultedUserData: user } = useGetUser()
  const [audioSource, setAudioSource] = useState<string | null>(null)
  const setHasJustClonedVoice = useUserOnboardingStore((state) => state.setHasJustClonedVoice)
  const studyLanguage = user.studyLanguage
  const studyDialect = user.studyDialect
  const pauseAllPlayers = useAudioPlayerStore((state) => state.pauseAllPlayers)

  const demoData = ONBOARDING_SUCCESS_DEMO_DATA_OBJECTS[studyLanguage]

  const { data: audioData, isFetching: isGeneratingAudio } = useGenerateAudio(
    demoData.text,
    studyLanguage,
    studyDialect
  )

  useEffect(() => {
    if (audioData?.audio) {
      setAudioSource(audioData.audio)
    }
  }, [audioData?.audio])

  const handleStartPracticing = () => {
    pauseAllPlayers()
    setHasJustClonedVoice(false)
  }

  useFocusEffect(
    useCallback(() => {
      if (audioData?.audio) {
        setAudioSource(audioData.audio)
      }

      return () => {
        setAudioSource(null)
      }
    }, [audioData?.audio])
  )

  return (
    <OnboardingLayout>
      <View className='flex-1 px-4'>
        <ScrollView
          className='flex-1'
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <View className='flex-1 items-center py-8'>
            <Text className='mb-2 text-center text-4xl font-bold text-stone-900'>{t`Successfully Cloned`}</Text>
            <Text className='mb-8 text-center text-base text-gray-500'>{t`Get familiar with your new voice clone, from now on you can practice with it!`}</Text>

            {/* Demo Card */}
            <BigCard className='p-4'>
              <View className='mb-4'>
                <Text className='mb-1 text-center text-xl font-semibold'>{t`Your Voice Clone`}</Text>
                <Text className='mb-3 text-center text-base text-gray-600'>{t`In your target language`}</Text>
                <Text className='mb-4 text-center text-lg italic text-gray-600'>&ldquo;{demoData.text}&ldquo;</Text>
                <Text className='text-center text-base text-gray-500'>- {demoData.author}</Text>
              </View>

              {/* Audio Player */}
              {isGeneratingAudio || !audioSource ? (
                <View className='h-16 w-full items-center justify-center'>
                  <Skeleton className='mb-2 h-3 w-4/5 rounded-md' />
                  <Skeleton className='h-3 w-3/5 rounded-md' />
                </View>
              ) : (
                <VisibleAudioPlayer
                  audioSource={audioSource}
                  fileName={`your-better-pronunciation-${studyLanguage}`}
                  audioSpeedType='clonePronunciation'
                  playerType={PLAYER_TYPE.USER_CLONED_VOICE_DEMO_ON_ONBOARDING}
                />
              )}
            </BigCard>
          </View>
        </ScrollView>

        {/* Bottom Button */}
        <View className='py-4'>
          <Button
            variant='default'
            size='lg'
            onPress={handleStartPracticing}
            className='bg-indigo-600'
            textClassName='text-xl'
          >
            {t`Start Practicing`}
          </Button>
        </View>
      </View>
    </OnboardingLayout>
  )
}
