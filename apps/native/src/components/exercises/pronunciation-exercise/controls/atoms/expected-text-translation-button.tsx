import { TouchableOpacity } from 'react-native'
import { Languages } from 'lucide-react-native'
import colors from 'tailwindcss/colors'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'

export const ExpectedTextTranslationButton = () => {
  const openBottomSheet = useBottomSheetStore((state) => state.open)

  const handlePress = () => {
    openBottomSheet(IndividualSheetName.TRANSLATION)
  }

  return (
    <TouchableOpacity onPress={handlePress} className='rounded-md p-2 active:bg-gray-200'>
      <Languages size={22} color={colors.gray[500]} />
    </TouchableOpacity>
  )
}
