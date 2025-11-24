import { Text, TouchableOpacity } from 'react-native'
import colors from 'tailwindcss/colors'
import { Topic } from '@yourbestaccent/core/constants/topics'
import { useBottomSheetStore } from '@/stores/bottom-sheet-store'
import { IndividualSheetName } from '@/components/sheets/bottom-sheet-ids'
import { useGetUser, usePatchTopics } from '@/hooks/api/user/user-hooks'
import { useCallback } from 'react'
import { topicMessages } from '@yourbestaccent/i18n/topic-translation-utils'
import { TOPIC_TO_ICONS_MAP } from '@/constants/topic-icons'
import { useLingui } from '@lingui/react/macro'

export const TopicSelectorButton = () => {
  const { t, i18n } = useLingui()

  const { defaultedUserData: user } = useGetUser()
  const currentTopic = user.topics?.[0] ?? null
  const openBottomSheet = useBottomSheetStore((state) => state.open)
  const { mutate: patchTopics } = usePatchTopics({ meta: { showSuccessToast: false } })

  const handleTopicUpdate = useCallback(
    (newTopic: Topic | null) => {
      patchTopics({ topics: newTopic ? [newTopic] : [] })
    },
    [patchTopics]
  )

  const handlePress = () => {
    openBottomSheet(IndividualSheetName.FREQUENCY_LIST_TOPIC_SELECTOR, {
      currentTopic,
      onTopicSelect: handleTopicUpdate,
    })
  }

  const renderIcon = () => {
    if (!currentTopic) return null
    const iconData = TOPIC_TO_ICONS_MAP[currentTopic]
    if (!iconData) return null

    const IconComponent = iconData.type === 'lucide' ? iconData.icon : null
    if (iconData.type === 'lucide' && IconComponent) {
      return <IconComponent size={20} color={colors.gray[500]} />
    } else if (iconData.type === 'emoji') {
      return <Text className='text-lg leading-5 text-gray-500'>{iconData.icon as string}</Text>
    }
    return null
  }

  return (
    <TouchableOpacity onPress={handlePress} className='flex-row items-center gap-1 rounded-md p-2 active:bg-gray-200'>
      {renderIcon()}
      <Text className='text-base font-medium text-gray-700' numberOfLines={1} ellipsizeMode='tail'>
        {currentTopic ? i18n._(topicMessages[currentTopic]) : t`No Topic`}
      </Text>
    </TouchableOpacity>
  )
}
