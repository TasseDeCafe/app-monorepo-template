import { BadgeCard, BadgeData } from './badge-card.tsx'

type BadgeSectionProps = {
  title: string
  badges: BadgeData[]
}

export const BadgeSection = ({ title, badges }: BadgeSectionProps) => {
  const sortedBadges: BadgeData[] = badges.sort((a, b) => a.maxProgress - b.maxProgress)
  const nextBadgeIndex: number = sortedBadges.findIndex((badge) => !badge.achieved)

  return (
    <div className='mb-8 flex-1'>
      <h2 className='mb-4 text-center text-2xl font-bold'>{title}</h2>
      <div className='grid grid-cols-1 gap-4'>
        {sortedBadges.map((badge, index) => (
          <BadgeCard key={index} {...badge} isNext={index === nextBadgeIndex} />
        ))}
      </div>
    </div>
  )
}
