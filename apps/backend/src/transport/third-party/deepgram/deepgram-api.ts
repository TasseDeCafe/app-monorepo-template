import { transcribe, TranscriptionResult } from './transcribe/transcribe'
import { mockTranscribe } from './transcribe/mock-transcribe'
import { UploadedFile } from '../../../types/uploaded-file'

export interface DeepgramApi {
  transcribe: (audioFile: UploadedFile, deepgramLangCode: string) => Promise<TranscriptionResult>
}

export const RealDeepgramApi: DeepgramApi = {
  transcribe,
}

export const MockDeepgramApi: DeepgramApi = {
  transcribe: mockTranscribe,
}
