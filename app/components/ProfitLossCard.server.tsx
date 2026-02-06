import { getProfitLoss, getChartData } from '@/app/actions/utils'
import ProfitLossCardClient from './ProfitLossCard.client'
import type { ProfitLossCardProps } from '@/app/types'

export default async function ProfitLossCard({
  timeframe = '6H',
}: ProfitLossCardProps) {
  const [profitLoss, chartData] = await Promise.all([
    getProfitLoss(timeframe),
    getChartData(timeframe),
  ])

  return (
    <ProfitLossCardClient
      profitLoss={profitLoss.value}
      chartData={chartData}
      initialTimeframe={timeframe}
    />
  )
}
