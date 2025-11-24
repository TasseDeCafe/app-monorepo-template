import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import { Card } from '@/components/ui/card'
import { useGetUser } from '@/hooks/api/user/user-hooks'
import colors from 'tailwindcss/colors'
import dayjs from 'dayjs'
import { BigCard } from '@/components/ui/big-card'
import { useLingui } from '@lingui/react/macro'
import {
  CartesianChart,
  type ChartPressState,
  type PointsArray,
  useAreaPath,
  useChartPressState,
  useLinePath,
} from 'victory-native'
import { Circle, Group, Line as SkiaLine, LinearGradient, Path, useFont, vec } from '@shopify/react-native-skia'
import { type SharedValue, useDerivedValue } from 'react-native-reanimated'
// @ts-ignore
import interFontPath from '@/assets/fonts/Inter-Medium.otf'
import * as Haptics from 'expo-haptics'
import { logWithSentry } from '@/analytics/sentry/log-with-sentry'
import { Skeleton } from '@/components/ui/skeleton'

const formatDateLabel = (timestamp: number): string => {
  return dayjs(timestamp).format('MMM D')
}

const formatDisplayDate = (timestamp: number): string => {
  return dayjs(timestamp).format('MMM D, YYYY')
}

const INITIAL_PRESS_STATE = { x: 0, y: { value: 0 } }

type WordsGraphPressValueShape = { x: number; y: { value: number } }

type ChartDataType = { date: number; value: number }

