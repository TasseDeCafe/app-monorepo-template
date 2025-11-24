**Detailed Functionality Summary of `SpeedPicker`**

Here's a breakdown of the features and behaviors implemented in the `SpeedPicker` component:

1.  **Core Functionality**: Allows the user to select a playback speed within a defined range (`minValue` to `maxValue`, defaulting to 0.75-1.25). It reports the _settled_ value back to the parent component via the `onValueChange` callback.

2.  **UI Elements**:
    - **Main Value Display**: An `AnimatedTextInput` at the top prominently displays the current speed value (e.g., "1.00x"), updating in real-time during interactions. Its color is black when the value is changing and indigo when settled.
    - **Center Indicator**: A static **downward-pointing arrow** indicating the selection point above the ruler.
    - **Ruler**: A horizontally scrolling view (`Animated.View`) containing tick marks representing speed values.
    - **Tick Marks**: Rendered by the `TickMark` component. Major ticks appear every 0.05 speed units with labels, and smaller minor ticks appear in between. The settled tick is highlighted in indigo.
    - **Ruler Fade Effect**: A horizontal `LinearGradient` overlay is applied to the ruler. It fades from semi-transparent background color at the edges to fully transparent in the center, subtly de-emphasizing ticks further away from the selected value.
    - **Preset Buttons**: Circular buttons below the ruler allow direct selection of common speed values (0.80, 0.85, 0.90, 0.95, 1.00).

3.  **Interaction Modes & Animations**:
    - **Dragging**: The user can pan horizontally on the ruler using the `Pan` gesture. The ruler translates smoothly, clamped within the defined `minValue` and `maxValue` boundaries. The main display value updates continuously.
    - **Flicking (Decay Animation)**: If the user releases the drag gesture with sufficient velocity (`> LOW_VELOCITY_THRESHOLD`), handled in `panGesture.onEnd`, the ruler continues to slide with decaying momentum (`withDecay`) until it stops naturally or hits a boundary. The main display value updates during the decay. The parent is notified via `onValueChange` only after the decay settles.
    - **Tapping / Slow Release (Finalize State)**: If the user releases the drag gesture with low velocity or simply taps the ruler, the `panGesture.onFinalize` callback is triggered. If the final velocity is below `LOW_VELOCITY_THRESHOLD`, it schedules the transition back to the 'stopped' visual state (indigo color) via `markAsStoppedAfterDelay`. The value snapped to in `onBegin` is the one reported to the parent.
    - **Preset Button Press**:
      - _Different Value_: Pressing a preset button with a value different from the current one triggers the parent's `onValueChange`, which updates the `value` prop. This causes the `useEffect` hook to run, animating the slider to the new position with a spring (`withSpring`).
      - _Same Value_: If the pressed preset value is the same as the current `value`, the `useEffect` hook won't run. Instead, `handlePresetPress` directly sets `isMovingShared` to true (turning the text black) and immediately schedules `markAsStoppedAfterDelay` to return it to the stopped state (indigo color), creating a brief flash effect.
    - **Touch Down Interruption (Snap)**: If the user touches the ruler (`panGesture.onBegin`) while it's animating (decay or spring), the animation stops immediately (`cancelAnimation`), the slider snaps to the nearest 0.01 value at the touch point, and the parent is notified of this new value via `onValueChange`. `isMovingShared` is set to true.

4.  **Visual Feedback**:
    - **Real-time Value Update & Color Change**: The main text display (`AnimatedTextInput`) updates continuously during drags, flicks, and snaps, driven by `useAnimatedReaction` and `useDerivedValue`. The color of this text changes: it is **black** while the user is interacting with the slider or while an animation (decay/spring) is in progress (`isMovingShared` is true), and turns **indigo (`#4f46e5`)** only when the slider has settled on a final value (`isMovingShared` is false). This provides a clear visual distinction between an actively changing value and a selected one.
    - **Settled Tick Highlight**: When the slider comes to a complete stop (after decay, spring, or tap finalization finishes), the specific `TickMark` (and its label, if major) corresponding to the final settled value (`currentValueShared`) changes color to indigo (`#4f46e5`). This state is managed by `currentValueShared` and `isMovingShared`.
    - **Highlight Reset**: As soon as the user starts a new drag or a new animation begins (i.e., `isMovingShared` becomes true), the highlighted tick reverts to its default color (black/gray), and the main display text turns black.
    - **Preset Button Opacity**: Preset buttons become slightly transparent (`opacity: 0.7`) while being pressed, providing immediate touch feedback.
    - **Delayed Stop State**: A small delay (`setTimeout` in `markAsStoppedAfterDelay`) is used before setting `isMovingShared` to `false` after an animation or gesture completes. This prevents the tick highlight and text color from flickering off and on again too quickly if another interaction starts immediately.

5.  **Haptic Feedback**:
    - **Tick Crossing**: A light haptic feedback (`Haptics.ImpactFeedbackStyle.Light`) is triggered via `useAnimatedReaction` whenever the slider crosses a 0.05 boundary (e.g., passing 0.80, 0.85, 0.90) during dragging or decay.
    - **Preset Press**: A medium haptic feedback (`Haptics.ImpactFeedbackStyle.Medium`) is triggered when a preset button is pressed.

This combination of animations, visual feedback, and haptics aims to create a responsive, intuitive, and polished speed selection experience.
