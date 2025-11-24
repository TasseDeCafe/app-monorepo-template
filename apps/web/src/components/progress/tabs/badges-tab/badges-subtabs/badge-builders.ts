import { Book, Flame, Globe } from 'lucide-react'
import { BadgeData } from './badge-card.tsx'
import {
  LANGUAGE_COUNT_BADGE_THRESHOLDS,
  LANGUAGE_COUNT_BADGE_TITLES,
  STREAK_BADGE_THRESHOLDS,
  WORD_COUNT_BADGE_THRESHOLDS,
  WORD_COUNT_BADGE_TITLES,
  STREAK_BADGE_TITLES,
} from '@yourbestaccent/core/constants/badges-constants'

export const createStreakBadges = (currentStreak: number, longestStreak: number): BadgeData[] => {
  return STREAK_BADGE_THRESHOLDS.map((threshold) => ({
    icon: Flame,
    title: STREAK_BADGE_TITLES[threshold],
    description: `Maintain a ${threshold}-day learning streak`,
    progress: currentStreak,
    maxProgress: threshold,
    achieved: longestStreak >= threshold,
  }))
}

export const createWordCountBadges = (wordsLearned: number): BadgeData[] => {
  return WORD_COUNT_BADGE_THRESHOLDS.map((threshold) => ({
    icon: Book,
    title: WORD_COUNT_BADGE_TITLES[threshold],
    description: `Learn ${threshold.toLocaleString()} words`,
    progress: wordsLearned,
    maxProgress: threshold,
    achieved: wordsLearned >= threshold,
  }))
}

export const createLanguageCountBadges = (languagesLearned: number): BadgeData[] => {
  return LANGUAGE_COUNT_BADGE_THRESHOLDS.map((threshold) => ({
    icon: Globe,
    title: LANGUAGE_COUNT_BADGE_TITLES[threshold],
    description: `Learn words in ${threshold} language${threshold > 1 ? 's' : ''}`,
    progress: languagesLearned,
    maxProgress: threshold,
    achieved: languagesLearned >= threshold,
  }))
}