export const WordsGraph = () => {
  const { t } = useLingui()
  const { defaultedUserData, query } = useGetUser()
  const { isLoading } = query
  const { learnedWordsByDay } = defaultedUserData
  const font = useFont(interFontPath, 10)
  const chartHeight = 250

  const [displayDate, setDisplayDate] = useState('')
  const [displayValue, setDisplayValue] = useState('')
  const [calculatedPoints, setCalculatedPoints] = useState<PointsArray | null>(null)

  const hasInteractedRef = useRef(false)
  const yZeroPixelRef = useRef<number | null>(null)

  const chartData = useMemo<ChartDataType[]>(() => {
    if (!learnedWordsByDay || learnedWordsByDay.length === 0) {
      return []
    }
    const validData = learnedWordsByDay
      .filter((day) => {
        if (!day || typeof day.date !== 'string' || day.date.length === 0) return false
        const dateObj = new Date(day.date)
        return !isNaN(dateObj.getTime()) && typeof day.learnedWordsCount === 'number'
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (validData.length === 0) return []

    const formattedData: ChartDataType[] = validData.reduce((acc, day) => {
      const previousTotal = acc.length > 0 ? acc[acc.length - 1].value : 0
      const total = previousTotal + day.learnedWordsCount
      const dateObj = new Date(day.date)
      return [
        ...acc,
        {
          value: total,
          date: dateObj.valueOf(),
        },
      ]
    }, [] as ChartDataType[])

    // Ensure at least two points for the line/area chart
    if (formattedData.length === 1) {
      const firstPoint = formattedData[0]
      const prevDate = dayjs(firstPoint.date).subtract(1, 'day').valueOf()
      return [
        {
          value: 0,
          date: prevDate,
        },
        firstPoint,
      ]
    }

    return formattedData
  }, [learnedWordsByDay])

  const { state: chartPressState, isActive: isPressActive } =
    useChartPressState<WordsGraphPressValueShape>(INITIAL_PRESS_STATE)

  useEffect(() => {
    if (chartData.length > 0 && !hasInteractedRef.current) {
      const latestDataPoint = chartData[chartData.length - 1]
      setDisplayDate(formatDisplayDate(latestDataPoint.date))
      setDisplayValue(`${Math.round(latestDataPoint.value)} words`)
    }
  }, [chartData])

  const lastValueRef = useRef({ date: 0, value: 0 })

  useEffect(() => {
    if (!isPressActive) return

    const updateData = () => {
      try {
        const date = chartPressState.x.value.value
        const value = chartPressState.y.value.value.value

        if (date !== lastValueRef.current.date || value !== lastValueRef.current.value) {
          lastValueRef.current = { date, value }

          setDisplayDate(formatDisplayDate(date))
          setDisplayValue(`${Math.round(value)} words`)

          Haptics.selectionAsync().then()
        }
      } catch (e) {
        logWithSentry('Error updating from shared values', e)
      }
    }

    hasInteractedRef.current = true

    updateData()

    const interval = setInterval(updateData, 50)
    return () => clearInterval(interval)
  }, [isPressActive, chartPressState])

  const maxValue = useMemo(() => {
    if (!chartData || chartData.length === 0) return 10
    return Math.max(...chartData.map((item) => item.value))
  }, [chartData])

  if (isLoading) {
    return (
      <Card className='p-4'>
        <View className='mb-4 items-center'>
          <Skeleton className='h-4 w-28 rounded-md' />
          <Skeleton className='mt-1 h-6 w-32 rounded-md' />
        </View>
        <Skeleton className='h-[250px] w-full rounded-md' />
      </Card>
    )
  }

  if (chartData.length < 2) {
    return (
      <BigCard className='mt-4 items-center justify-center py-10'>
        <Text className='text-lg text-gray-600'>{t`No data available`}</Text>
        {learnedWordsByDay && learnedWordsByDay.length > 0 && chartData.length < 2 && (
          <Text className='text-sm text-gray-500'>{t`(Need at least two data points)`}</Text>
        )}
      </BigCard>
    )
  }

  return (
    <Card className='p-4'>
      <View className='mb-4 items-center'>
        <Text style={{ fontSize: 16, color: colors.gray[600], marginBottom: 4 }}>{displayDate}</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.gray[900] }}>{displayValue}</Text>
      </View>

      <View style={{ height: chartHeight }}>
        <CartesianChart
          gestureLongPressDelay={0}
          data={chartData}
          xKey='date'
          yKeys={['value']}
          domainPadding={{ top: 20, bottom: 5, left: 5, right: 5 }}
          padding={{ bottom: 15, left: 15, right: 5, top: 10 }}
          domain={{ y: [0, maxValue] }}
          xAxis={{
            font,
            tickCount: 5,
            labelOffset: 8,
            labelColor: colors.gray[600],
            formatXLabel: formatDateLabel,
            lineColor: 'transparent',
          }}
          yAxis={[
            {
              font,
              tickCount: 5,
              labelOffset: 8,
              labelColor: colors.gray[600],
              lineColor: colors.gray[300],
            },
          ]}
          chartPressState={chartPressState}
          renderOutside={({ chartBounds }) => {
            if (yZeroPixelRef.current === null) return null

            const lastPoint =
              calculatedPoints && calculatedPoints.length > 0 ? calculatedPoints[calculatedPoints.length - 1] : null
            const lastPointCoords =
              lastPoint && typeof lastPoint.x === 'number' && typeof lastPoint.y === 'number'
                ? { x: lastPoint.x, y: lastPoint.y }
                : null

            return (
              <IndicatorWrapper
                isActive={isPressActive}
                hasInteracted={hasInteractedRef.current}
                chartPressState={chartPressState}
                chartTop={chartBounds.top}
                lineBaseY={yZeroPixelRef.current}
                lastPointCoords={lastPointCoords}
              />
            )
          }}
        >
          {({ points, chartBounds, yScale }) => {
            if (yScale && typeof yScale === 'function') {
              const currentYZero = yScale(0)
              if (yZeroPixelRef.current !== currentYZero) {
                yZeroPixelRef.current = currentYZero
              }
            }

            if (
              points?.value &&
              (!calculatedPoints || JSON.stringify(points.value) !== JSON.stringify(calculatedPoints))
            ) {
              setTimeout(() => {
                setCalculatedPoints(points.value)
              }, 0)
            }

            return (
              <>
                {calculatedPoints && yZeroPixelRef.current !== null && (
                  <>
                    <AreaPath points={calculatedPoints} chartTop={chartBounds.top} yZeroPixel={yZeroPixelRef.current} />
                    <LinePath points={calculatedPoints} />
                    <DataPoints points={calculatedPoints} />
                  </>
                )}
              </>
            )
          }}
        </CartesianChart>
      </View>
    </Card>
  )
}

