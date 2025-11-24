import { Popover, PopoverContent, PopoverTrigger } from '../../../../shadcn/popover'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../../../shadcn/drawer'
import { useMediaQuery } from 'usehooks-ts'
import React, { useEffect, useMemo, useState } from 'react'
import { AVAILABLE_TOPICS, Topic } from '@yourbestaccent/core/constants/topics'
import { usePatchTopics, useTopics } from '@/hooks/api/user/user-hooks'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/transport/our-backend/query-keys'
import { cn } from '@yourbestaccent/core/utils/tailwind-utils'
import { TOPIC_TO_ICONS_MAP } from '../../../../design-system/topic-icons'
import { Search, X } from 'lucide-react'
import { Input } from '../../../../shadcn/input'
import { Button } from '../../../../design-system/button.tsx'
import { topicMessages } from '@yourbestaccent/i18n/topic-translation-utils'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useLingui } from '@lingui/react/macro'

const TopicTriggerContent = ({ selectedTopic }: { selectedTopic: Topic | null }) => {
  const { t, i18n } = useLingui()

  if (!selectedTopic) {
    return (
      <div className='rounded-lg px-2 py-1 text-base font-semibold text-slate-800 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white'>
        <span className='hidden text-lg md:flex'>{t`No Topic`}</span>
        <span className='flex text-sm md:hidden'>{t`No Topic`}</span>
      </div>
    )
  }

  const iconData = TOPIC_TO_ICONS_MAP[selectedTopic]
  const topicName = i18n._(topicMessages[selectedTopic])

  return (
    <div className='flex items-center gap-1 rounded-lg px-2 py-1 text-lg font-semibold text-slate-800 hover:bg-gray-600 hover:text-white active:bg-gray-700 active:text-white md:gap-1.5'>
      {iconData.type === 'lucide' ? (
        <iconData.icon className='h-5 w-5' />
      ) : (
        <span className='text-xl'>{iconData.icon as string}</span>
      )}
      <span className='hidden text-lg sm:flex'>{topicName}</span>
      <span className='flex text-sm sm:hidden'>{topicName}</span>
    </div>
  )
}

export const TopicSelectorButton = () => {
  const { t, i18n } = useLingui()

  const isMdOrLarger = useMediaQuery('(min-width: 768px)')
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { data: topics = [] } = useTopics()
  const { mutate: updateTopic } = usePatchTopics({
    onSuccess: () => {
      setSearchTerm('')
      setIsOpen(false)
    },
    onError: () => {
      queryClient.setQueryData<{ data: { topics: Topic[] } }>([QUERY_KEYS.TOPICS], {
        data: {
          topics,
        },
      })
    },
  })
  const queryClient = useQueryClient()
  const [temporaryTopic, setTemporaryTopic] = useState<Topic | null>(null)

  const selectedTopic = topics.length > 0 ? topics[0] : null

  // Create a memoized map of translated topic names for filtering
  const translatedTopicNames = useMemo(
    () =>
      AVAILABLE_TOPICS.reduce(
        (acc, topic) => {
          acc[topic] = i18n._(topicMessages[topic])
          return acc
        },
        {} as Record<Topic, string>
      ),
    [i18n]
  )

  useEffect(() => {
    if (isOpen) {
      setTemporaryTopic(selectedTopic)
    }
  }, [isOpen, selectedTopic])

  const handleTopicChange = (topic: Topic | null) => {
    setTemporaryTopic(temporaryTopic === topic ? null : topic)
  }

  const handleSave = () => {
    const newTopics = temporaryTopic ? [temporaryTopic] : []
    queryClient.setQueryData<{ data: { topics: Topic[] } }>([QUERY_KEYS.TOPICS], {
      data: {
        topics: newTopics,
      },
    })

    updateTopic({
      topics: newTopics,
    })
  }

  const filteredTopics = AVAILABLE_TOPICS.filter((topic) =>
    translatedTopicNames[topic].toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setSearchTerm(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredTopics.length === 1) {
      handleTopicChange(filteredTopics[0])
    }
  }

  const TopicSelector = () => (
    <div className='flex w-full flex-col gap-y-6 p-2'>
      <div className='flex items-center justify-between gap-4'>
        {isMdOrLarger && (
          <div className='relative flex-1'>
            <Input
              type='text'
              autoFocus={true}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className='pl-9'
              placeholder={t`Search topics...`}
            />
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <Search className='h-4 w-4 text-gray-400' />
            </div>
          </div>
        )}
      </div>
      <div className='flex flex-wrap gap-2'>
        {filteredTopics.length === 0 ? (
          <div className='w-full text-center text-sm text-gray-500'>{t`No topics found`}</div>
        ) : (
          filteredTopics.map((topic) => {
            const iconData = TOPIC_TO_ICONS_MAP[topic]
            return (
              <Button
                key={topic}
                onClick={() => handleTopicChange(topic)}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-xl border px-3 shadow-sm transition-all sm:h-10 sm:gap-2 sm:px-4',
                  'text-sm sm:text-lg',
                  temporaryTopic === topic ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'
                )}
              >
                {iconData.type === 'lucide' ? (
                  <iconData.icon className='h-4 w-4' />
                ) : (
                  <span className='text-lg'>{iconData.icon as string}</span>
                )}
                <span>{translatedTopicNames[topic]}</span>
              </Button>
            )
          })
        )}
      </div>
      <div className='flex w-full flex-row gap-x-2'>
        <button
          onClick={() => handleTopicChange(temporaryTopic)}
          className='flex items-center gap-1.5 rounded-xl px-4 py-1 text-sm text-gray-500 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-200'
          disabled={!temporaryTopic}
        >
          {t`Clear topic`}
        </button>
      </div>
    </div>
  )

  if (isMdOrLarger) {
    return (
      <Popover
        open={isOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            handleSave()
          }
          setIsOpen(open)
        }}
      >
        <PopoverTrigger>
          <TopicTriggerContent selectedTopic={selectedTopic} />
        </PopoverTrigger>
        <PopoverContent className='p-0 sm:w-[768px] lg:w-[900px]' align='center'>
          <div className='relative'>
            <button
              onClick={() => {
                setIsOpen(false)
                handleSave()
              }}
              className='absolute right-2 top-2 text-gray-400 hover:text-gray-600'
            >
              <X className='h-5 w-5' />
            </button>
            <h2 className='pb-1 pt-4 text-center text-lg font-semibold'>{t`Select a topic`}</h2>
          </div>

          <TopicSelector />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          handleSave()
        }
        setIsOpen(open)
      }}
      autoFocus={true}
    >
      <DrawerTrigger>
        <TopicTriggerContent selectedTopic={selectedTopic} />
      </DrawerTrigger>
      <DrawerContent className='bg-white pb-10'>
        <div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' />
        <DrawerHeader>
          <DrawerTitle className='flex w-full justify-between'>
            {t`Select a topic`}
            <button
              onClick={() => {
                setIsOpen(false)
                handleSave()
              }}
              className='text-gray-400 hover:text-gray-600'
            >
              <X className='h-5 w-5' />
            </button>
          </DrawerTitle>
          {/* Add hidden description for accessibility and to prevent "Missing Description" warning */}
          <VisuallyHidden>
            <DrawerDescription>{t`Select a topic`}</DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>
        <TopicSelector />
      </DrawerContent>
    </Drawer>
  )
}
