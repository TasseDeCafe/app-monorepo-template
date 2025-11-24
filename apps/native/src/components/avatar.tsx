import { useState } from 'react'
import { View, Image, Text } from 'react-native'
import colors from 'tailwindcss/colors'

type AvatarProps = {
  initials: string
  url: string
  size?: number
}

export const Avatar = ({ initials, url, size = 40 }: AvatarProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hadError, setHadError] = useState(false)

  const hasValidUrl = url && url.trim().length > 0

  const fontSize = Math.max(Math.floor(size * 0.4), 10)
  const borderWidth = Math.max(Math.floor(size * 0.05), 1)

  return (
    <View
      className='relative flex items-center justify-center overflow-hidden rounded-xl'
      style={{
        width: size,
        height: size,
        borderWidth: borderWidth,
        borderColor: colors.indigo[500],
      }}
    >
      {hasValidUrl && !hadError && (
        <Image
          source={{ uri: url }}
          className={`z-10 rounded-xl ${imageLoaded ? 'flex' : 'hidden'}`}
          style={{ width: size, height: size }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setHadError(true)}
        />
      )}
      {(!hasValidUrl || !imageLoaded || hadError) && (
        <View
          className='flex items-center justify-center rounded-xl'
          style={{
            width: size,
            height: size,
            backgroundColor: '#4F46E5',
          }}
        >
          <Text
            className='font-semibold text-white'
            style={{
              fontSize: fontSize,
              textShadowColor: 'rgba(0, 0, 0, 0.3)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }}
          >
            {initials}
          </Text>
        </View>
      )}
    </View>
  )
}
