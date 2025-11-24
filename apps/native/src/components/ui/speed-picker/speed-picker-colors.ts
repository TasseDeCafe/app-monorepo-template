import { indigo, gray } from 'tailwindcss/colors'

// Only include the colors actually used in the speed picker
// When a worklet references the entire colors object from Tailwind,
// the entire object gets serialized and transferred to the UI thread,
// including all the deprecated color objects. In order to avoid this problem,
// we only include the colors used in the speed picker.
export const pickerColors = {
  indigo,
  gray,
  black: '#000000',
}
