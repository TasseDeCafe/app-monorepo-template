import { memo, useEffect, useRef } from 'react'
import { BotMessageActions } from './bot-message-actions.tsx'
import { UserMessageActions } from './user-message-actions'
import { Message } from '@yourbestaccent/api-client/orpc-contracts/messages-contract.ts'
import { DeletedMessage } from './atoms/deleted-message.tsx'
import { BotMessageText } from './molecules/bot-message-text.tsx'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'

const messageStyles = {
  base: 'w-full break-words rounded-xl px-2 py-2 md:px-4',
  deleted: 'bg-white-100 border',
  user: 'bg-blue-500 text-white',
  bot: 'border bg-white text-gray-900',
} as const

export const ConversationMessages = memo(({ messages }: { messages: Message[] }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className='flex flex-1 flex-col gap-y-2 overflow-y-auto md:gap-y-4 md:p-4'>
      {messages.map((message: Message) => (
        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
          <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
            <div
              className={cn(messageStyles.base, {
                [messageStyles.deleted]: message.isDeleted,
                [messageStyles.user]: !message.isDeleted && message.role === 'user',
                [messageStyles.bot]: !message.isDeleted && message.role === 'bot',
              })}
            >
              {message.isDeleted ? (
                <DeletedMessage />
              ) : message.role === 'bot' ? (
                <BotMessageText content={message.content} messageLanguage={message.language} />
              ) : (
                message.content
              )}
            </div>
            {!message.isDeleted &&
              (message.role === 'bot' ? (
                <BotMessageActions botMessage={message} />
              ) : (
                <UserMessageActions message={message} />
              ))}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
})
