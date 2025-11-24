import React, { useEffect, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Download } from 'lucide-react-native'
import { processAudioSource, shareAudioFile } from '@/components/ui/audio-player/audio-utils'
import { useIsFetching } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import colors from 'tailwindcss/colors'

type DownloadButtonProps = {
  audioUri: string | null
  fileName: string
}

export const DownloadButton = ({ audioUri, fileName }: DownloadButtonProps) => {
  const [processedAudioUri, setProcessedAudioUri] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const isFetchingAudio = useIsFetching({
    queryKey: [QUERY_KEYS.AUDIO_INDIVIDUAL_WORD],
  })

  useEffect(() => {
    processAudioSource(audioUri, fileName, setProcessedAudioUri, setIsProcessing).then()
  }, [audioUri, fileName])

  const handleDownload = async () => {
    await shareAudioFile(processedAudioUri, fileName)
  }

  const isLoading = isProcessing || !!isFetchingAudio

  return (
    <TouchableOpacity
      onPress={handleDownload}
      disabled={isLoading || !processedAudioUri}
      className='h-10 w-10 items-center justify-center rounded-full hover:bg-gray-200'
    >
      <Download size={24} color={isLoading || !processedAudioUri ? colors.gray[400] : colors.gray[700]} />
    </TouchableOpacity>
  )
}
