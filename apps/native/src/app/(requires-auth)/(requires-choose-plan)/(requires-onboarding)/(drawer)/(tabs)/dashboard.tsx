import { View } from 'react-native'
import { useTabBarHeight } from '@/hooks/use-tab-bar-height'
import { ExercisesList } from '@/components/ui/exercises-list'
import { ScrollView } from 'react-native-gesture-handler'

export default function PracticeScreen() {
  const tabBarHeight = useTabBarHeight()

  return (
    <View className='flex-1'>
      <ScrollView className='flex-1 px-4 py-2' style={{ paddingBottom: tabBarHeight + 20 }}>
        <ExercisesList />
      </ScrollView>
    </View>
  )
}
