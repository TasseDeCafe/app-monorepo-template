import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// copied from shadcn's https://ui.shadcn.com/docs/installation/manual
// according to claude it could help us to avoid subtle bugs with tailwind style collisions, like when an element
// has 2 styles like text-sm and text-md, the last one should be applied, but without twMerge it's not always the case
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const withOpacity = (hexColor: string, opacity = 0) => {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
