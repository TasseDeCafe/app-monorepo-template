import { Platform, Text, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { ArrowRight } from 'lucide-react-native'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'

export const ExerciseItem = ({
  icon: Icon,
  title,
  description,
  isNew = false,
  onPress,
}: {
  icon: any
  title: string
  description: string
  isNew?: boolean
  onPress: () => void
}) => {
  const { t } = useLingui()

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {
        onPress()
      })
    } else {
      onPress()
    }
  }

  return (
    <TouchableOpacity className='h-30 mb-4 flex-row items-center rounded-2xl bg-white p-5' onPress={handlePress}>
      <View className='mr-4 rounded-xl bg-slate-100 p-5'>
        <Icon size={30} color={colors.indigo[500]} />
      </View>
      <View className='flex-1 pr-6'>
        <View className='flex-row items-center'>
          <Text className='text-lg font-medium text-slate-800'>{title}</Text>
          {isNew && (
            <View className='ml-2 rounded-full bg-blue-400 px-3 py-1'>
              <Text className='text-xs font-medium text-white'>{t`New`}</Text>
            </View>
          )}
        </View>
        <Text className='mt-1 text-gray-500'>{description}</Text>
      </View>
      <View className='ml-auto'>
        <ArrowRight size={30} color={colors.slate[300]} />
      </View>
    </TouchableOpacity>
  )
}
