import { Text, View } from 'react-native'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import colors from 'tailwindcss/colors'

interface TitleWithGradientProps {
  children: React.ReactNode
  className?: string
}

export const TitleWithGradient = ({ children, className }: TitleWithGradientProps) => {
  const textParts = React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : ''))
    .filter(Boolean)

  const renderText = (extraClassName = '') => (
    <View>
      {textParts.map((part, index) => (
        <Text key={index} className={`text-center text-4xl font-bold leading-tight ${extraClassName}`}>
          {part}
        </Text>
      ))}
    </View>
  )

  return (
    <View className={className}>
      <MaskedView maskElement={renderText('')}>
        <LinearGradient colors={[colors.indigo[600], colors.purple[700]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          {renderText('opacity-0')}
        </LinearGradient>
      </MaskedView>
    </View>
  )
}
