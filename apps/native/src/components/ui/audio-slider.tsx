import type { LayoutChangeEvent } from 'react-native'
import { StyleSheet, View } from 'react-native'
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useCallback, useMemo } from 'react'
import colors from 'tailwindcss/colors'

// Default style constants
const INACTIVE_THUMB_SIZE = 14
const ACTIVE_THUMB_SIZE = 20
const DEFAULT_TRACK_HEIGHT = 5
const HIT_SLOP_AMOUNT = 25
const THUMB_ANIMATION_DURATION = 50

type SliderProps = {
  value: SharedValue<number>
  minimumValue: SharedValue<number>
  maximumValue: SharedValue<number>
  isBusy?: SharedValue<boolean> // Player is busy (seeking)
  minimumTrackTintColor?: string
  maximumTrackTintColor?: string
  thumbTintColor?: string
  disabled?: boolean
  onSlidingStart?: () => void
  onSlidingComplete?: (value: number) => void
  thumbSize?: number
  trackHeight?: number
}

const clamp = (val: number, min: number, max: number) => {
  'worklet'
  if (min > max) {
    return min
  }
  return Math.min(Math.max(val, min), max)
}

export const AudioSlider = ({
  value,
  minimumValue,
  maximumValue,
  isBusy,
  minimumTrackTintColor = colors.indigo[600],
  maximumTrackTintColor = colors.gray[300],
  thumbTintColor = colors.indigo[600],
  disabled = false,
  onSlidingStart,
  onSlidingComplete,
  thumbSize = ACTIVE_THUMB_SIZE,
  trackHeight = DEFAULT_TRACK_HEIGHT,
}: SliderProps) => {
  // Track the usable slider width (total width minus thumb size)
  const sliderWidth = useSharedValue(0)

  // Gesture state flags
  const isDragging = useSharedValue(false) // True while user is actively dragging
  const isTouching = useSharedValue(false) // True while finger is down (before drag threshold)

  // Position and animation values
  const thumbPosition = useSharedValue(0) // Current X position of thumb
  const dragStartPosition = useSharedValue(0) // Thumb position when drag started
  const animatedThumbSize = useSharedValue(INACTIVE_THUMB_SIZE) // Animated thumb size (grows on touch)

  // Parent busy state (e.g., audio player is seeking)
  const internalIsBusy = useSharedValue(false)
  const parentIsBusy = isBusy ?? internalIsBusy

  // Use active thumb size for padding calculations to ensure enough space
  const containerPaddingHorizontal = thumbSize / 2

  // Fallback to clear isDragging if parent callbacks fail
  const clearDraggingFallback = useCallback(() => {
    setTimeout(() => {
      if (isDragging.value && !parentIsBusy.value) {
        isDragging.value = false
      }
    }, 200)
  }, [isDragging, parentIsBusy])

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .minDistance(1) // Only activate pan after 1 pixel moved
        .onTouchesDown((_event) => {
          // Grow thumb immediately on touch down for visual feedback
          isTouching.value = true
          animatedThumbSize.value = withTiming(thumbSize, { duration: THUMB_ANIMATION_DURATION })
        })
        .onStart(() => {
          // Pan gesture officially started (user moved finger > minDistance)
          cancelAnimation(thumbPosition)
          dragStartPosition.value = thumbPosition.value
          isDragging.value = true
          if (onSlidingStart) {
            scheduleOnRN(onSlidingStart)
          }
        })
        .onUpdate((event) => {
          // Update thumb position as user drags
          const newPosition = dragStartPosition.value + event.translationX
          thumbPosition.value = clamp(newPosition, 0, sliderWidth.value)
        })
        .onEnd(() => {
          // Pan gesture ended (finger lifted after dragging)
          if (onSlidingComplete) {
            const completionValue = interpolate(
              thumbPosition.value,
              [0, sliderWidth.value],
              [minimumValue.value, maximumValue.value],
              Extrapolation.CLAMP
            )
            scheduleOnRN(onSlidingComplete, completionValue)
          }
        })
        .onTouchesUp((_event) => {
          // Shrink thumb when finger is lifted
          isTouching.value = false
          animatedThumbSize.value = withTiming(INACTIVE_THUMB_SIZE, { duration: THUMB_ANIMATION_DURATION })
          // IMPORTANT: Don't clear isDragging here!
          // There's an async gap between this and onSlidingStart executing (scheduleOnRN delay)
          // The animated reaction below handles clearing isDragging at the right time
        })
        .onFinalize(() => {
          // Ensure states are reset if gesture is cancelled unexpectedly
          if (isTouching.value) {
            isTouching.value = false
          }
          if (animatedThumbSize.value !== INACTIVE_THUMB_SIZE) {
            animatedThumbSize.value = withTiming(INACTIVE_THUMB_SIZE, { duration: THUMB_ANIMATION_DURATION })
          }
          // Fallback: clear isDragging after delay if parent never becomes busy
          if (isDragging.value) {
            scheduleOnRN(clearDraggingFallback)
          }
        }),
    [
      disabled,
      thumbPosition,
      dragStartPosition,
      isDragging,
      isTouching,
      onSlidingStart,
      sliderWidth,
      onSlidingComplete,
      minimumValue,
      maximumValue,
      thumbSize,
      animatedThumbSize,
      clearDraggingFallback,
    ]
  )

  const safeMaximumValue = useDerivedValue(
    () => Math.max(minimumValue.value, maximumValue.value),
    [minimumValue, maximumValue]
  )

  // CORE ANIMATION LOGIC: Sync thumb position with external value
  // This handles the tricky timing between gesture state and parent async operations
  useAnimatedReaction(
    () => ({
      externalValue: value.value,
      dragging: isDragging.value,
      parentBusy: parentIsBusy.value,
      width: sliderWidth.value,
      min: minimumValue.value,
      max: safeMaximumValue.value,
    }),
    (current, previous) => {
      'worklet'
      const { externalValue, dragging, parentBusy, width, min, max } = current

      // CRITICAL: Clear isDragging only when parent transitions from busy→idle
      // This prevents premature clearing during the scheduleOnRN async gap
      // Timeline: onEnd fires → isDragging stays true → parent becomes busy →
      //           parent completes → busy becomes false → NOW we clear isDragging
      const wasBusy = previous?.parentBusy ?? false
      if (dragging && wasBusy && !parentBusy) {
        isDragging.value = false
      }

      // Animate thumb to follow external value ONLY when idle (not dragging, not busy)
      const isIdle = !dragging && !parentBusy
      const hasValidDimensions = width > 0 && min < max

      if (isIdle && hasValidDimensions) {
        const clampedValue = clamp(externalValue, min, max)
        const targetPosition = interpolate(clampedValue, [min, max], [0, width], Extrapolation.CLAMP)

        // Only animate if position changed significantly (avoid jitter)
        if (Math.abs(thumbPosition.value - targetPosition) > 0.1) {
          cancelAnimation(thumbPosition)
          thumbPosition.value = withTiming(targetPosition, {
            duration: 150,
            easing: Easing.linear,
          })
        }
      } else if (dragging || parentBusy) {
        // Cancel any ongoing animation while user interacts or parent is processing
        cancelAnimation(thumbPosition)
      } else if (isIdle && !hasValidDimensions) {
        // Reset to start if dimensions are invalid
        cancelAnimation(thumbPosition)
        thumbPosition.value = 0
      }
    },
    [value, isDragging, parentIsBusy, sliderWidth, minimumValue, safeMaximumValue, thumbPosition]
  )

  // Animated style for the gesture wrapper (handles position and defines touch area)
  const animatedGestureWrapperStyle = useAnimatedStyle(() => {
    const touchableSize = thumbSize + HIT_SLOP_AMOUNT * 2

    return {
      transform: [{ translateX: thumbPosition.value - HIT_SLOP_AMOUNT }],
      position: 'absolute',
      top: (thumbSize - touchableSize) / 2,
      left: 0,
      width: touchableSize,
      height: touchableSize,
    }
  })

  // Animated style for the thumb's visual appearance
  const animatedThumbStyle = useAnimatedStyle(() => {
    const currentThumbSize = animatedThumbSize.value
    const touchableSize = thumbSize + HIT_SLOP_AMOUNT * 2

    // Center the visual thumb within the touchable area
    const topOffset = (touchableSize - currentThumbSize) / 2
    const leftOffset = (touchableSize - currentThumbSize) / 2

    return {
      backgroundColor: thumbTintColor,
      opacity: disabled ? 0.5 : 1,
      width: currentThumbSize,
      height: currentThumbSize,
      borderRadius: currentThumbSize / 2,
      position: 'absolute',
      top: topOffset,
      left: leftOffset,
    }
  })

  // Animated style for the filled track (left side of thumb)
  const animatedFilledTrackStyle = useAnimatedStyle(() => {
    // Extend track to thumb center, with slight adjustment for visual alignment
    const widthAdjustment = 2
    const trackWidth = thumbPosition.value + animatedThumbSize.value / 2 - widthAdjustment
    return {
      width: clamp(trackWidth, 0, sliderWidth.value),
      backgroundColor: minimumTrackTintColor,
      opacity: disabled ? 0.5 : 1,
    }
  })

  // Animated style for the track container for vertical centering
  const animatedTrackContainerStyle = useAnimatedStyle(() => {
    // Center the track vertically based on the *active* thumb size
    const trackTop = (thumbSize - trackHeight) / 2
    return {
      top: trackTop,
    }
  })

  const baseTrackStyle = {
    height: trackHeight,
    borderRadius: trackHeight / 2,
    position: 'absolute' as const,
    left: containerPaddingHorizontal,
  }

  const maxTrackStaticStyle = useMemo(
    () => ({
      backgroundColor: maximumTrackTintColor,
      opacity: disabled ? 0.5 : 1,
      right: containerPaddingHorizontal,
    }),
    [maximumTrackTintColor, disabled, containerPaddingHorizontal]
  )

  // Handle layout: Calculate initial thumb position when component mounts or resizes
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const totalWidth = event.nativeEvent.layout.width
      const usableWidth = Math.max(0, totalWidth - thumbSize)
      sliderWidth.value = usableWidth

      // Calculate initial position based on current external value
      const currentMin = minimumValue.value
      const currentMax = maximumValue.value
      const currentValue = value.value

      let initialPosition = 0
      if (usableWidth > 0 && currentMax > currentMin) {
        const clampedValue = clamp(currentValue, currentMin, currentMax)
        initialPosition = interpolate(clampedValue, [currentMin, currentMax], [0, usableWidth], Extrapolation.CLAMP)
      }

      // Only reset position if user is not currently interacting
      if (!isDragging.value && !isTouching.value) {
        cancelAnimation(thumbPosition)
        thumbPosition.value = initialPosition
        animatedThumbSize.value = INACTIVE_THUMB_SIZE
      }
    },
    [
      sliderWidth,
      thumbSize,
      thumbPosition,
      minimumValue,
      maximumValue,
      value,
      isDragging,
      animatedThumbSize,
      isTouching,
    ]
  )

  return (
    <View
      onLayout={handleLayout}
      style={[styles.container, { height: thumbSize, paddingHorizontal: containerPaddingHorizontal }]}
      collapsable={false}
    >
      {/* Background Track */}
      <Animated.View style={[baseTrackStyle, maxTrackStaticStyle, animatedTrackContainerStyle]} />

      {/* Filled Track (left side) */}
      <Animated.View style={[baseTrackStyle, animatedTrackContainerStyle]}>
        <Animated.View style={[{ height: '100%', borderRadius: trackHeight / 2 }, animatedFilledTrackStyle]} />
      </Animated.View>

      {/* Touch Target / Gesture Wrapper */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedGestureWrapperStyle}>
          {/* Actual Visible Thumb */}
          <Animated.View style={[styles.thumbBase, animatedThumbStyle]} />
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  thumbBase: {
    // Base styles if needed
  },
})
