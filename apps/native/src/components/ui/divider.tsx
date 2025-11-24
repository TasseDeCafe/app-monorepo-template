import React from 'react'
import { View } from 'react-native'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

interface DividerProps {
  className?: string
}

export const Divider = ({ className }: DividerProps) => {
  return <View className={cn('h-[1px] bg-slate-100', className)} />
}
