import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Card } from '@/components/ui/card'
import { TitleWithGradient } from '@/components/ui/title-with-gradient'
import { Button } from '@/components/ui/button'
import { LinearGradient } from 'expo-linear-gradient'
import colors from 'tailwindcss/colors'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { supabaseClient } from '@/transport/third-party/supabase/supabase-client'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events'
import { useLingui } from '@lingui/react/macro'

export default function VerifyMagicLink() {
  const { t } = useLingui()

  const { token_hash } = useLocalSearchParams()
  const [isError, setIsError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const router = useRouter()

  const verifyMagicLinkOtp = useCallback(async (tokenHash: string): Promise<boolean> => {
    try {
      const { error } = await supabaseClient.auth.verifyOtp({
        type: 'magiclink',
        token_hash: tokenHash,
      })

      if (error) {
        POSTHOG_EVENTS.magicLinkFailureOrExpiration()
        return false
      }
      return true
    } catch {
      POSTHOG_EVENTS.magicLinkFailureOrExpiration()
      return false
    }
  }, [])

  useEffect(() => {
    const verifyToken = async () => {
      if (token_hash) {
        setIsVerifying(true)
        const wasSuccessful = await verifyMagicLinkOtp(token_hash as string)
        if (!wasSuccessful) {
          setIsError(true)
        }
        setIsVerifying(false)
      }
    }

    verifyToken().then()
  }, [token_hash, verifyMagicLinkOtp])

  const handleReturnToSignIn = () => {
    router.replace(ROUTE_PATHS.SIGN_IN)
  }

  return (
    <LinearGradient
      colors={[colors.indigo[600], colors.purple[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        paddingHorizontal: 16,
      }}
    >
      <View className='flex-1 items-center justify-center'>
        <Card className='w-full max-w-md p-6'>
          <View className='items-center'>
            <View className='mb-8 text-center'>
              <TitleWithGradient>
                {isError ? t`Email link is invalid or has expired` : t`Verify Your Email`}
              </TitleWithGradient>
            </View>

            {isVerifying ? (
              <View className='items-center py-4'>
                <ActivityIndicator size='large' color='#4f46e5' />
                <Text className='mt-4 text-center text-lg text-gray-600'>{t`Verifying...`}</Text>
              </View>
            ) : isError ? (
              <View className='w-full items-center'>
                <Button onPress={handleReturnToSignIn} className='mt-4 h-16 w-full'>
                  <View className='w-full flex-row items-center justify-center'>
                    <Text className='text-center text-2xl font-medium text-white'>{t`Return to Sign In`}</Text>
                  </View>
                </Button>
              </View>
            ) : (
              <View className='items-center'>
                <Text className='text-center text-lg text-gray-600'>{t`Verification successful! Redirecting...`}</Text>
              </View>
            )}
          </View>
        </Card>
      </View>
    </LinearGradient>
  )
}
