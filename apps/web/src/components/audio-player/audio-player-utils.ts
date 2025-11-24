export const base64ToBlob = (base64String: string, contentType: string = 'audio/mpeg') => {
  // Decode the Base64 string to a binary string
  const binaryString = window.atob(base64String)

  const len = binaryString.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return new Blob([bytes], { type: contentType })
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const handleDownload = (audio: string | Blob, filename: string = 'audio'): void => {
  let blob: Blob
  let fileExtension: string
  if (typeof audio === 'string') {
    blob = base64ToBlob(audio)
    fileExtension = 'mp3'
  } else {
    blob = audio
    fileExtension = 'webm'
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.${fileExtension}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const getSupportedMimeType = () => {
  // the below comment was added on 2024-10-06
  // When this array was in a different order: ['audio/ogg', 'audio/mp4', 'audio/webm']
  // on both my xiaomi and my macbook firefox' recorded audio caused the appearance of
  // 'live' in the player, and the time slider did not work. Firefox supports boh audio/webm and audio/ogg, but only the
  // second one did not make 'live' appear in the player, so I changed the order to the below one
  // desktop safari and chrome use audio/mp4
  const types = ['audio/ogg', 'audio/mp4', 'audio/webm']
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return null
}

export const sanitizeTextForFileName = (text: string) => {
  return text
    .replace(/[<>:"/\\|?*]/g, '-') // Remove invalid Windows/Unix chars
    .replace(/\s+/g, '-') // Replace whitespace with dashes
    .replace(/^\.+/, '') // Remove leading periods
    .replace(/\.+$/, '') // Remove trailing periods
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '')
}

export const createFilename = (prefix: string, text: string) => {
  // Replace invalid filename characters with dashes
  const sanitized = sanitizeTextForFileName(text)
  const truncated = sanitized.substring(0, 20)
  return `${prefix}--${truncated}${sanitized.length > 20 ? '...' : ''}`
}

const padNumber = (num: number): string => num.toString().padStart(2, '0')

export const formatTime = (timeInSeconds: number): string => {
  if (!isFinite(timeInSeconds) || timeInSeconds < 0) return '0:00'

  const hours = Math.floor(timeInSeconds / 3600)
  const minutes = Math.floor((timeInSeconds % 3600) / 60)
  const seconds = Math.floor(timeInSeconds % 60)

  if (hours > 0) {
    return `${hours}:${padNumber(minutes)}:${padNumber(seconds)}`
  }

  return `${minutes}:${padNumber(seconds)}`
}
