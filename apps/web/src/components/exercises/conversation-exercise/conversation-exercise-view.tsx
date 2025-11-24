import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { POSTHOG_EVENTS } from '@/analytics/posthog/posthog-events.ts'
import { BigCard } from '../../design-system/big-card'
import { Button } from '../../design-system/button'
import { ROUTE_PATHS } from '@/routing/route-paths.ts'
import { ArrowLeft, SendHorizontal } from 'lucide-react'
import { ConversationMessages } from './conversation-messages'
import { SquaresLoader } from '../../loader/squares-loader'
import { PersonalityCode } from '@yourbestaccent/api-client/orpc-contracts/messages-contract'
import { useCreateMessage, useGetMessages } from '@/hooks/api/messages/messages-hooks'
import { CompactAudioRecorder } from '../../audio-recorder/compact-audio-recorder.tsx'
import { WithFixedNavbar } from '../../navbar/with-fixed-navbar.tsx'
import { selectMotherLanguageOrEnglish, selectStudyLanguageOrEnglish } from '@/state/slices/account-slice.ts'
import { useTranscribeAudioToText } from '@/hooks/api/audio-transcription/audio-transcription-hooks'
import { useDispatch, useSelector } from 'react-redux'
import { useSimpleAudioRecorder } from '@/hooks/audio/use-simple-audio-recorder.ts'
import { ConversationExerciseControls } from './controls/conversation-exercise-controls'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer.ts'
import { selectPersonality, selectVoiceOption } from '@/state/slices/conversation-exercise-slice.ts'
import { Textarea, TextareaRef } from '@/components/design-system/textarea'
import { modalActions } from '@/state/slices/modal-slice'
import { AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID } from '@/components/modal/modal-ids'
import { toast } from 'sonner'
import { ORPCError } from '@orpc/client'
import { isAudioTooShortErrorPayload } from '@yourbestaccent/api-client/utils/audio-error-utils'
import { useLingui } from '@lingui/react/macro'

