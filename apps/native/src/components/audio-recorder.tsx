import { Mic } from 'lucide-react-native'
import { Animated, Easing, Pressable, View } from 'react-native'
import { useEffect, useRef } from 'react'

interface AudioRecorderProps {
  isRecording: boolean
  disabled?: boolean
  onRecordPress: () => void
}

export const AudioRecorder = ({ isRecording, disabled = false, onRecordPress }: AudioRecorderProps) => {
  const pulseAnim1 = useRef(new Animated.Value(0)).current
  const pulseAnim2 = useRef(new Animated.Value(0)).current
  const pulseAnim3 = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // We only add those listeners to prevent warnings from reanimated
    const id1 = pulseAnim1.addListener(() => {})
    const id2 = pulseAnim2.addListener(() => {})
    const id3 = pulseAnim3.addListener(() => {})

    if (isRecording) {
      const createPulseAnimation = (animValue: Animated.Value) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 2000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        )
      }

      // Create and start three staggered pulse animations
      const pulse1 = createPulseAnimation(pulseAnim1)
      const pulse2 = createPulseAnimation(pulseAnim2)
      const pulse3 = createPulseAnimation(pulseAnim3)

      pulse1.start()

      // Delay the start of subsequent pulses
      setTimeout(() => pulse2.start(), 666)
      setTimeout(() => pulse3.start(), 1333)

      return () => {
        pulse1.stop()
        pulse2.stop()
        pulse3.stop()

        pulseAnim1.setValue(0)
        pulseAnim2.setValue(0)
        pulseAnim3.setValue(0)
      }
    }

    return () => {
      pulseAnim1.removeListener(id1)
      pulseAnim2.removeListener(id2)
      pulseAnim3.removeListener(id3)
    }
  }, [isRecording, pulseAnim1, pulseAnim2, pulseAnim3])

  const renderPulseWave = (animValue: Animated.Value) => {
    if (!isRecording) return null

    const pulseSize = 50

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          height: pulseSize,
          width: pulseSize,
          borderRadius: pulseSize / 2,
          backgroundColor: 'rgba(239, 68, 68, 0.4)',
          opacity: animValue.interpolate({
            inputRange: [0, 0.2, 1],
            outputRange: [0.6, 0.3, 0],
          }),
          transform: [
            { translateX: -pulseSize / 2 },
            { translateY: -pulseSize / 2 },
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2],
              }),
            },
          ],
        }}
      />
    )
  }

  return (
    <View className='items-center justify-start p-1'>
      <View className='relative h-16 w-16'>
        {renderPulseWave(pulseAnim1)}
        {renderPulseWave(pulseAnim2)}
        {renderPulseWave(pulseAnim3)}

        <Pressable
          onPress={onRecordPress}
          disabled={disabled}
          className={`absolute inset-0 items-center justify-center rounded-full ${
            isRecording ? 'bg-red-500' : 'bg-indigo-600'
          }`}
        >
          <Mic size={28} color='#FFFFFF' />
        </Pressable>
      </View>
    </View>
  )
}
