import { Text, TextInput, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TitleWithGradient } from '@/components/ui/title-with-gradient'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner-native'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import colors from 'tailwindcss/colors'
import { ROUTE_PATHS } from '@/constants/route-paths'
import { useLingui } from '@lingui/react/macro'

export default function EmailAuth({ isSignIn = true }: { isSignIn: boolean }) {
  const { t } = useLingui()

  const router = useRouter()
  const [emailInput, setEmailInput] = useState('')
  const [hasEmailError, setHasEmailError] = useState(false)
  const [loading, setLoading] = useState(false)
  const signInWithMagicLink = useAuthStore((state) => state.signInWithMagicLink)

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const handleSignInUp = async () => {
    if (!validateEmail(emailInput)) {
      setHasEmailError(true)
      return
    }

    setLoading(true)
    setHasEmailError(false)

    try {
      const { error } = await signInWithMagicLink(emailInput)
      if (error) {
        toast.error(error.message)
      } else {
        router.push({
          pathname: isSignIn
            ? ROUTE_PATHS.SIGN_UP_EMAIL_VERIFICATION_SENT
            : ROUTE_PATHS.SIGN_IN_EMAIL_VERIFICATION_SENT,
          params: {
            email: emailInput,
          },
        })
      }
    } catch (error) {
      toast.error(t`An unexpected error occurred`)
      logWithSentry('Error sending magic link', error)
    } finally {
      setLoading(false)
    }
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
          <View className='mb-8 text-center'>
            <TitleWithGradient>{isSignIn ? t`Sign in with Email` : t`Sign up with Email`}</TitleWithGradient>
          </View>

          <View className='gap-4'>
            <View className='w-full'>
              <TextInput
                placeholder={t`Email address`}
                placeholderTextColor='gray'
                value={emailInput}
                onChangeText={(text) => {
                  setEmailInput(text)
                  setHasEmailError(false)
                }}
                keyboardType='email-address'
                autoCapitalize='none'
                autoComplete='email'
                autoCorrect={false}
                textAlignVertical='center'
                className='h-16 w-full rounded-xl border border-gray-300 px-3 text-xl'
              />
              {hasEmailError ? (
                <Text className='mt-1 text-base text-red-500'>{t`Please enter a valid email address`}</Text>
              ) : null}
            </View>

            <Button onPress={handleSignInUp} disabled={loading} className='h-16'>
              <Text className='text-2xl font-medium text-white'>
                {loading ? t`Sending an email` : isSignIn ? t`Sign in` : t`Sign up`}
              </Text>
            </Button>

            <View className='flex-row items-center py-4'>
              <View className='h-[1px] flex-1 bg-gray-300' />
              <Text className='mx-4 text-xl text-gray-500'>{t`Or`}</Text>
              <View className='h-[1px] flex-1 bg-gray-300' />
            </View>

            <View className='flex-row justify-center'>
              <Text className='text-lg text-gray-500'>
                {isSignIn ? t`Don't have an account?` : t`Have an account?`}
              </Text>
              <Text
                className='ml-2 text-lg font-medium text-indigo-600'
                onPress={() => router.replace(isSignIn ? ROUTE_PATHS.SIGN_UP_EMAIL : ROUTE_PATHS.SIGN_IN_EMAIL)}
              >
                {isSignIn ? t`Sign up` : t`Sign in`}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </LinearGradient>
  )
}
