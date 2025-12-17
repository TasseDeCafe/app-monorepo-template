import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useTabBarHeight } from '@/hooks/use-tab-bar-height'
import { useLingui } from '@lingui/react/macro'

export const HomeView = () => {
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
        <View className='flex-col gap-2'>
          <View className='items-left mb-0 mt-3 w-full'>
            <Text className='text-lg font-semibold text-gray-800'>{t`Some text for the Home tab`}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
