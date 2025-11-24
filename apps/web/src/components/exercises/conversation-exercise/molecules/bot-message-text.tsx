import { ClickableBotMessageWord } from '../atoms/clickable-bot-message-word.tsx'
import { SupportedStudyLanguage } from '@yourbestaccent/core/constants/lang-codes.ts'
import { isOnlyPunctuationOrEmojiOrWhiteSpace } from '@yourbestaccent/core/utils/text-utils.ts'

export const BotMessageText = ({
  content,
  messageLanguage,
}: {
  content: string
  messageLanguage: SupportedStudyLanguage
}) => {
  const words = content.split(' ')
  return words.map((word, index) => {
    return (
      <span key={index}>
        {isOnlyPunctuationOrEmojiOrWhiteSpace(word) ? (
          word
        ) : (
          <ClickableBotMessageWord
            word={word}
            contextWords={words}
            wordIndex={index}
            messageLanguage={messageLanguage}
          />
        )}
        {index < words.length - 1 ? ' ' : ''}
      </span>
    )
  })
}
