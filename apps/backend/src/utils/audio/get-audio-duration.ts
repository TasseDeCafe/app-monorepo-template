import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'
import ffmpeg from 'fluent-ffmpeg'

import { logWithSentry } from '../../transport/third-party/sentry/error-monitoring'
import { UploadedFile } from '../../types/uploaded-file'

const MIME_TYPE_EXTENSION_MAP: Record<string, string> = {
  'audio/webm': '.webm',
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/ogg': '.ogg',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/m4a': '.m4a',
  'audio/mp4': '.mp4',
  'audio/aac': '.aac',
}

export const _getExtensionFromMimeType = (mimeType?: string): string => {
  if (!mimeType) {
    return ''
  }

  // Strip codec parameters (e.g., "audio/webm;codecs=opus" -> "audio/webm")
  const normalizedMimeType = mimeType.toLowerCase().split(';')[0].trim()
  return MIME_TYPE_EXTENSION_MAP[normalizedMimeType] ?? ''
}

const createTemporaryFilePath = (mimeType?: string): string => {
  const extension = _getExtensionFromMimeType(mimeType)
  return join(tmpdir(), `yba-audio-${randomUUID()}${extension}`)
}

export const getAudioDurationInSeconds = async (audioFile: UploadedFile): Promise<number | null> => {
  //todo: find a way to remove the fluent-ffmpeg dependency which is deprecated
  const tempFilePath = createTemporaryFilePath(audioFile.mimetype)

  const audioAttachment = {
    filename: audioFile.originalname ?? 'audio-upload-for-get-audio-duration',
    data: audioFile.buffer,
    contentType: audioFile.mimetype,
  }

  const baseLogParams = {
    mimetype: audioFile.mimetype ?? 'unknown',
    originalname: audioFile.originalname ?? 'unknown',
    audioSizeInBytes: audioFile.buffer.length,
    tempFilePath,
  }

  try {
    await fs.writeFile(tempFilePath, audioFile.buffer)

    return await new Promise<number | null>((resolve) => {
      // based on https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#ffprobe
      ffmpeg.ffprobe(tempFilePath, (error, metadata) => {
        if (error) {
          logWithSentry({
            message: 'ffprobe failed',
            params: baseLogParams,
            error,
            attachments: audioAttachment,
          })
          resolve(null)
          return
        }

        const seconds = metadata?.format?.duration
        if (typeof seconds === 'number' && !Number.isNaN(seconds) && seconds > 0) {
          resolve(seconds)
          return
        }

        // Duration metadata is missing/incorrect (common with WebM from browser MediaRecorder)
        // If ffprobe succeeded and we have valid audio streams, accept the file anyway
        // This should be fixed in newer versions of Chrome: https://issues.chromium.org/issues/40482588
        if (metadata?.streams?.length && metadata.streams.some((stream) => stream.codec_type === 'audio')) {
          logWithSentry({
            message: 'duration unavailable but file has valid audio streams, accepting',
            params: {
              ...baseLogParams,
              formatName: metadata?.format?.format_name ?? 'unknown',
              formatLongName: metadata?.format?.format_long_name ?? 'unknown',
              audioStreams: metadata.streams.filter((s) => s.codec_type === 'audio').length,
            },
            isInfoLevel: true,
          })
          // Return a large value to pass duration validation
          // ElevenLabs/Deepgram will do its own validation on the actual audio
          resolve(999)
          return
        }

        // File is invalid - no audio streams found
        logWithSentry({
          message: 'no valid audio streams found',
          params: {
            ...baseLogParams,
            formatName: metadata?.format?.format_name ?? 'unknown',
            formatLongName: metadata?.format?.format_long_name ?? 'unknown',
            hasStreams: !!metadata?.streams?.length,
            durationValue: String(seconds),
          },
          attachments: audioAttachment,
        })
        resolve(null)
      })
    })
  } catch (error) {
    logWithSentry({
      message: 'failed to write temp file',
      params: baseLogParams,
      error,
      attachments: audioAttachment,
    })
    return null
  } finally {
    await fs.unlink(tempFilePath).catch(() => {
      // noop - best-effort cleanup
    })
  }
}
