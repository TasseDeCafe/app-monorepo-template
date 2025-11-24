import { View, Text, ActivityIndicator } from 'react-native'

type LoadingScreenProps = {
  message?: string
}

export const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps) => {
  return (
    <View className='flex-1 items-center justify-center bg-slate-800'>
      <ActivityIndicator size='large' color='#ffffff' />
      <Text className='mt-4 text-white'>{message}</Text>
    </View>
  )
}
