import { JSX, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View, Dimensions, Pressable, TextInput, PressableStateCallbackType } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useAnimatedProps,
  withDecay,
  cancelAnimation,
  useAnimatedReaction,
  useDerivedValue,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { TickMark } from './tick-mark'
import { pickerColors } from './speed-picker-colors'

type SpeedPickerProps = {
  value: number
  onValueChange: (value: string) => void
  minValue?: number
  maxValue?: number
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

type PresetButtonProps = {
  preset: number
  onPress: (preset: number) => void
}

const PresetButton = ({ preset, onPress }: PresetButtonProps) => {
  // Provides visual feedback (opacity change) on press
  const getPressableStyle = (state: PressableStateCallbackType) => [{ opacity: state.pressed ? 0.7 : 1.0 }]

  return (
    <Pressable onPress={() => onPress(preset)}>
      {(state) => (
        <View style={[styles.presetButton, getPressableStyle(state)]}>
          <Text style={styles.presetText}>{preset.toFixed(2)}</Text>
        </View>
      )}
    </Pressable>
  )
}

export const SpeedPicker = ({ value = 1.0, onValueChange, minValue = 0.75, maxValue = 1.25 }: SpeedPickerProps) => {
  // --- Component Constants ---
  const windowWidth = Dimensions.get('window').width
  const rulerWidth = windowWidth * 2 // Make ruler wider than screen for smooth edges
  const range = maxValue - minValue
  const unitWidth = rulerWidth / range // Pixel width corresponding to a 1.0 change in speed value
  // --- End Constants ---

  // --- Position/Value Conversion ---
  // Converts a speed value (e.g., 0.90) to the translateX position needed to center its tick mark
  const valueToPosition = useCallback(
    (val: number) => {
      'worklet' // Can be called from UI thread
      return rulerWidth / 2 - ((val - minValue) / range) * rulerWidth
    },
    [minValue, range, rulerWidth]
  )

  // Converts a translateX position back to the corresponding speed value (worklet version for UI thread)
  const positionToValueWorklet = (pos: number): number => {
    'worklet'
    const val = minValue + (range * (rulerWidth / 2 - pos)) / rulerWidth
    // Clamp value to min/max bounds and round to 2 decimal places
    return Math.max(minValue, Math.min(maxValue, Math.round(val * 100) / 100))
  }
  // --- End Conversion ---

  // --- Shared Values for Animation State ---
  // Current horizontal translation of the ruler content view
  const translateX = useSharedValue(valueToPosition(value))
  // Stores the translateX value at the beginning of a pan gesture
  const startX = useSharedValue(0)
  // The speed value currently displayed in the main text input (updates during animation)
  const displayValueShared = useSharedValue(value)
  // The last *settled* speed value (used for highlighting the correct tick mark)
  const currentValueShared = useSharedValue(value)
  // Flag indicating if the slider is currently being dragged or animating (decay/spring)
  const isMovingShared = useSharedValue(false)
  // --- End Shared Values ---

  // --- Helper for Delayed Stop State ---
  // Sets isMovingShared to false after a short delay via setTimeout.
  // This prevents the tick highlight from flickering immediately when an animation completes.
  const markAsStoppedAfterDelay = useCallback(() => {
    // Note: Be cautious with setTimeout in components that might unmount.
    // Consider cleanup if this component could unmount unexpectedly during the timeout.
    setTimeout(() => {
      isMovingShared.value = false
    }, 50) // Delay in milliseconds
  }, [isMovingShared])
  // --- End Delayed Stop Helper ---

  // --- Tick Rendering ---
  // Memoized function to render all tick marks (major and minor) using the TickMark component.
  const renderTicks = useCallback(() => {
    const ticks: JSX.Element[] = []
    const tickStep = 0.05 // Major ticks every 0.05
    const minorTicksPerMajor = 5 // Number of minor ticks between major ones
    const majorTickCount = Math.floor(range / tickStep) + 1

    for (let i = 0; i <= majorTickCount; i++) {
      const tickValue = Math.round((minValue + i * tickStep) * 100) / 100
      if (tickValue > maxValue + 0.001) continue // Add tolerance for float comparison

      const offset = (tickValue - minValue) * unitWidth // Calculate horizontal position

      // Render Major Tick
      ticks.push(
        <TickMark
          key={`major-${i}`}
          value={tickValue}
          offset={offset}
          isMinor={false}
          currentValueShared={currentValueShared} // Pass shared value for highlighting
          isMovingShared={isMovingShared} // Pass shared value for highlighting
        />
      )

      // Render Minor Ticks between major ticks
      if (i < majorTickCount) {
        for (let j = 1; j < minorTicksPerMajor; j++) {
          const minorValue = Math.round((tickValue + (j * tickStep) / minorTicksPerMajor) * 1000) / 1000
          if (minorValue > maxValue + 0.001) continue

          const minorOffset = (minorValue - minValue) * unitWidth

          ticks.push(
            <TickMark
              key={`minor-${i}-${j}`}
              value={minorValue} // Minor value (not used for highlighting but passed for consistency)
              offset={minorOffset}
              isMinor={true}
              currentValueShared={currentValueShared}
              isMovingShared={isMovingShared}
            />
          )
        }
      }
    }
    return <View style={{ width: rulerWidth, height: 70, position: 'relative' }}>{ticks}</View>
    // Dependencies for useCallback: Recalculate if dimensions/state affecting ticks change.
  }, [minValue, maxValue, range, unitWidth, rulerWidth, currentValueShared, isMovingShared])
  // --- End Tick Rendering ---

  // --- Haptic Feedback ---
  // Memoized function to trigger light haptic feedback.
  const triggerHapticFeedback = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).then(() => {}) // Fire and forget
  }, [])
  // --- End Haptic Feedback ---

  // --- Effect for External Value Prop Changes ---
  // Handles changes to the `value` prop (e.g., when a preset is pressed or parent updates).
  // Animates the slider to the new position using a spring.
  useEffect(() => {
    cancelAnimation(translateX) // Stop any current animation
    isMovingShared.value = true // Mark as moving during the animation
    const targetPosition = valueToPosition(value) // Calculate target position

    // Animate translateX to the target position
    translateX.value = withSpring(
      targetPosition,
      { damping: 20, stiffness: 150, mass: 1, overshootClamping: true },
      (finished) => {
        // Animation completion callback
        if (finished) {
          // Update the settled value state
          currentValueShared.value = value
          // Set isMovingShared to false *after a delay* to prevent flickering
          scheduleOnRN(markAsStoppedAfterDelay)
        }
        // If interrupted (e.g., by a new touch), the interrupting interaction
        // (panGesture.onBegin) will handle the state update.
      }
    )
    // Note: We rely on the value prop changing to trigger this effect.
  }, [translateX, value, valueToPosition, currentValueShared, isMovingShared, markAsStoppedAfterDelay])
  // --- End Effect ---

  // --- Reaction for Display Value & Haptics ---
  // Reacts to changes in `translateX` to update the displayed text value and trigger haptics.
  useAnimatedReaction(
    () => {
      // Prepare: Calculate the raw (unrounded) speed value based on current translateX
      'worklet'
      const val = minValue + (range * (rulerWidth / 2 - translateX.value)) / rulerWidth
      return Math.max(minValue, Math.min(maxValue, val)) // Clamp raw value
    },
    (currentValueRaw, previousValueRaw) => {
      // Effect: Run when the raw value changes
      'worklet'
      if (previousValueRaw === null) {
        // First run: Initialize display value
        displayValueShared.value = Math.round(currentValueRaw * 100) / 100
        return
      }

      // Update the shared value for the main text display (rounded)
      const currentDisplayValue = Math.round(currentValueRaw * 100) / 100
      displayValueShared.value = currentDisplayValue

      // Haptic Feedback Logic: Trigger when crossing a 0.05 boundary
      const currentTickIndex = Math.trunc(currentValueRaw / 0.05)
      const previousTickIndex = Math.trunc(previousValueRaw / 0.05)
      if (currentTickIndex !== previousTickIndex) {
        scheduleOnRN(triggerHapticFeedback)
      }
    },
    [minValue, maxValue, range, rulerWidth, triggerHapticFeedback]
  )
  // --- End Reaction ---

  // --- Parent Notification Callback ---
  // Memoized function to call the parent's onValueChange prop.
  const handleValueChange = useCallback(
    (finalValue: number) => {
      onValueChange(finalValue.toFixed(2))
    },
    [onValueChange]
  )
  // --- End Parent Notification ---

  // --- Gesture Handling Logic ---
  const minPosition = valueToPosition(maxValue) // Leftmost position boundary
  const maxPosition = valueToPosition(minValue) // Rightmost position boundary
  const LOW_VELOCITY_THRESHOLD = 50 // Velocity below which a release is treated as a tap/slow drag

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet'
      cancelAnimation(translateX) // Stop any ongoing animation (decay/spring)

      // --- Snap Logic on Interruption/Touch Down ---
      // Calculate the value at the current touch position and snap it to the nearest 0.01
      const snappedValue = positionToValueWorklet(translateX.value) // Use helper that clamps and rounds
      const snappedPosition = valueToPosition(snappedValue)

      // Immediately jump the slider and state to the snapped position/value
      translateX.value = snappedPosition
      currentValueShared.value = snappedValue // Set current value (used for tick highlight)
      displayValueShared.value = snappedValue // Update display immediately

      // Notify the parent immediately about the snapped value on touch down.
      // This handles the notification for taps as well.

      // Prepare for the drag gesture
      isMovingShared.value = true // Mark as moving (turns text/tick black)
      startX.value = translateX.value // Store starting position for delta calculations
      // --- End Snap Logic ---
    })
    .onUpdate((event) => {
      // Handle dragging: Update translateX based on gesture delta, clamped to bounds
      'worklet'
      translateX.value = Math.min(maxPosition, Math.max(minPosition, startX.value + event.translationX))
    })
    .onEnd((event) => {
      'worklet'
      if (Math.abs(event.velocityX) < LOW_VELOCITY_THRESHOLD) {
        // --- Handle Tap / Slow Release: Finalize State ---
        // The position was already snapped correctly in onBegin.
        // We just need to confirm the final value based on the *current* snapped position
        // and trigger the transition back to the 'stopped' visual state.
        // This part of the logic is important to make sure that the value is locked at low velocity

        // Confirm the final settled value based on the slider's current position.
        const finalValue = positionToValueWorklet(translateX.value)
        currentValueShared.value = finalValue // Update the settled value state

        // Notify parent of the final *settled* value precisely at the end of interaction.
        scheduleOnRN(handleValueChange, finalValue)

        // Trigger the delayed transition back to the 'stopped' visual state (indigo color).
        scheduleOnRN(markAsStoppedAfterDelay)
      } else {
        // --- Handle Flick: Use Decay ---
        isMovingShared.value = true // Keep moving during decay animation
        translateX.value = withDecay(
          {
            velocity: event.velocityX,
            rubberBandEffect: false, // No visual overshoot past clamp
            clamp: [minPosition, maxPosition], // Stop at boundaries
            deceleration: 0.99, // Adjust friction (higher = less friction)
          },
          (finished) => {
            // Decay animation completion callback
            'worklet'
            if (finished) {
              // Decay finished: Calculate final value, update state, mark stopped (delayed), notify parent
              const finalValue = positionToValueWorklet(translateX.value)
              currentValueShared.value = finalValue
              scheduleOnRN(markAsStoppedAfterDelay)
              scheduleOnRN(handleValueChange, finalValue)
            }
            // If decay is interrupted (e.g., by a new touch), the next onBegin will handle it.
          }
        )
      }
      // Low-velocity case (Tap/Slow Release) is handled in onFinalize
    })
    .onFinalize((event) => {
      'worklet'
      // Use 0 velocity if event is undefined (e.g., gesture cancelled immediately)
      const velocityX = event?.velocityX ?? 0
      // If the gesture finalized with low velocity, regardless of the 'success' flag,
      // it means it wasn't a flick that was already handled by onEnd.
      // Treat it as a tap or slow release and trigger the stop state.
      if (Math.abs(velocityX) < LOW_VELOCITY_THRESHOLD) {
        scheduleOnRN(markAsStoppedAfterDelay)
      }
      // High velocity case was handled by onEnd. No action needed here.
    })
  // --- End Gesture Handling ---

  // --- Animated Styles ---
  // Style for the ruler content view, applying the horizontal translation
  const rulerStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: translateX.value }] }
  })

  // Create a derived value for the text string (avoids recalculating string formatting on every frame)
  const animatedText = useDerivedValue(() => {
    'worklet'
    return `${displayValueShared.value.toFixed(2)}x`
  })

  // Props for the AnimatedTextInput, linking its `text` prop to the derived value
  const animatedTextProps = useAnimatedProps(() => {
    'worklet'
    return { text: animatedText.value } as any
  })

  // Animated style for the text color
  const animatedTextColorStyle = useAnimatedStyle(() => {
    'worklet'
    return {
      color: isMovingShared.value ? 'black' : '#4f46e5', // Black when moving, indigo when settled
    }
  })
  // --- End Animated Styles ---

  // --- Preset Button Handling ---
  const presetValues = [0.8, 0.85, 0.9, 0.95, 1.0] // Available preset speeds
  const handlePresetPress = (preset: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) // Medium haptic on preset press
    // Note: cancelAnimation is handled by the useEffect hook when `value` changes
    onValueChange(preset.toFixed(2)) // Trigger parent update, which changes the `value` prop
  }
  // --- End Preset Button Handling ---

  // --- Component Render ---
  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {/* Main Display Value */}
        <AnimatedTextInput
          style={[styles.currentValue, animatedTextColorStyle]}
          editable={false}
          defaultValue={`${value.toFixed(2)}x`}
          animatedProps={animatedTextProps}
        />

        {/* Center Indicator Arrow */}
        <View style={styles.arrowContainer}>
          <View style={styles.arrowLine} />
          <View style={styles.arrowTip} />
        </View>

        {/* Ruler Container (masks overflow and holds gradient) */}
        <View style={styles.rulerContainer}>
          {/* Animated Ruler Content */}
          <Animated.View style={[styles.rulerContent, rulerStyle]}>
            {/* Render the tick marks */}
            {renderTicks()}
          </Animated.View>

          {/* Gradient Overlay for Fade Effect */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.6)', // Semi-transparent white at the start
              'rgba(255, 255, 255, 0)', // Fully transparent center
              'rgba(255, 255, 255, 0.6)', // Semi-transparent white at the end
            ]}
            locations={[0, 0.5, 1]} // Explicit locations: Start: 0, Mid: 0.5, End: 1
            start={{ x: 0, y: 0 }} // Horizontal gradient
            end={{ x: 1, y: 0 }}
            style={styles.gradientOverlay}
            pointerEvents='none' // Allow touches to pass through
          />
        </View>

        {/* Preset Buttons */}
        <View style={styles.presetsContainer}>
          {presetValues.map((preset) => (
            <PresetButton key={preset} preset={preset} onPress={handlePresetPress} />
          ))}
        </View>
      </View>
    </GestureDetector>
  )
}
// --- End Component Render ---

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 0, // Ensure text input styles don't add extra space
    margin: 0,
    backgroundColor: 'transparent', // Needed for TextInput
    width: 120, // Fixed width to prevent layout shifts/truncation
    textAlign: 'center',
    color: pickerColors.indigo[600], // Default color when not moving (overridden by animated style when moving)
  },
  arrowContainer: {
    width: 10,
    height: 14,
    alignItems: 'center',
    marginBottom: 5,
  },
  arrowLine: {
    width: 2,
    height: 7,
    backgroundColor: pickerColors.indigo[600],
  },
  arrowTip: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: pickerColors.indigo[600],
  },
  rulerContainer: {
    width: '100%',
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative', // Needed for absolute positioning of gradient
  },
  rulerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 70,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: '100%',
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 30,
    gap: 10,
  },
  presetButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: pickerColors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: pickerColors.gray[300],
  },
  presetText: {
    fontSize: 16,
    color: pickerColors.gray[500],
    fontWeight: '500',
  },
})
