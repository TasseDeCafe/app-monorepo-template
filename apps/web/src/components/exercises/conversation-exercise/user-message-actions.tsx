import { CircleHelp, Copy, MoreVertical, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry.ts'
import { MessageActionButton } from './message-action-button'
import { useSelector } from 'react-redux'
import {
  selectDialectOrDefaultDialectOrEnglishDefaultDialect,
  selectMotherLanguageOrEnglish,
} from '@/state/slices/account-slice.ts'
import { Popover, PopoverContent, PopoverTrigger } from '../../shadcn/popover.tsx'
import { DropdownMenu, DropdownMenuTrigger } from '../../shadcn/dropdown.tsx'
import { MessageDropdown } from './atoms/message-dropdown.tsx'
import { NonDeletedUserMessage } from '@yourbestaccent/api-client/orpc-contracts/messages-contract.ts'
import { useGrammarCorrection } from '@/hooks/api/grammar-correction/grammar-correction-hooks'
import { useLingui } from '@lingui/react/macro'

interface UserMessageActionsProps {
  message: NonDeletedUserMessage
}

export const UserMessageActions = ({ message }: UserMessageActionsProps) => {
  const { t } = useLingui()

  const [isGrammarVisible, setIsGrammarVisible] = useState(false)
  const dialect = useSelector(selectDialectOrDefaultDialectOrEnglishDefaultDialect)
  const motherLanguage = useSelector(selectMotherLanguageOrEnglish)

  const { data: grammarData, isFetching: isCheckingGrammar } = useGrammarCorrection(
    message.content,
    motherLanguage,
    message.language,
    dialect,
    isGrammarVisible
  )

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      toast.info(t`Message copied to clipboard`)
    } catch (err) {
      logWithSentry('Failed to copy message', err)
    }
  }

  const handleGrammarCheck = () => {
    setIsGrammarVisible(!isGrammarVisible)
  }

  return (
    <>
      {isGrammarVisible && grammarData?.correction && (
        <div className='ml-4 mt-1 cursor-pointer text-xs'>
          <div className='flex items-center gap-2'>
            <div className='text-gray-600'>{grammarData.correction}</div>
            {grammarData.explanation && (
              <Popover>
                <PopoverTrigger>
                  <CircleHelp className='h-4 w-4 text-stone-400' />
                </PopoverTrigger>
                <PopoverContent className='bg-white text-sm shadow-lg'>{grammarData.explanation}</PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      )}
      <div className='mt-1 flex flex-row justify-end gap-x-1 md:mt-2 md:gap-x-2'>
        <MessageActionButton onClick={handleCopyMessage} title={t`Copy message`} Icon={Copy} />
        <MessageActionButton
          onClick={handleGrammarCheck}
          title={isGrammarVisible ? t`Hide grammar` : t`Check grammar`}
          Icon={Wrench}
          isLoading={isCheckingGrammar}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='flex h-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
              <MoreVertical className='h-4 w-4' />
            </button>
          </DropdownMenuTrigger>
          <MessageDropdown messageId={message.id} />
        </DropdownMenu>
      </div>
    </>
  )
}
