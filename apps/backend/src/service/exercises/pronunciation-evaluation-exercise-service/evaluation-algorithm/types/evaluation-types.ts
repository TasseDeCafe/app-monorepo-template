export type WordIndicesPair = [number, number]

export type ActualWordWithConfidenceAndAlignment = {
  actualWord: string
  confidence: number
  // the below come from Deepgram
  actualStartTimeInSeconds: number
  actualEndTimeInSeconds: number
}

export type WordPair = {
  expectedWord: string | null
  actualWord: string | null
  actualStartTimeInSeconds: number | null
  actualEndTimeInSeconds: number | null
  confidence: number | null
}

export type WordPairWithAlignment = WordPair & {
  // the below come from elevenlabs
  expectedStartTimeInMs: number | null
  expectedEndTimeInMs: number | null
}
