import { Text, TouchableOpacity, View } from 'react-native'
import { Download, Pause, Play, Volume2, VolumeX } from 'lucide-react-native'
import colors from 'tailwindcss/colors'

type AudioPlayerControlsProps = {
  isLoading: boolean
  audioUri: string | null
  isPlaying: boolean
  isMuted: boolean
  playbackRate: number
  title?: string
  togglePlay: () => void
  toggleMute: () => void
  handlePressSpeed: () => void
  handleDownload: () => void
}

export const AudioPlayerControls = ({
  isLoading,
  audioUri,
  isPlaying,
  isMuted,
  playbackRate,
  title,
  togglePlay,
  toggleMute,
  handlePressSpeed,
  handleDownload,
}: AudioPlayerControlsProps) => {
  return (
    <View className='flex-row items-center justify-between'>
      {/* Left Controls: Play/Pause, Mute/Unmute */}
      <View className='flex-row items-center gap-2'>
        <TouchableOpacity
          onPress={togglePlay}
          disabled={isLoading || !audioUri}
          className='h-10 w-10 items-center justify-center'
        >
          {isPlaying ? <Pause size={24} color='#333' /> : <Play size={24} color='#333' />}
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMute} className='h-10 w-10 items-center justify-center'>
          {isMuted ? <VolumeX size={24} color='#333' /> : <Volume2 size={24} color='#333' />}
        </TouchableOpacity>
      </View>

      {/* Title (Centered) */}
      {title && (
        <View className='absolute left-1/2 -translate-x-1/2'>
          <Text className='text-base text-gray-500'>{title}</Text>
        </View>
      )}

      {/* Right Controls: Speed, Download */}
      <View className='flex-row items-center gap-2'>
        <TouchableOpacity onPress={handlePressSpeed}>
          <Text className='text-base font-medium text-gray-700'>{playbackRate.toFixed(2)}x</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={isLoading || !audioUri}
          className='h-10 w-10 items-center justify-center'
        >
          <Download size={24} color={isLoading || !audioUri ? colors.gray[400] : colors.gray[700]} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
