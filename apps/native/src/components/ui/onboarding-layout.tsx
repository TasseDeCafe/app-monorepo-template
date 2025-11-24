import { LinearGradient } from 'expo-linear-gradient'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import colors from 'tailwindcss/colors'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'

type OnboardingLayoutProps = {
  children: React.ReactNode
}

export const OnboardingLayout = ({ children }: OnboardingLayoutProps) => {
  const insets = useSafeAreaInsets()

  const keyboardOffset = -(insets.bottom + 16)

  return (
    <LinearGradient colors={[colors.indigo[50], colors.white]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }} keyboardVerticalOffset={keyboardOffset}>
        <View
          className='flex-1'
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
        >
          <View className='flex-1 p-4'>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}
