import React, { useCallback } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useDrawerStore } from '@/stores/drawer-store'

const SCREEN_WIDTH = Dimensions.get('window').width
const DRAWER_WIDTH_PERCENTAGE = 0.8
const DRAWER_WIDTH = SCREEN_WIDTH * DRAWER_WIDTH_PERCENTAGE
const EDGE_WIDTH = 20 // Width of edge area to detect swipe from left
const ANIMATION_DURATION = 150 // Controls the speed of the animation - lower values are faster

export const DrawerContainer = React.memo(
  ({ children, drawerContent }: { children: React.ReactNode; drawerContent: React.ReactNode }) => {
    const isOpen = useDrawerStore((state) => state.isOpen)
    const setIsOpen = useDrawerStore((state) => state.setIsOpen)

    // Instead of translating the drawer, we'll control the progress value
    // which will drive both the drawer and content positions
    const progress = useSharedValue(isOpen ? 1 : 0)
    const overlayOpacity = useSharedValue(isOpen ? 0.5 : 0)

    // Update animation values when drawer state changes
    React.useEffect(() => {
      progress.value = withTiming(isOpen ? 1 : 0, { duration: ANIMATION_DURATION })
      overlayOpacity.value = withTiming(isOpen ? 0.5 : 0, { duration: ANIMATION_DURATION })
    }, [isOpen, progress, overlayOpacity])

    const closeDrawer = useCallback(() => {
      setIsOpen(false)
    }, [setIsOpen])

    const openDrawer = useCallback(() => {
      setIsOpen(true)
    }, [setIsOpen])

    // Pan gesture handler for drawer interaction (close)
    const drawerPanGesture = Gesture.Pan()
      .onUpdate((e) => {
        if (isOpen) {
          // When drawer is open, track leftward movement (negative translation)
          const newProgress = Math.max(0, Math.min(1, 1 + e.translationX / DRAWER_WIDTH))
          progress.value = newProgress
          overlayOpacity.value = 0.5 * newProgress
        }
      })
      .onEnd((e) => {
        if (isOpen) {
          if (e.velocityX < -500 || e.translationX < -DRAWER_WIDTH / 3) {
            // Close drawer if velocity or translation is high enough
            progress.value = withTiming(0, { duration: ANIMATION_DURATION })
            overlayOpacity.value = withTiming(0, { duration: ANIMATION_DURATION })
            scheduleOnRN(closeDrawer)
          } else {
            // Keep drawer open
            progress.value = withTiming(1, { duration: ANIMATION_DURATION })
            overlayOpacity.value = withTiming(0.5, { duration: ANIMATION_DURATION })
          }
        }
      })

    // Edge pan gesture to open drawer from left edge
    const edgePanGesture = Gesture.Pan()
      .activeOffsetX([0, 15]) // Only activate after a minimum horizontal movement
      .onBegin((e) => {
        // Only activate if gesture starts at the left edge of the screen
        if (e.x > EDGE_WIDTH) {
          return false
        }
        return true
      })
      .onUpdate((e) => {
        if (!isOpen && e.translationX > 0) {
          // Map the translation to progress (0 to 1)
          const newProgress = Math.min(1, Math.max(0, e.translationX / DRAWER_WIDTH))
          progress.value = newProgress
          overlayOpacity.value = 0.5 * newProgress
        }
      })
      .onEnd((e) => {
        if (!isOpen) {
          if (e.velocityX > 500 || e.translationX > DRAWER_WIDTH / 3) {
            // Open drawer if velocity or translation is high enough
            progress.value = withTiming(1, { duration: ANIMATION_DURATION })
            overlayOpacity.value = withTiming(0.5, { duration: ANIMATION_DURATION })
            scheduleOnRN(openDrawer)
          } else {
            // Keep drawer closed
            progress.value = withTiming(0, { duration: ANIMATION_DURATION })
            overlayOpacity.value = withTiming(0, { duration: ANIMATION_DURATION })
          }
        }
      })

    // Tap gesture for overlay to close drawer
    const tapGesture = Gesture.Tap()
      .enabled(isOpen)
      .maxDuration(1000000) // Ensure long press doesn't cancel the gesture
      .onEnd(() => {
        if (isOpen) {
          progress.value = withTiming(0, { duration: ANIMATION_DURATION })
          overlayOpacity.value = withTiming(0, { duration: ANIMATION_DURATION })
          scheduleOnRN(closeDrawer)
        }
      })

    // Content animation
    const contentAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: progress.value * DRAWER_WIDTH }],
      }
    })

    // Drawer animation
    const drawerAnimatedStyle = useAnimatedStyle(() => {
      // No need to translate the drawer anymore since it's fixed in position
      // but we can use opacity to fade it in/out
      return {
        opacity: progress.value,
      }
    })

    const overlayAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: overlayOpacity.value,
        // Don't completely hide the view when opacity is 0, just make it non-interactive
        // This is important to make sure that the tap on the overlay always works
        pointerEvents: overlayOpacity.value > 0 ? 'auto' : 'none',
      }
    })

    return (
      <View style={styles.container}>
        {/* Drawer - positioned underneath */}
        <Animated.View style={[styles.drawer, { width: DRAWER_WIDTH }, drawerAnimatedStyle]}>
          {drawerContent}
        </Animated.View>

        {/* Main Content with edge gesture detection */}
        <GestureDetector gesture={Gesture.Simultaneous(drawerPanGesture, edgePanGesture)}>
          <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
            {/* Overlay with tap gesture - completely separate from other gestures */}
            <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
              <GestureDetector gesture={tapGesture}>
                <View style={StyleSheet.absoluteFill} />
              </GestureDetector>
            </Animated.View>
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </View>
    )
  }
)

DrawerContainer.displayName = 'DrawerContainer'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    backgroundColor: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
    backgroundColor: 'white',
  },
})
