import { Check } from 'lucide-react-native'
import { TouchableOpacity } from 'react-native'

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export const Checkbox = ({ checked = false, onCheckedChange, disabled = false }: CheckboxProps) => {
  const handlePress = () => {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked)
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      className={`h-7 w-7 items-center justify-center rounded-md ${
        checked
          ? 'bg-indigo-500'
          : disabled
            ? 'border-2 border-gray-300 bg-gray-100'
            : 'border-2 border-gray-300 bg-white'
      }`}
      style={{ minWidth: 28, minHeight: 28 }}
    >
      {checked && <Check size={20} color='white' strokeWidth={3} />}
    </TouchableOpacity>
  )
}
