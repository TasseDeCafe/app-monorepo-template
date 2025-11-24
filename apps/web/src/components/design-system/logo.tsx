import React from 'react'
import colors from 'tailwindcss/colors'

interface LogoProps {
  size?: number
  inverted?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 55, inverted = false, className = '' }) => {
  const fillColor = inverted ? colors.white : colors.indigo[600]
  const strokeColor = inverted ? colors.indigo[600] : colors.indigo[50]

  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M60 120C93.1371 120 120 93.1371 120 60C120 26.8629 93.1371 0 60 0C26.8629 0 0 26.8629 0 60C0 72.0947 3.57861 83.3535 9.73473 92.7755C5.07848 102.599 5.4814 110.841 8 113C10.5186 115.159 14.7142 118.126 28.1233 110.841C37.359 116.644 48.2876 120 60 120Z'
        fill={fillColor}
      />
      <path
        d='M104 60.6383C101.824 60.6383 101.381 60.6383 95.3526 60.6383M16 60.6383C18.0979 60.6383 22.1641 60.6383 24.1387 60.6383M38.3815 40.2128V60.6383M38.3815 60.6383C31.1463 60.6383 32.7639 60.6383 24.1387 60.6383M38.3815 60.6383V81.3616M38.3815 60.6383C42.0554 60.6383 48.2153 60.6383 52.6243 60.6383M24.1387 60.6383V50.4255M24.1387 60.6383V70.8511M52.6243 60.6383V30M52.6243 60.6383V90M52.6243 60.6383C56.9698 60.6383 62.4085 60.6383 66.8671 60.6383M66.8671 50.4255V60.6383M66.8671 60.6383V70.8511M66.8671 60.6383C71.598 60.6383 76.6051 60.6383 81.1098 60.6383M81.1098 60.6383V40.2128M81.1098 60.6383V81.0638M81.1098 60.6383C83.2036 60.6383 89.2737 60.6383 95.3526 60.6383M95.3526 60.6383V50.4255M95.3526 60.6383V70.8511'
        stroke={strokeColor}
        strokeWidth='8'
        strokeLinecap='round'
      />
    </svg>
  )
}
