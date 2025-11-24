import { Slot } from 'expo-router'
import { DrawerContainer } from '@/components/ui/drawer-container'
import { Drawer } from '@/components/ui/drawer'

export default function DrawerLayout() {
  return (
    <DrawerContainer drawerContent={<Drawer />}>
      <Slot />
    </DrawerContainer>
  )
}
