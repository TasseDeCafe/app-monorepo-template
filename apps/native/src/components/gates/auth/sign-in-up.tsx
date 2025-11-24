import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleIcon } from '@/components/ui/icons/google-icon'
import { TitleWithGradient } from '@/components/ui/title-with-gradient'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import * as AppleAuthentication from 'expo-apple-authentication'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Mail } from 'lucide-react-native'
import { Platform, Text, View } from 'react-native'
import colors from 'tailwindcss/colors'
import { ROUTE_PATHS } from '@/constants/route-paths'
import * as Haptics from 'expo-haptics'
import { useLingui } from '@lingui/react/macro'

export default function SignInUp({ isSignIn }: { isSignIn: boolean }) {
  const { t } = useLingui()

  const router = useRouter()
  const { signInWithGoogle, signInWithApple } = useAuthStore()

  const handleEmailSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).then(() => {})
    router.push(ROUTE_PATHS.SIGN_IN_EMAIL)
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
          <View className='mb-8'>
            <TitleWithGradient>
              {t`Start mastering`}
              {t`your pronunciation`}
            </TitleWithGradient>
          </View>
          <View className='gap-4'>
            <Button
              variant='white'
              size='lg'
              onPress={handleEmailSignIn}
              className='h-16 w-full items-center justify-center bg-white'
              textClassName='text-2xl font-medium h-full'
              startIcon={<Mail size={20} color='#374151' />}
            >
              {isSignIn ? t`Sign in with Email` : t`Sign up with Email`}
            </Button>

            <Button
              variant='default'
              size='lg'
              onPress={signInWithGoogle}
              className='h-16 w-full items-center justify-center bg-indigo-600'
              textClassName='text-2xl font-medium h-full'
              startIcon={<GoogleIcon size={20} color='#ffffff' />}
            >
              {isSignIn ? t`Sign in with Google` : t`Sign up with Google`}
            </Button>

            {Platform.OS === 'ios' && (
              <View className={cn('overflow-hidden rounded-xl')}>
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={
                    isSignIn
                      ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                      : AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                  }
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={{ width: '100%', height: 56 }}
                  onPress={signInWithApple}
                />
              </View>
            )}
          </View>

          <View className='mt-6 items-center'>
            <View className='flex-row items-center'>
              <Text className='text-lg text-gray-500'>
                {isSignIn ? t`Don't have an account?` : t`Have an account?`}
              </Text>
              <Text
                className='ml-2 text-lg font-medium text-indigo-600'
                onPress={() => router.push(isSignIn ? ROUTE_PATHS.SIGN_UP : ROUTE_PATHS.SIGN_IN)}
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
