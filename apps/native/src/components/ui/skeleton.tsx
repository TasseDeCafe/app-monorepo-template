import { useEffect, useRef } from 'react'
import { Animated, ViewProps } from 'react-native'

interface SkeletonProps extends ViewProps {
  className?: string
}

export const Skeleton = ({ style, className = 'w-full h-5 rounded', ...props }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )

    animation.start()

    return () => {
      animation.stop()
    }
  }, [opacity])

  return (
    <Animated.View
      className={`bg-gray-200 ${className}`}
      style={[
        {
          opacity,
        },
        style,
      ]}
      {...props}
    />
  )
}
