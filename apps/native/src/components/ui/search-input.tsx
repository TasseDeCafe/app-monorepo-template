import React from 'react'
import { TextInput, TextInputProps, View, TouchableOpacity, Platform } from 'react-native'
import { Search, X } from 'lucide-react-native'
import colors from 'tailwindcss/colors'

interface SearchInputProps extends TextInputProps {
  containerClassName?: string
}

export const SearchInput = ({ containerClassName, style, value, onChangeText, ...props }: SearchInputProps) => {
  const handleClear = () => {
    onChangeText?.('')
  }

  return (
    <View
      className={`mb-4 flex-row items-center ${containerClassName || ''}`}
      style={{
        borderRadius: 12,
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        ...(style as any),
      }}
    >
      <Search size={20} color={colors.gray[400]} />
      <TextInput
        className='ml-2 flex-1'
        style={{
          fontSize: 16,
          color: '#1f2937',
        }}
        placeholder='Search'
        placeholderTextColor={colors.gray[400]}
        returnKeyType='done'
        value={value}
        onChangeText={onChangeText}
        clearButtonMode={Platform.OS === 'ios' ? 'always' : 'never'}
        {...props}
      />
      {Platform.OS === 'android' && value && value.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={20} color={colors.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  )
}
