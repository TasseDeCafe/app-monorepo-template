import stream from 'stream'
import ffmpeg from 'fluent-ffmpeg'
import { logCustomErrorMessageAndError } from '../third-party/sentry/error-monitoring'

export const convertAudio = async (audio: string, fromFormat: string, toFormat: string): Promise<string | null> => {
  try {
    const base64Data = audio.replace(/^data:audio\/\w+;base64,/, '')
    const inputBuffer = Buffer.from(base64Data, 'base64')

    const inputStream = new stream.Readable()
    inputStream.push(inputBuffer)
    inputStream.push(null)

    const outputStream = new stream.PassThrough()

    const conversionPromise = new Promise((resolve, reject) => {
      ffmpeg(inputStream)
        .inputFormat(fromFormat)
        .format(toFormat)
        .on('error', (err) => {
          reject(err)
        })
        .on('end', () => {
          resolve(null)
        })
        .pipe(outputStream, { end: true })
    })

    const chunks: Buffer[] = []
    outputStream.on('data', (chunk) => {
      chunks.push(chunk)
    })

    await conversionPromise

    const outputBuffer = Buffer.concat(chunks)
    return outputBuffer.toString('base64')
  } catch (error) {
    logCustomErrorMessageAndError(
      `Error converting audio. Audio size = ${audio.length}, fromFormat = ${fromFormat}, toFormat = ${toFormat}`,
      error
    )
    return null
  }
}
