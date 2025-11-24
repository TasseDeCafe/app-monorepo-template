import { DialectCode, LangCode } from '@yourbestaccent/core/constants/lang-codes'
import { dialectCodeToDialectName, langCodeToLanguageName } from '../../../../../utils/lang-code-utils'
import { logWithSentry } from '../../../sentry/error-monitoring'
import { getLlmReplyWithFallback } from '../generic-llm-utils'
import { TRANSLATE_WORD_PROVIDER_CONFIG } from '../llm-configs'

const buildTranslateSelectionPrompt = (
  sourceDialect: DialectCode,
  targetLang: LangCode,
  originalSentence: string,
  translationSentence: string,
  selectionChunks: string[],
  selectionPositions: number[]
): string => {
  // Highlight the selected chunks in the original sentence using angle brackets
  let highlightedSentence = originalSentence
  const chunksWithPositions = selectionChunks
    .map((chunk, index) => ({ chunk, position: selectionPositions[index] }))
    .sort((a, b) => b.position - a.position) // Sort by position descending to avoid position shifts

  // Replace chunks from right to left to avoid position shifts
  for (const { chunk, position } of chunksWithPositions) {
    const before = highlightedSentence.substring(0, position)
    const after = highlightedSentence.substring(position + chunk.length)
    highlightedSentence = before + `<${chunk}>` + after
  }

  const chunksText = selectionChunks.join(' + ')

  return `Translate the following selected parts from ${dialectCodeToDialectName(sourceDialect)} to ${langCodeToLanguageName(targetLang)}.

${dialectCodeToDialectName(sourceDialect)} sentence: "${highlightedSentence}"
${langCodeToLanguageName(targetLang)} translation: "${translationSentence}"
Selected parts: ${chunksText}

The selected parts are highlighted with angle brackets <> in the ${dialectCodeToDialectName(sourceDialect)} sentence. These parts may not be adjacent or form a complete phrase.

Use the provided ${langCodeToLanguageName(targetLang)} translation as reference to ensure consistency in your translation of the selected parts. The goal is to translate the selected parts in a way that matches the style and word choices used in the complete translation.

Provide the translation of only the selected parts. If the selected parts are unconnected, separate them with " ... " (space-ellipsis-space) to indicate they are separate chunks.

Output only the translation in ${langCodeToLanguageName(targetLang)}, without any explanations or quotation marks.`
}

export const translateSelection = async (
  originalSentence: string,
  translationSentence: string,
  selectionChunks: string[],
  selectionPositions: number[],
  sourceDialect: DialectCode,
  targetLanguage: LangCode
): Promise<string | null> => {
  const prompt = buildTranslateSelectionPrompt(
    sourceDialect,
    targetLanguage,
    originalSentence,
    translationSentence,
    selectionChunks,
    selectionPositions
  )
  const response: string | null = await getLlmReplyWithFallback(prompt, TRANSLATE_WORD_PROVIDER_CONFIG)
  if (response === null) {
    logWithSentry({
      message: 'getLlmReply error for translateSelection',
      params: {
        sourceDialect,
        targetLanguage,
        selectionChunks,
        llmConfig: TRANSLATE_WORD_PROVIDER_CONFIG,
      },
    })
  }
  return response
}
