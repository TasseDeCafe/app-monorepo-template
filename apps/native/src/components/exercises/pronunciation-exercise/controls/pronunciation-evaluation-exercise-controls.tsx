import { TouchableOpacity, View } from 'react-native'
import { ExpectedTextTranslationButton } from './atoms/expected-text-translation-button'
import { Settings } from 'lucide-react-native'
import colors from 'tailwindcss/colors'
import { useRouter } from 'expo-router'

export const PronunciationEvaluationExerciseControls = () => {
  const router = useRouter()

  const handleSettingsPress = () => {
    router.push('/settings')
  }
  return (
    <View className='flex-row items-center justify-between px-4 py-2'>
      <View className='flex-1 items-start'>
        <ExpectedTextTranslationButton />
      </View>
      <View className='flex-1 items-end'>
        <TouchableOpacity
          onPress={handleSettingsPress}
          className='flex-row items-center gap-1.5 rounded-md p-2 active:bg-gray-200'
        >
          <Settings size={20} color={colors.gray[500]} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
