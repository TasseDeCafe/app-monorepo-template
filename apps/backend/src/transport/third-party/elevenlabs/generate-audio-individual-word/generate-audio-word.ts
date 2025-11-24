import { LangCode, SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes'
import axios from 'axios'
import { GenerateAudioResponseBody } from '../types'
import { getConfig } from '../../../../config/environment-config'
import { logCustomErrorMessageAndError, logMessage } from '../../sentry/error-monitoring'
import stream from 'stream'
import ffmpeg from 'fluent-ffmpeg'

const languageSlowdownPromptMap: Record<SupportedStudyLanguage, string> = {
  [LangCode.ENGLISH]: 'In English, slowly: ',
  [LangCode.SPANISH]: 'En español, lentamente: ',
  [LangCode.FRENCH]: 'En français, lentement: ',
  [LangCode.GERMAN]: 'Auf Deutsch, langsam: ',
  [LangCode.ITALIAN]: 'In italiano, lentamente: ',
  [LangCode.POLISH]: 'Po polsku, powoli: ',
  [LangCode.PORTUGUESE]: 'Em português, lentamente: ',
  [LangCode.RUSSIAN]: 'По-русски, медленно: ',
  [LangCode.UKRAINIAN]: 'Українською, повільно: ',
  [LangCode.CZECH]: 'Česky, pomalu: ',
  [LangCode.DANISH]: 'På dansk, langsomt: ',
  [LangCode.DUTCH]: 'In het Nederlands, langzaam: ',
  [LangCode.FINNISH]: 'Suomeksi, hitaasti: ',
  [LangCode.INDONESIAN]: 'Dalam bahasa Indonesia, perlahan: ',
  [LangCode.MALAY]: 'Dalam bahasa Melayu, perlahan: ',
  [LangCode.ROMANIAN]: 'În română, încet: ',
  [LangCode.SLOVAK]: 'Po slovensky, pomaly: ',
  [LangCode.SWEDISH]: 'På svenska, långsamt: ',
  [LangCode.TURKISH]: 'Türkçe, yavaşça: ',
  [LangCode.HUNGARIAN]: 'Magyarul, lassan: ',
  [LangCode.NORWEGIAN]: 'På norsk, sakte: ',
}

export const generateAudioWord = async (
  word: string,
  voiceId: string,
  language: SupportedStudyLanguage
): Promise<Uint8Array | null> => {
  const fullText = `${languageSlowdownPromptMap[language]} "${word}"`

  const data = {
    text: fullText,
    model_id: 'eleven_turbo_v2_5',
    language_code: language,
    voice_settings: {
      stability: 0.8,
      similarity_boost: 0.8,
      use_speaker_boost: true,
      speed: 0.85,
    },
  }

  try {
    const response = await axios.post<GenerateAudioResponseBody>(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': getConfig().elevenlabsApiKey,
        },
      }
    )

    const { audio_base64, alignment } = response.data
    const fullAudioBuffer = Buffer.from(audio_base64, 'base64')

    const quoteStartIndex = alignment.characters.findIndex((char) => char === '"')
    if (quoteStartIndex === -1) {
      logMessage(
        `generateAudioWord - couldn't find opening quote in alignment data. ` +
          `Word: ${word}, Full text: ${fullText}, Characters: ${alignment.characters.join('')}`
      )
      return null
    }

    // Find the word after the quotation mark
    const wordStartIndex = quoteStartIndex + 1
    const expectedWordEnd = wordStartIndex + word.length

    const foundWord = alignment.characters.slice(wordStartIndex, expectedWordEnd).join('').toLowerCase()
    if (foundWord !== word.toLowerCase()) {
      logMessage(
        `generateAudioWord - word after quote doesn't match expected word. ` +
          `Expected: ${word}, Found: ${foundWord}, Full text: ${fullText}, Characters: ${alignment.characters.join('')}`
      )
      return null
    }

    const wordStartTime = alignment.character_start_times_seconds[wordStartIndex]
    const wordEndTime = alignment.character_end_times_seconds[expectedWordEnd - 1]

    const startTime = Math.max(0, wordStartTime)
    const duration = wordEndTime - startTime + 0.3

    const inputStream = new stream.Readable()
    inputStream.push(fullAudioBuffer)
    inputStream.push(null)

    const outputStream = new stream.PassThrough()
    const chunks: Buffer[] = []

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputStream)
        .inputFormat('mp3')
        .setStartTime(startTime)
        .setDuration(duration)
        .format('mp3')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .pipe(outputStream, { end: true })

      outputStream.on('data', (chunk) => chunks.push(chunk))
    })

    const extractedAudio = Buffer.concat(chunks)
    return new Uint8Array(extractedAudio)
  } catch (error) {
    logCustomErrorMessageAndError(
      `generateAudioWord - error. Params: word - ${word}, voiceId - ${voiceId}, language - ${language}`,
      error
    )
    return null
  }
}