export const ConversationExerciseView = () => {
  const { t } = useLingui()

  const [messageInput, setMessageInput] = useState('')
  const inputRef = useRef<TextareaRef>(null)
  const { isRecording, startRecording, stopRecording, recording, resetAudioRecorder } = useSimpleAudioRecorder()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const scrollHeightRef = useRef<number>(0)
  const dispatch = useDispatch()
  const motherLanguage = useSelector(selectMotherLanguageOrEnglish)
  const studyLanguage = useSelector(selectStudyLanguageOrEnglish)
  const personality: PersonalityCode | null = useSelector(selectPersonality)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const voiceOption = useSelector(selectVoiceOption)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending: isFetchingFirstPage } = useGetMessages()

  useEffect(() => {
    POSTHOG_EVENTS.viewPage()
  }, [])

  useEffect(() => {
    if (messagesContainerRef.current && scrollHeightRef.current) {
      const newScrollHeight = messagesContainerRef.current.scrollHeight
      const diff = newScrollHeight - scrollHeightRef.current
      messagesContainerRef.current.scrollTop = diff
      scrollHeightRef.current = 0 // Reset for next load
    }
  }, [data])

  const handleGoToDashboard = () => {
    POSTHOG_EVENTS.click('go_back')
  }

  const messages = useMemo(() => {
    const result = data?.pages.flatMap((page) => page.data.messages) ?? []
    result.reverse()
    return result
  }, [data])

  const { mutate: createMessage, isPending } = useCreateMessage(inputRef, setMessageInput)

  useEffect(() => {
    if (!isPending) {
      inputRef.current?.focus()
    }
  }, [isPending])

  const handleFetchNextPage = () => {
    if (messagesContainerRef.current) {
      scrollHeightRef.current = messagesContainerRef.current.scrollHeight
    }
    fetchNextPage().then()
  }

  const { mutate: transcribe, isPending: isTranscribing } = useTranscribeAudioToText(
    studyLanguage,
    messageInput,
    setMessageInput,
    resetAudioRecorder
  )

  const handleTranscriptionError = useCallback(
    (error: unknown) => {
      resetAudioRecorder()

      if (
        error instanceof ORPCError &&
        error.code === 'AUDIO_VALIDATION_ERROR' &&
        isAudioTooShortErrorPayload(error.data)
      ) {
        dispatch(modalActions.openModal(AUDIO_TOO_SHORT_FOR_PRONUNCIATION_MODAL_ID))
        return
      }

      toast.error(t`Failed to transcribe audio. Please try again.`)
    },
    [dispatch, resetAudioRecorder, t]
  )

  useEffect(() => {
    if (recording) {
      transcribe(recording, {
        onError: handleTranscriptionError,
      })
    }
  }, [recording, transcribe, handleTranscriptionError])

  useEffect(() => {
    return () => {
      resetAudioRecorder()
    }
  }, [resetAudioRecorder])

  const sendMessage = (content: string) => {
    if (content.trim() && !isPending) {
      createMessage({
        content,
        role: 'user',
        motherLanguage,
        studyLanguage,
        personality,
        voiceOption,
      })
    }
  }

  useIntersectionObserver({
    target: loadMoreRef,
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        handleFetchNextPage()
      }
    },
    enabled: hasNextPage,
  })

  return (
    <WithFixedNavbar>
      <div className='flex h-full w-full flex-col items-center'>
        <BigCard className='container relative flex h-full flex-col overflow-hidden p-2 md:pt-2 lg:pt-2'>
          <Button
            href={ROUTE_PATHS.DASHBOARD}
            onClick={handleGoToDashboard}
            className='absolute left-0 top-0 h-10 w-10 px-0 text-gray-500 hover:bg-gray-500 hover:text-white active:bg-gray-600 md:left-4 md:top-4 md:px-2'
          >
            <ArrowLeft className='' />
          </Button>

          <ConversationExerciseControls />

          <div className='flex flex-1 flex-col overflow-hidden'>
            <div ref={messagesContainerRef} className='flex-1 overflow-y-auto'>
              {hasNextPage && (
                <div ref={loadMoreRef} className='flex justify-center p-4'>
                  {
                    isFetchingNextPage ? <SquaresLoader /> : <div className='h-10 md:h-12' /> // this is a hack, we put an invisible div of the same height as the SquaresLoader to avoid cumulative shift
                  }
                </div>
              )}
              <ConversationMessages messages={messages} />
              {isFetchingFirstPage && (
                <div className='flex justify-center py-4'>
                  <SquaresLoader />
                </div>
              )}
            </div>

            <div className='flex flex-shrink-0 flex-col gap-4 border-t border-gray-200 p-0 pt-2 md:p-4'>
              <div className='flex items-end gap-2'>
                <div className='relative flex-1'>
                  <Textarea
                    ref={inputRef}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (e.shiftKey) {
                          return // Allow new line with Shift+Enter
                        }
                        e.preventDefault()
                        if (messageInput.trim() && !isPending) {
                          sendMessage(messageInput)
                        }
                      }
                    }}
                    placeholder={t`Type your message...`}
                    disabled={isPending}
                  />
                </div>

                <div className='flex items-center gap-2'>
                  <CompactAudioRecorder
                    recordingState={isTranscribing ? 'loading' : isRecording ? 'recording' : 'idle'}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                  />
                  <Button
                    onClick={() => {
                      if (messageInput.trim() && !isPending) {
                        sendMessage(messageInput)
                      }
                    }}
                    disabled={!messageInput.trim() || isPending || isTranscribing}
                    className='flex h-10 w-10 rounded-xl bg-gray-200 p-2 px-0 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100 md:px-0'
                  >
                    <SendHorizontal className='h-full w-full' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </BigCard>
      </div>
    </WithFixedNavbar>
  )
}