// Separate component to handle indicator rendering
// This keeps shared value access out of the main render function
const IndicatorWrapper = ({
  isActive,
  hasInteracted,
  chartPressState,
  chartTop,
  lineBaseY,
  lastPointCoords,
}: {
  isActive: boolean
  hasInteracted: boolean
  chartPressState: ChartPressState<WordsGraphPressValueShape>
  chartTop: number
  lineBaseY: number
  lastPointCoords: { x: number; y: number } | null
}) => {
  const xPos = useDerivedValue(() => chartPressState.x.position.value)
  const yPos = useDerivedValue(() => chartPressState.y.value.position.value)

  if (isActive) {
    return (
      <ChartIndicator
        xPosition={chartPressState.x.position}
        yPosition={chartPressState.y.value.position}
        top={chartTop}
        lineBaseY={lineBaseY}
        lineColor={colors.black}
        indicatorColor={colors.indigo[600]}
      />
    )
  } else if (hasInteracted) {
    return (
      <StaticIndicator
        x={xPos}
        y={yPos}
        top={chartTop}
        lineBaseY={lineBaseY}
        lineColor={colors.black}
        indicatorColor={colors.indigo[600]}
      />
    )
  } else if (lastPointCoords) {
    return (
      <DefaultIndicator
        x={lastPointCoords.x}
        y={lastPointCoords.y}
        top={chartTop}
        lineBaseY={lineBaseY}
        lineColor={colors.black}
        indicatorColor={colors.indigo[600]}
      />
    )
  }

  return null
}

const ChartIndicator = ({
  xPosition,
  yPosition,
  top,
  lineBaseY,
  lineColor,
  indicatorColor,
}: {
  xPosition: SharedValue<number>
  yPosition: SharedValue<number>
  top: number
  lineBaseY: number
  lineColor: string
  indicatorColor: string
}) => {
  const lineStart = useDerivedValue(() => vec(xPosition.value, lineBaseY), [lineBaseY, xPosition])
  const lineEnd = useDerivedValue(() => vec(xPosition.value, top), [top, xPosition])

  return (
    <>
      <SkiaLine p1={lineStart} p2={lineEnd} color={lineColor} strokeWidth={2} />
      <Circle cx={xPosition} cy={yPosition} r={6} color={indicatorColor} />
    </>
  )
}

const StaticIndicator = ({
  x,
  y,
  top,
  lineBaseY,
  lineColor,
  indicatorColor,
}: {
  x: SharedValue<number>
  y: SharedValue<number>
  top: number
  lineBaseY: number
  lineColor: string
  indicatorColor: string
}) => {
  const lineStart = useDerivedValue(() => vec(x.value, lineBaseY))
  const lineEnd = useDerivedValue(() => vec(x.value, top))

  return (
    <>
      <SkiaLine p1={lineStart} p2={lineEnd} color={lineColor} strokeWidth={2} />
      <Circle cx={x} cy={y} r={6} color={indicatorColor} />
    </>
  )
}

const DefaultIndicator = ({
  x,
  y,
  top,
  lineBaseY,
  lineColor,
  indicatorColor,
}: {
  x: number
  y: number
  top: number
  lineBaseY: number
  lineColor: string
  indicatorColor: string
}) => {
  return (
    <>
      <SkiaLine p1={vec(x, lineBaseY)} p2={vec(x, top)} color={lineColor} strokeWidth={2} />
      <Circle cx={x} cy={y} r={6} color={indicatorColor} />
    </>
  )
}

const LinePath = ({ points }: { points: PointsArray | null }) => {
  const { path } = useLinePath(points ?? [])
  if (!points || points.length === 0) return null
  return <Path path={path} style='stroke' strokeWidth={2} color={colors.indigo[500]} />
}

const AreaPath = ({
  points,
  chartTop,
  yZeroPixel,
}: {
  points: PointsArray | null
  chartTop: number
  yZeroPixel: number
}) => {
  const { path } = useAreaPath(points ?? [], yZeroPixel)
  if (!points || points.length === 0) return null

  return (
    <Path path={path} style='fill'>
      <LinearGradient
        start={vec(0, chartTop)}
        end={vec(0, yZeroPixel)}
        colors={[colors.indigo[400] + '90', colors.indigo[100] + '20']}
      />
    </Path>
  )
}

const DataPoints = ({ points }: { points: PointsArray | null }) => {
  if (!points || points.length === 0) return null

  const pointRadius = 4
  const pointStrokeWidth = 1.5

  return (
    <Group>
      {points.map((point, index) => {
        if (typeof point.x !== 'number' || typeof point.y !== 'number') return null
        return (
          <Group key={`point-${index}-${point.xValue}`}>
            <Circle cx={point.x} cy={point.y} r={pointRadius} color={colors.white} style='fill' />
            <Circle
              cx={point.x}
              cy={point.y}
              r={pointRadius}
              color={colors.indigo[500]}
              style='stroke'
              strokeWidth={pointStrokeWidth}
            />
          </Group>
        )
      })}
    </Group>
  )
}
