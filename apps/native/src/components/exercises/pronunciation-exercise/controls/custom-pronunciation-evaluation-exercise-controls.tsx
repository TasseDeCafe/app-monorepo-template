import { View } from 'react-native'
import { ExpectedTextTranslationButton } from './atoms/expected-text-translation-button'

export const CustomPronunciationEvaluationExerciseControls = () => {
  return (
    <View className='justify-left flex-row items-center px-4 py-2'>
      <ExpectedTextTranslationButton />
    </View>
  )
}
