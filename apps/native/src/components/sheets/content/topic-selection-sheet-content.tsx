import { useState, useEffect } from 'react'
import { Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { AVAILABLE_TOPICS, Topic } from '@yourbestaccent/core/constants/topics'
import { Button } from '@/components/ui/button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TopicCard } from '@/components/ui/topic-card'
import { useLingui } from '@lingui/react/macro'

interface TopicSelectionSheetContentProps {
  currentTopic: Topic | null
  onTopicSelect: (topic: Topic | null) => void
  close: () => void
}

export const TopicSelectionSheetContent = ({ currentTopic, onTopicSelect, close }: TopicSelectionSheetContentProps) => {
  const { t } = useLingui()

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(currentTopic)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    setSelectedTopic(currentTopic)
  }, [currentTopic])

  const handleTopicPress = (topic: Topic) => {
    const newSelectedTopic = topic === selectedTopic ? null : topic
    setSelectedTopic(newSelectedTopic)
    onTopicSelect(newSelectedTopic)
    close()
  }

  const handleClearTopic = () => {
    setSelectedTopic(null)
    onTopicSelect(null)
    close()
  }

  return (
    <View className='flex-1 px-4 pt-2' style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <Text className='mb-4 text-center text-xl font-semibold text-gray-800'>{t`Select a topic`}</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className='flex-row flex-wrap justify-center gap-2'>
          {AVAILABLE_TOPICS.map((topic) => (
            <View key={topic} className='mb-2 w-auto'>
              <TopicCard topic={topic} isSelected={selectedTopic === topic} onSelect={() => handleTopicPress(topic)} />
            </View>
          ))}
        </View>
      </ScrollView>
      <Button
        variant='ghost'
        onPress={handleClearTopic}
        className='mt-4'
        textClassName='text-gray-500'
        disabled={!selectedTopic}
      >
        {t`Clear topic`}
      </Button>
    </View>
  )
}
