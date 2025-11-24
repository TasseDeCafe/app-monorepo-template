import { View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated'
import { pickerColors } from './speed-picker-colors'

type TickMarkProps = {
  value: number // The speed value this tick represents (e.g., 0.80, 0.85)
  offset: number // The horizontal position offset within the ruler content
  isMinor: boolean // True if this is a smaller tick between major values
  currentValueShared: SharedValue<number> // Shared value holding the last *settled* speed value
  isMovingShared: SharedValue<boolean> // Shared value indicating if the slider is currently animating/being dragged
}

/**
 * Renders a single tick mark (major or minor) on the speed slider ruler.
 * It dynamically changes its style (color, height) based on whether it corresponds
 * to the currently settled value and whether the slider is moving.
 */
// Note: React.memo could be used here if performance profiling showed it was necessary,
// but given the limited number of ticks, it's likely not needed.
export const TickMark = ({ value, offset, isMinor, currentValueShared, isMovingShared }: TickMarkProps) => {
  // Animated style for the tick line itself.
  const tickStyle = useAnimatedStyle(() => {
    'worklet'
    // Determine if this tick should be visually active (highlighted in indigo).
    // It's active only if the slider is NOT moving AND the settled value matches this tick's value.
    const isActive = !isMovingShared.value && Math.abs(currentValueShared.value - value) < 0.001 // Tolerance for float comparison

    return {
      backgroundColor: isActive ? pickerColors.indigo[600] : pickerColors.black, // Indigo when active, black otherwise
      height: isMinor ? 20 : 30, // Different heights for minor/major ticks
    }
  })

  // Animated style for the tick label (only applicable to major ticks).
  const labelStyle = useAnimatedStyle(() => {
    'worklet'
    // Minor ticks don't have labels, so no style needed.
    if (isMinor) return {}

    // Determine if this label should be visually active (highlighted in indigo).
    const isActive = !isMovingShared.value && Math.abs(currentValueShared.value - value) < 0.001

    return {
      color: isActive ? pickerColors.indigo[600] : pickerColors.gray[500],
    }
  })

  return (
    // Position the container absolutely based on the calculated offset from the parent.
    <View style={[styles.tickContainer, { position: 'absolute', left: offset }]}>
      {/* The visible tick line, applying the animated style for color and height. */}
      <Animated.View style={[styles.tickBase, tickStyle]} />

      {/* Render the label text only for major ticks, applying the animated style for color. */}
      {!isMinor && <Animated.Text style={[styles.tickLabelBase, labelStyle]}>{value.toFixed(2)}</Animated.Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  tickContainer: {
    alignItems: 'center',
    width: 30, // Width used for centering calculations within SpeedPicker
    marginLeft: -15, // Centers the tick container relative to its `left` offset
    paddingBottom: 10, // Provides spacing below the tick/label area
  },
  tickBase: {
    width: 2, // Standard width for all tick lines
    // Height is set dynamically via tickStyle
  },
  tickLabelBase: {
    marginTop: 5, // Space between the tick line and its text label
    fontSize: 12,
    // Color is set dynamically via labelStyle
  },
})
