import { LabelList, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../shadcn/card.tsx'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../../../../../shadcn/chart.tsx'

import colors from 'tailwindcss/colors'
import { WordsInLanguageCounter } from '@yourbestaccent/api-client/orpc-contracts/words-contract'
import { useGetWordsPronouncedCorrectlyCounters } from '@/hooks/api/words/words-hooks'
import { useLingui } from '@lingui/react/macro'
import { langNameMessages } from '@yourbestaccent/i18n/lang-code-translation-utils'

const chartColors = [
  colors.green[400],
  colors.green[500],
  colors.green[600],
  colors.green[700],
  colors.green[800],
  colors.green[900],
]

export const LanguageCountersPieChart = () => {
  const { t, i18n } = useLingui()
  const wordsLearnedLabel = t`Words learned`

  const counters: WordsInLanguageCounter[] = useGetWordsPronouncedCorrectlyCounters()
  const chartData = counters
    .sort((c1, c2) => {
      return c1.wordsPronouncedCorrectlyCount - c2.wordsPronouncedCorrectlyCount
    })
    .map((counter, index) => ({
      language: i18n._(langNameMessages[counter.language]),
      wordsLearned: counter.wordsPronouncedCorrectlyCount,
      fill: chartColors[index],
    }))
  const chartConfig: ChartConfig = {
    wordsLearned: {
      label: wordsLearnedLabel,
    },
    ...Object.fromEntries(
      chartData.map(({ language }) => [
        language,
        {
          label: language,
          color: colors.stone[950],
        },
      ])
    ),
  }

  return (
    <div className='flex w-full flex-col items-center'>
      <Card className='flex w-full max-w-4xl flex-col'>
        <CardHeader className='items-center pb-0'>
          <CardTitle>{t`Words learned`}</CardTitle>
          <CardDescription>{t`grouped by language`}</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          <ChartContainer config={chartConfig} className='mx-auto aspect-square max-h-[600px]'>
            <PieChart innerRadius={300}>
              <ChartTooltip content={<ChartTooltipContent nameKey='wordsLearned' hideLabel />} />
              <Pie data={chartData} dataKey='wordsLearned'>
                <LabelList
                  dataKey='language'
                  fontSize={12}
                  formatter={(value: keyof typeof chartConfig) => chartConfig[value]?.label}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
