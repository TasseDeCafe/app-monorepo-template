import React, { useCallback } from 'react'
import { TouchableOpacity } from 'react-native'
import { useDrawerStore } from '@/stores/drawer-store'
import * as Haptics from 'expo-haptics'
import { Menu } from 'lucide-react-native'

export const DrawerToggleButton = React.memo(() => {
  const toggleDrawer = useDrawerStore((state) => state.toggleDrawer)

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggleDrawer()
  }, [toggleDrawer])

  return (
    <TouchableOpacity className='ml-4' onPress={handlePress}>
      <Menu color='black' />
    </TouchableOpacity>
  )
})

DrawerToggleButton.displayName = 'DrawerToggleButton'
