import { getWalletBalance, getPortfolioValue } from '@/app/actions/utils'
import WalletCardClient from './WalletCard.client'

export default async function WalletCard() {
    const [balance, portfolio] = await Promise.all([
      getWalletBalance(),
      getPortfolioValue(),
    ])
    return (
      <WalletCardClient
        usdt={balance.usdt}
        dailyChange={balance.dailyChange}
        portfolioNotUSDT={portfolio.notUSDT}
        portfolioTotal={portfolio.usdtPlusPortfolio}
      />
    )
}
