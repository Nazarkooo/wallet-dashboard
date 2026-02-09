'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import NumberFlow from './NumberFlow'
import ChartTooltip from './ChartTooltip'
import { getChartData, getProfitLoss } from '@/app/actions/utils'
import type { ChartDataPoint, ProfitLossCardClientProps } from '@/app/types'
import {
  timeframes,
  timeframeLabels,
  type Timeframe,
} from '@/app/lib/timeframe'

export default function ProfitLossCardClient({
  profitLoss,
  chartData: initialChartData,
  initialTimeframe,
}: ProfitLossCardClientProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>(
    initialTimeframe as Timeframe
  )
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialChartData)
  const [profitLossValue, setProfitLossValue] = useState<string>(profitLoss)
  const [hoveredValue, setHoveredValue] = useState<number | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTimeframeChange = useCallback(
    async (timeframe: Timeframe) => {
      if (timeframe === selectedTimeframe || isLoading) return

      setSelectedTimeframe(timeframe)
      setIsLoading(true)

      try {
        const [newChartData, newProfitLoss] = await Promise.all([
          getChartData(timeframe),
          getProfitLoss(timeframe),
        ])
        setChartData(newChartData)
        setProfitLossValue(newProfitLoss.value)
        setHoveredValue(null)
        setHoveredDate(null)
      } catch (error) {
        console.error('Error loading chart data:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedTimeframe, isLoading]
  )

  const displayValue =
    hoveredValue !== null ? hoveredValue : parseFloat(profitLossValue)
  const displayDate = hoveredDate || timeframeLabels[selectedTimeframe]

  const chartDataFormatted = chartData.map(point => ({
    ...point,
    value: point.value,
    dateFormatted: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    originalDate: point.date,
  }))

  const isPositive = parseFloat(profitLossValue) >= 0

  return (
    <div className="profit-loss-card border border-[#E5E5E5] w-full max-w-[639px] h-[235px] max-[1334px]:h-[300px] rounded-[8px] p-[20px] pb-[5px] bg-[#FFFFFF] shrink-0 flex-[1_1_0%] flex flex-col gap-[19px] box-border overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <img
            src="/arrow.svg"
            alt="Arrow"
            width={12}
            height={12}
            className="w-[12px] h-[12px]"
            style={{
              transform: isPositive ? 'none' : 'rotate(180deg)',
              filter:
                'brightness(0) saturate(100%) invert(60%) sepia(90%) saturate(400%) hue-rotate(90deg) brightness(95%) contrast(85%)',
            }}
          />
          <span className="font-euclid font-normal text-[12px] leading-[100%] tracking-[-0.02em] text-[#868686] pl-[5px] pr-[5px]">
            Profit/Loss
          </span>
          <img
            src="/profit-download.svg"
            alt="Download"
            width={16}
            height={16}
            className="w-4 h-4 cursor-pointer ml-2"
          />
        </div>

        <div className="flex items-center gap-3">
          {timeframes.map(timeframe => (
            <motion.button
              key={timeframe}
              onClick={() => handleTimeframeChange(timeframe)}
              className={`flex items-center justify-center min-w-[40px] h-6 pt-[7px] pr-3 pb-[7px] pl-3 rounded-[70px] border-none cursor-pointer font-euclid font-normal text-[12px] leading-[100%] tracking-[-0.02em] text-center align-middle transition-all duration-200 ${
                selectedTimeframe === timeframe
                  ? 'bg-[rgba(255,81,0,0.1)] text-[#FF5100]'
                  : 'bg-transparent text-[#868686]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {timeframe}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3
            className="font-euclid font-normal text-[40px] leading-[100%] tracking-[-0.02em] text-center text-black m-0 align-middle"
            style={{ fontWeight: 400, paddingBottom: '4px' }}
          >
            <NumberFlow
              value={displayValue}
              decimals={2}
              prefix={displayValue >= 0 ? '+' : ''}
              suffix="$"
            />
          </h3>
          <p className="font-euclid font-normal text-[12px] leading-[100%] tracking-[-0.02em] text-[#868686] m-0">
            {displayDate}
          </p>
        </div>

        <img
          src="/crypto.svg"
          alt="Crypto"
          width={30.5}
          height={30.5}
          className="w-[30.5px] h-[30.5px] self-center"
        />
      </div>

      <div className="w-full h-[150px] mt-auto pb-[2px] flex items-center justify-center overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartDataFormatted}
            margin={{ top: 0, right: 5, bottom: 5, left: 5 }}
            onMouseLeave={() => {
              setHoveredValue(null)
              setHoveredDate(null)
            }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5100" stopOpacity={0.5} />
                <stop offset="10%" stopColor="#FF5100" stopOpacity={0.4} />
                <stop offset="20%" stopColor="#FF5100" stopOpacity={0.35} />
                <stop offset="30%" stopColor="#FF5100" stopOpacity={0.3} />
                <stop offset="40%" stopColor="#FF5100" stopOpacity={0.25} />
                <stop offset="50%" stopColor="#FF5100" stopOpacity={0.2} />
                <stop offset="60%" stopColor="#FF5100" stopOpacity={0.15} />
                <stop offset="70%" stopColor="#FF5100" stopOpacity={0.1} />
                <stop offset="80%" stopColor="#FF5100" stopOpacity={0.05} />
                <stop offset="100%" stopColor="#FF5100" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis hide={true} />
            <YAxis
              hide={true}
              domain={[
                (dataMin: number) => Math.min(0, dataMin),
                (dataMax: number) => Math.max(0, dataMax),
              ]}
            />
            <Tooltip
              content={
                <ChartTooltip
                  setHoveredValue={setHoveredValue}
                  setHoveredDate={setHoveredDate}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#FF5100"
              strokeWidth={2}
              fill="url(#colorGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
