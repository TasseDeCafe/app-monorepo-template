import { Text, View, Linking } from 'react-native'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react-native'
import { useLocalSearchParams } from 'expo-router'
import { useLingui } from '@lingui/react/macro'

export default function EmailVerificationSent() {
  const { t } = useLingui()

  const { email } = useLocalSearchParams<{ email: string }>()

  const openMailApp = () => {
    Linking.openURL('message:')
  }

  return (
    <View className='flex-1 items-center justify-center'>
      <Card className='w-full max-w-md p-6'>
        <View className='items-center'>
          <View className='rounded-full bg-indigo-100 p-3'>
            <Mail size={24} color='#4f46e5' />
          </View>
          <View className='m-8'>
            <Text className='text-center text-4xl font-bold leading-tight'>{t`Email Verification Sent`}</Text>
          </View>
          <View className='gap-4 text-center'>
            <Text className='text-center text-xl text-gray-600'>{t`We've sent a verification email to:`}</Text>
            <Text className='text-center text-xl font-bold text-gray-600'>{email}</Text>
            <Text className='text-center text-xl text-gray-600'>
              {t`Please check your inbox and click on the link to continue`}
            </Text>
            <Button onPress={openMailApp} className='mt-4 h-16'>
              <Text className='text-2xl font-medium text-white'>{t`Open Mail App`}</Text>
            </Button>
          </View>
        </View>
      </Card>
    </View>
  )
}
