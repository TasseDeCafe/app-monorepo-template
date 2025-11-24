import { useCallback, useState, useEffect } from 'react'
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

interface CustomSliderProps {
  minimumValue: number
  maximumValue: number
  value: number
  step?: number
  onValueChange?: (value: number) => void
  onSlidingComplete?: (value: number) => void
  minimumTrackTintColor?: string
  maximumTrackTintColor?: string
  thumbTintColor?: string
  style?: any
}

const THUMB_SIZE = 20
const INACTIVE_THUMB_SIZE = 14
const HIT_SLOP_AMOUNT = 25
const THUMB_ANIMATION_DURATION = 50
const TRACK_HEIGHT = 4
const TAP_AREA_HEIGHT = 40

export const Slider = ({
  minimumValue,
  maximumValue,
  value,
  step = 1,
  onValueChange,
  onSlidingComplete,
  minimumTrackTintColor = '#4f46e5',
  maximumTrackTintColor = '#d1d5db',
  thumbTintColor = '#4f46e5',
  style,
}: CustomSliderProps) => {
  const [trackWidth, setTrackWidth] = useState(0)
  const translateX = useSharedValue(0)
  const isSliding = useSharedValue(false)
  const isTouching = useSharedValue(false)
  const startX = useSharedValue(0)
  const animatedThumbSize = useSharedValue(INACTIVE_THUMB_SIZE)

  const [isDragging, setIsDragging] = useState(false)

  const updateThumbPosition = useCallback(
    (newValue: number) => {
      if (trackWidth) {
        const position = ((newValue - minimumValue) / (maximumValue - minimumValue)) * trackWidth
        translateX.value = position
      }
    },
    [trackWidth, minimumValue, maximumValue, translateX]
  )

  useEffect(() => {
    if (!isDragging && trackWidth > 0) {
      updateThumbPosition(value)
    }
  }, [value, trackWidth, updateThumbPosition, isDragging])

  const getValueFromPosition = useCallback(
    (position: number): number => {
      'worklet'
      const ratio = position / trackWidth
      let newValue = minimumValue + ratio * (maximumValue - minimumValue)

      if (step) {
        newValue = Math.round(newValue / step) * step
      }

      return Math.min(Math.max(newValue, minimumValue), maximumValue)
    },
    [minimumValue, maximumValue, trackWidth, step]
  )

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setTrackWidth(width)
  }

  const onTrackPress = (event: any) => {
    if (!trackWidth) return

    const x = event.nativeEvent.locationX
    const newPosition = Math.max(0, Math.min(x, trackWidth))
    translateX.value = newPosition

    const newValue = getValueFromPosition(newPosition)
    if (onValueChange) {
      onValueChange(newValue)
    }
    if (onSlidingComplete) {
      onSlidingComplete(newValue)
    }
  }

  const panGesture = Gesture.Pan()
    .onTouchesDown(() => {
      isTouching.value = true
      animatedThumbSize.value = withTiming(THUMB_SIZE, { duration: THUMB_ANIMATION_DURATION })
    })
    .onStart(() => {
      startX.value = translateX.value
      isSliding.value = true
      scheduleOnRN(setIsDragging, true)
    })
    .onUpdate((event) => {
      const newPosition = Math.max(0, Math.min(startX.value + event.translationX, trackWidth))
      translateX.value = newPosition

      if (onValueChange) {
        const newValue = getValueFromPosition(newPosition)
        scheduleOnRN(onValueChange, newValue)
      }
    })
    .onEnd(() => {
      isSliding.value = false

      if (onSlidingComplete) {
        const newValue = getValueFromPosition(translateX.value)
        scheduleOnRN(onSlidingComplete, newValue)
      }
    })
    .onTouchesUp(() => {
      isTouching.value = false
      animatedThumbSize.value = withTiming(INACTIVE_THUMB_SIZE, { duration: THUMB_ANIMATION_DURATION })
    })
    .onFinalize(() => {
      if (isSliding.value) {
        isSliding.value = false
      }
      if (isTouching.value) {
        isTouching.value = false
        animatedThumbSize.value = withTiming(INACTIVE_THUMB_SIZE, { duration: THUMB_ANIMATION_DURATION })
      }
    })

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    }
  })

  const thumbStyle = useAnimatedStyle(() => {
    const currentSize = animatedThumbSize.value
    const currentTouchableSize = THUMB_SIZE + HIT_SLOP_AMOUNT * 2
    const thumbTopOffset = (currentTouchableSize - currentSize) / 2
    const thumbLeftOffset = (currentTouchableSize - currentSize) / 2

    return {
      width: currentSize,
      height: currentSize,
      borderRadius: currentSize / 2,
      backgroundColor: thumbTintColor,
      position: 'absolute',
      top: thumbTopOffset,
      left: thumbLeftOffset,
    }
  })

  const gestureWrapperStyle = useAnimatedStyle(() => {
    const currentTouchableSize = THUMB_SIZE + HIT_SLOP_AMOUNT * 2
    const trackCenterY = TAP_AREA_HEIGHT / 2
    const touchAreaCenterY = currentTouchableSize / 2

    return {
      transform: [{ translateX: translateX.value - currentTouchableSize / 2 }],
      position: 'absolute',
      top: trackCenterY - touchAreaCenterY,
      left: 0,
      width: currentTouchableSize,
      height: currentTouchableSize,
      zIndex: 10,
    }
  })

  return (
    <View style={[styles.container, style]}>
      <View style={styles.tapAreaContainer}>
        <Pressable onLayout={onTrackLayout} onPress={onTrackPress} style={styles.tapArea}>
          <View style={styles.trackContainer}>
            <View style={[styles.track, { backgroundColor: maximumTrackTintColor }]}>
              <Animated.View style={[styles.progress, progressStyle, { backgroundColor: minimumTrackTintColor }]} />
            </View>
          </View>
        </Pressable>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={gestureWrapperStyle}>
            <Animated.View style={thumbStyle} />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: TAP_AREA_HEIGHT,
    justifyContent: 'center',
  },
  tapAreaContainer: {
    width: '100%',
    height: TAP_AREA_HEIGHT,
    position: 'relative',
  },
  tapArea: {
    width: '100%',
    height: TAP_AREA_HEIGHT,
    justifyContent: 'center',
  },
  trackContainer: {
    height: TRACK_HEIGHT,
    width: '100%',
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    width: '100%',
  },
  progress: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    position: 'absolute',
    left: 0,
  },
})
