import { Text, View, Linking } from 'react-native'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TitleWithGradient } from '@/components/ui/title-with-gradient'
import { Mail } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'

export default function EmailVerificationSent({ isSignIn = true }: { isSignIn: boolean }) {
  const { t } = useLingui()

  const { email } = useLocalSearchParams<{ email: string }>()

  const openMailApp = () => {
    Linking.openURL('message:')
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
            <View className='rounded-full bg-indigo-100 p-3'>
              <Mail size={24} color='#4f46e5' />
            </View>
            <View className='m-8'>
              <TitleWithGradient>{t`Email Verification Sent`}</TitleWithGradient>
            </View>
            <View className='gap-4 text-center'>
              <Text className='text-center text-xl text-gray-600'>{t`We've sent a verification email to:`}</Text>
              <Text className='text-center text-xl font-bold text-gray-600'>{email}</Text>
              <Text className='text-center text-xl text-gray-600'>
                {t`Please check your inbox and click on the`}{' '}
                {isSignIn ? t`link to sign in` : t`link to complete your sign up`}
              </Text>
              <Button onPress={openMailApp} className='mt-4 h-16'>
                <Text className='text-2xl font-medium text-white'>{t`Open Mail App`}</Text>
              </Button>
            </View>
          </View>
        </Card>
      </View>
    </LinearGradient>
  )
}
