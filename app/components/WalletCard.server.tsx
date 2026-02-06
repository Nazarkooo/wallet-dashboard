import { getWalletBalance, getPortfolioValue } from '@/app/actions/utils'
import WalletCardClient from './WalletCard.client'

export default async function WalletCard() {
  const [balance, portfolio] = await Promise.all([
    getWalletBalance(),
    getPortfolioValue(),
  ])

  return (
    <WalletCardClient
      usdc={balance.usdc}
      dailyChange={balance.dailyChange}
      portfolioNotUSDC={portfolio.notUSDC}
      portfolioTotal={portfolio.usdcPlusPortfolio}
    />
  )
}
