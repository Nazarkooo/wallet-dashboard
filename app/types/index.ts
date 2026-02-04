export interface WalletData {
  balance: string
  dailyChange: {
    amount: string
    percentage: string
  }
  portfolio: {
    notUSDC: string
    usdcPlusPortfolio: string
  }
}

export interface ProfitLossData {
  value: string
  period: string
  chartData: ChartDataPoint[]
}

export interface ChartDataPoint {
  date: string
  value: number
  timestamp: number
}

export interface Timeframe {
  label: string
  value: '1H' | '6H' | '1D' | '1W' | '1M' | 'All'
}
