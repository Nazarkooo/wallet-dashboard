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
  isMock?: boolean
}

export interface WalletBalance {
  balance: string
  usdc: string
}

export interface PortfolioValue {
  notUSDC: string
  usdcPlusPortfolio: string
}

export interface ProfitLoss {
  value: string
  chartData: ChartDataPoint[]
}

export interface TransactionResult {
  success: boolean
  txHash: string
  error?: string
}

export interface Timeframe {
  label: string
  value: '1H' | '6H' | '1D' | '1W' | '1M' | 'All'
}

export interface NumberFlowProps {
  value: number | string
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

export interface WalletCardClientProps {
  usdc: string
  dailyChange: {
    amount: string
    percentage: string
  }
  portfolioNotUSDC: string
  portfolioTotal: string
}

export interface ProfitLossCardClientProps {
  profitLoss: string
  chartData: ChartDataPoint[]
  initialTimeframe: string
}

export interface ProfitLossCardProps {
  timeframe?: string
}
