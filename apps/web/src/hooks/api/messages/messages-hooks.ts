import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dispatch, RefObject, SetStateAction } from 'react'
import type { Message } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'
import { TextareaRef } from '@/components/design-system/textarea'
import { getConfig } from '@/config/environment-config'
import { orpcClient, orpcQuery } from '@/transport/our-backend/orpc-client'
import { useLingui } from '@lingui/react/macro'

type MessagesResponse = Awaited<ReturnType<typeof orpcClient.messages.getMessages>>

const initialMessagesCursor: string | undefined = undefined

const getConversationMessagesInput = (pageParam: string | undefined) => ({
  cursor: pageParam,
  limit: Number(getConfig().paginationLimit),
})

const getConversationMessagesQueryKey = () =>
  orpcQuery.messages.getMessages.infiniteKey({
    input: getConversationMessagesInput,
    initialPageParam: initialMessagesCursor,
  })

export const useCreateMessage = (
  inputRef: RefObject<TextareaRef | null>,
  setMessageInput: Dispatch<SetStateAction<string>>
) => {
  const queryClient = useQueryClient()
  const queryKey = getConversationMessagesQueryKey()

  return useMutation(
    orpcQuery.messages.createMessage.mutationOptions({
      onMutate: async (newMessage) => {
        await queryClient.cancelQueries({ queryKey })

        const optimisticMessage: Message = {
          id: Date.now(),
          content: newMessage.content,
          role: newMessage.role,
          created_at: new Date().toISOString(),
          language: newMessage.studyLanguage,
          isDeleted: false,
        }

        queryClient.setQueryData<InfiniteData<MessagesResponse>>(queryKey, (old) => {
          if (!old) return old

          const newPages = [...old.pages]
          const lastPage = newPages[newPages.length - 1]

          if (lastPage) {
            newPages[newPages.length - 1] = {
              ...lastPage,
              data: {
                ...lastPage.data,
                messages: [optimisticMessage, ...lastPage.data.messages],
              },
            }
          }

          return {
            ...old,
            pages: newPages,
          }
        })

        setMessageInput('')
        inputRef.current?.resetHeight()

        return { optimisticMessage }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey })
      },
    })
  )
}

export const useSoftDeleteMessage = (onOpenChange: (open: boolean) => void) => {
  const { t } = useLingui()

  const queryClient = useQueryClient()
  const queryKey = getConversationMessagesQueryKey()

  return useMutation(
    orpcQuery.messages.softDeleteMessage.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey })
        onOpenChange(false)
      },
      meta: {
        successMessage: t`Message deleted successfully`,
        errorMessage: t`Error deleting message`,
      },
    })
  )
}

export const useGetMessages = () => {
  const { t } = useLingui()

  return useInfiniteQuery(
    orpcQuery.messages.getMessages.infiniteOptions({
      input: getConversationMessagesInput,
      initialPageParam: initialMessagesCursor,
      getNextPageParam: (lastPage) => lastPage.data?.nextCursor,
      staleTime: 0,
      meta: {
        errorMessage: t`Error when retrieving messages`,
      },
    })
  )
}
