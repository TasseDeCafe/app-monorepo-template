import { TouchableOpacity, Text } from 'react-native'
import { TOPIC_TO_ICONS_MAP } from '@/constants/topic-icons'
import { topicMessages } from '@template-app/i18n/topic-translation-utils'
import { Topic } from '@template-app/core/constants/topics'
import colors from 'tailwindcss/colors'
import { useLingui } from '@lingui/react/macro'

interface TopicCardProps {
  topic: Topic
  isSelected: boolean
  onSelect: () => void
}

export const TopicCard = ({ topic, isSelected, onSelect }: TopicCardProps) => {
  const { i18n } = useLingui()
  const iconData = TOPIC_TO_ICONS_MAP[topic]
  const IconComponent = iconData.type === 'lucide' ? iconData.icon : null

  return (
    <TouchableOpacity
      className={`h-12 flex-row items-center justify-start rounded-xl border px-3 py-3 ${
        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-200 bg-white'
      }`}
      onPress={onSelect}
    >
      {iconData.type === 'lucide' && IconComponent ? (
        <IconComponent size={20} color={isSelected ? 'white' : colors.gray[500]} />
      ) : (
        <Text className={`text-xl leading-5 ${isSelected ? 'text-white' : 'text-gray-500'}`}>
          {iconData.icon as string}
        </Text>
      )}
      <Text
        className={`ml-2 text-base font-medium leading-5 ${isSelected ? 'text-white' : 'text-gray-500'}`}
        numberOfLines={2}
        ellipsizeMode='tail'
      >
        {i18n._(topicMessages[topic])}
      </Text>
    </TouchableOpacity>
  )
}
