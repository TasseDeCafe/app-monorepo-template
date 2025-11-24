import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { StreakCard } from '@/components/ui/streak-card'
import { LongestStreakCard } from '@/components/ui/longest-streak-card'
import { WordsGraph } from '@/components/ui/words-graph'
import { useTabBarHeight } from '@/hooks/use-tab-bar-height'
import { useLingui } from '@lingui/react/macro'

export default function ProgressScreen() {
  const { t } = useLingui()

  const tabBarHeight = useTabBarHeight()

  return (
    <View className='flex-1'>
      <ScrollView
        className='flex-1 px-4 py-2'
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        style={{ backgroundColor: 'transparent' }}
      >
        <View className='mt-2 gap-2'>
          <View className='items-left mb-0 mt-3 w-full'>
            <Text className='text-lg font-semibold text-gray-800'>{t`Words Learned Over Time`}</Text>
          </View>
          <WordsGraph />
          <View className='items-left mb-0 mt-3 w-full'>
            <Text className='text-lg font-semibold text-gray-800'>{t`Your Learning Streak`}</Text>
          </View>
          <View className='gap-4'>
            <StreakCard />
            <LongestStreakCard />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
