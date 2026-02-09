'use server'

import { validateEnv, env } from '@/app/lib/env'
import { getProvider } from '@/app/lib/ethers'
import { getCachedData, setCachedData } from '@/app/lib/cache'
import {
  timeframeMapSeconds,
  timeframeMapMilliseconds,
} from '@/app/lib/timeframe'
import { API_URLS } from '@/app/lib/urls'
import { ethers } from 'ethers'
import type { ChartDataPoint } from '@/app/types'

validateEnv()

const USDT_CONTRACT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

function isUSDTTokenAddress(address: string): boolean {
  if (!address) return true
  const a = address.toLowerCase()
  return a === USDT_CONTRACT_ADDRESS.toLowerCase()
}

async function getETHPriceWithChange(): Promise<{
  usd: number
  change24h: number
}> {
  try {
    const response = await fetchWithRetry(API_URLS.COINGECKO.ETH_PRICE, {
      next: { revalidate: 60 },
    })
    const data = await response.json()
    const change = data.ethereum?.usd_24h_change
    return {
      usd: data.ethereum?.usd || 0,
      change24h: typeof change === 'number' ? change : 0,
    }
  } catch (error) {
    console.error('Error getting ETH price:', error)
    return { usd: 0, change24h: 0 }
  }
}

async function getHashCoinPriceWithChange(): Promise<{
  usd: number
  change24h: number
}> {
  try {
    if (!env.HASH_COIN_ADDRESS || isUSDTTokenAddress(env.HASH_COIN_ADDRESS))
      return { usd: 0, change24h: 0 }
    const response = await fetchWithRetry(
      API_URLS.COINGECKO.TOKEN_PRICE(env.HASH_COIN_ADDRESS),
      { next: { revalidate: 60 } }
    )
    const data = await response.json()
    const address = env.HASH_COIN_ADDRESS.toLowerCase()
    const change = data[address]?.usd_24h_change
    return {
      usd: data[address]?.usd || 0,
      change24h: typeof change === 'number' ? change : 0,
    }
  } catch (error) {
    console.error('Error getting hash coin price:', error)
    return { usd: 0, change24h: 0 }
  }
}

export async function getWalletBalance() {
  try {
    const provider = getProvider()
    const balance = await provider.getBalance(env.WALLET_PUBLIC_KEY)
    const usdtBalance = await getUSDTBalance()

    const [ethPriceWithChange, hashCoinPriceWithChange, hashCoinBalance] =
      await Promise.all([
        getETHPriceWithChange(),
        getHashCoinPriceWithChange(),
        getHashCoinBalance().catch(() => '0'),
      ])

    const ethAmount = parseFloat(ethers.formatEther(balance))
    const tokenAmount = parseFloat(hashCoinBalance)
    const ethValue = ethAmount * ethPriceWithChange.usd
    const tokenValue = tokenAmount * hashCoinPriceWithChange.usd
    const currentNotUSDT = ethValue + tokenValue
    const eth24h = ethPriceWithChange.change24h
    const token24h = hashCoinPriceWithChange.change24h
    const previousNotUSDT =
      ethValue / (1 + eth24h / 100) + tokenValue / (1 + token24h / 100)
    const dailyChange = currentNotUSDT - previousNotUSDT
    const dailyChangePercent =
      previousNotUSDT > 0
        ? ((dailyChange / previousNotUSDT) * 100).toFixed(1)
        : '0.0'

    return {
      balance: ethers.formatEther(balance),
      usdt: usdtBalance,
      dailyChange: {
        amount:
          dailyChange > 0
            ? `+$${dailyChange.toFixed(2)}`
            : `$${dailyChange.toFixed(2)}`,
        percentage: `${dailyChangePercent}%`,
      },
    }
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    throw error
  }
}

export async function getETHBalance(): Promise<string> {
  try {
    const provider = getProvider()
    const balance = await provider.getBalance(env.WALLET_PUBLIC_KEY)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error('Error getting ETH balance:', error)
    return '0'
  }
}

async function getUSDTBalance(): Promise<string> {
  try {
    const provider = getProvider()
    const usdtAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ]
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      usdtAbi,
      provider
    )
    const balance = await usdtContract.balanceOf(env.WALLET_PUBLIC_KEY)
    const decimals = await usdtContract.decimals()
    return ethers.formatUnits(balance, decimals)
  } catch (error) {
    console.error('Error getting USDT balance:', error)
    throw error
  }
}

export async function getPortfolioValue() {
  try {
    const provider = getProvider()
    const [hashCoinBalance, hashCoinPrice, usdtBalance, ethBalance, ethPrice] =
      await Promise.all([
        getHashCoinBalance(),
        getHashCoinPrice(),
        getUSDTBalance(),
        provider.getBalance(env.WALLET_PUBLIC_KEY),
        getETHPrice(),
      ])
    const ethValue = parseFloat(ethers.formatEther(ethBalance)) * ethPrice
    const hashCoinValue = parseFloat(hashCoinBalance) * hashCoinPrice
    const notUSDT = (ethValue + hashCoinValue).toFixed(2)
    const totalBalance = parseFloat(usdtBalance) + ethValue + hashCoinValue
    const usdtPlusPortfolio = totalBalance.toFixed(2)

    return {
      notUSDT,
      usdtPlusPortfolio,
    }
  } catch (error) {
    console.error('Error getting portfolio value:', error)
    throw error
  }
}

async function getHashCoinBalance(): Promise<string> {
  try {
    if (!env.HASH_COIN_ADDRESS) return '0'
    if (isUSDTTokenAddress(env.HASH_COIN_ADDRESS))
      throw new Error(
        'HASH_COIN_ADDRESS must not be the USDT contract address. USDT is already tracked separately.'
      )
    const provider = getProvider()
    const tokenAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ]
    const tokenContract = new ethers.Contract(
      env.HASH_COIN_ADDRESS,
      tokenAbi,
      provider
    )
    const balance = await tokenContract.balanceOf(env.WALLET_PUBLIC_KEY)
    const decimals = await tokenContract.decimals()
    return ethers.formatUnits(balance, decimals)
  } catch (error) {
    console.error('Error getting hash coin balance:', error)
    return '0'
  }
}

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  delay = 1000
): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) {
        return response
      }
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

async function getHashCoinPrice(): Promise<number> {
  try {
    if (isUSDTTokenAddress(env.HASH_COIN_ADDRESS)) return 0
    const response = await fetchWithRetry(
      API_URLS.COINGECKO.TOKEN_PRICE(env.HASH_COIN_ADDRESS),
      { next: { revalidate: 60 } }
    )
    const data = await response.json()
    const address = env.HASH_COIN_ADDRESS.toLowerCase()
    return data[address]?.usd || 0
  } catch (error) {
    console.error('Error getting hash coin price:', error)
    return 0
  }
}

export async function getETHPrice(): Promise<number> {
  try {
    const response = await fetchWithRetry(API_URLS.COINGECKO.ETH_PRICE, {
      next: { revalidate: 60 },
    })
    const data = await response.json()
    return data.ethereum?.usd || 0
  } catch (error) {
    console.error('Error getting ETH price:', error)
    return 0
  }
}

export async function getProfitLoss(timeframe: string) {
  try {
    const chartData = await getChartData(timeframe)
    const latestValue = chartData[chartData.length - 1]?.value ?? 0
    const ethPriceUsd = await getETHPrice()
    const profitLossUsd = latestValue * ethPriceUsd
    return {
      value: profitLossUsd.toFixed(2),
      chartData,
    }
  } catch (error) {
    console.error('Error getting profit/loss:', error)
    return { value: '0', chartData: [] }
  }
}

export async function getChartData(
  timeframe: string
): Promise<ChartDataPoint[]> {
  const cacheKey = `chart_${timeframe}`
  const cached = getCachedData<ChartDataPoint[]>(
    cacheKey,
    env.WALLET_PUBLIC_KEY
  )

  if (cached) {
    return cached
  }

  try {
    const provider = getProvider()
    let startBlock = 0

    const secondsAgo =
      timeframeMapSeconds[timeframe as keyof typeof timeframeMapSeconds] ||
      86400
    if (secondsAgo > 0) {
      const currentBlock = await provider.getBlockNumber()
      const blocksPerSecond = 12
      const blocksAgo = Math.floor(secondsAgo / blocksPerSecond)
      startBlock = Math.max(0, currentBlock - blocksAgo)
    }

    const chainId = env.NETWORK === 'sepolia' ? 11155111 : 1
    const response = await fetchWithRetry(
      API_URLS.ETHERSCAN.TRANSACTIONS(
        env.WALLET_PUBLIC_KEY,
        startBlock,
        env.ETHERSCAN_API_KEY,
        chainId
      ),
      { next: { revalidate: 60 } }
    )
    const data = await response.json()
    if (data.status !== '1' || !data.result) {
      return generateMockChartData(timeframe)
    }

    const transactions = data.result
    const chartData: ChartDataPoint[] = []
    let currentValue = 0

    for (const tx of transactions) {
      const txValue = parseFloat(ethers.formatEther(tx.value || '0'))
      const isIncoming =
        tx.to?.toLowerCase() === env.WALLET_PUBLIC_KEY.toLowerCase()

      if (isIncoming) {
        currentValue += txValue
      } else if (
        tx.from?.toLowerCase() === env.WALLET_PUBLIC_KEY.toLowerCase()
      ) {
        currentValue -= txValue
      }

      chartData.push({
        date: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        value: currentValue,
        timestamp: parseInt(tx.timeStamp),
      })
    }

    if (chartData.length === 0) {
      return generateMockChartData(timeframe)
    }

    setCachedData(cacheKey, env.WALLET_PUBLIC_KEY, chartData)
    return chartData
  } catch (error) {
    console.error('Error getting chart data:', error)
    return generateMockChartData(timeframe)
  }
}

function generateMockChartData(timeframe: string): ChartDataPoint[] {
  const now = Date.now()
  const points = 20

  const duration =
    timeframeMapMilliseconds[
      timeframe as keyof typeof timeframeMapMilliseconds
    ] || 86400000
  const interval = duration / points
  const chartData: ChartDataPoint[] = []

  for (let i = 0; i < points; i++) {
    const timestamp = now - (points - i) * interval
    const value = Math.random() * 1000 + 200
    chartData.push({
      date: new Date(timestamp).toISOString(),
      value,
      timestamp: Math.floor(timestamp / 1000),
    })
  }

  return chartData
}

export async function getDepositAddress() {
  try {
    validateEnv()
    return {
      success: true,
      depositAddress: env.WALLET_PUBLIC_KEY,
      error: '',
    }
  } catch (error) {
    console.error('Error getting deposit address:', error)
    return {
      success: false,
      depositAddress: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function withdraw(amount: string, recipientAddress: string) {
  try {
    validateEnv()
    const provider = getProvider()

    const walletBalance = await provider.getBalance(env.WALLET_PUBLIC_KEY)
    const amountWei = ethers.parseEther(amount)

    if (walletBalance < amountWei) {
      const balanceEth = ethers.formatEther(walletBalance)
      return {
        success: false,
        txHash: '',
        error: `Insufficient balance. Available: ${parseFloat(balanceEth).toFixed(6)} ETH, requested: ${amount} ETH`,
      }
    }

    if (!ethers.isAddress(recipientAddress)) {
      return {
        success: false,
        txHash: '',
        error: 'Invalid recipient address',
      }
    }

    if (
      recipientAddress.toLowerCase() === env.WALLET_PUBLIC_KEY.toLowerCase()
    ) {
      return {
        success: false,
        txHash: '',
        error: 'Cannot withdraw to the same wallet address',
      }
    }

    const toAddress = recipientAddress

    const gasPrice = await provider.getFeeData()
    const estimatedGas = await provider.estimateGas({
      from: env.WALLET_PUBLIC_KEY,
      to: toAddress,
      value: amountWei,
    })

    const gasCost =
      estimatedGas * (gasPrice.gasPrice || gasPrice.maxFeePerGas || BigInt(0))

    if (walletBalance < amountWei + gasCost) {
      const balanceEth = ethers.formatEther(walletBalance)
      const requiredEth = ethers.formatEther(amountWei + gasCost)
      return {
        success: false,
        txHash: '',
        error: `Insufficient balance. Available: ${parseFloat(balanceEth).toFixed(6)} ETH, required: ${parseFloat(requiredEth).toFixed(6)} ETH (amount + gas)`,
      }
    }

    const walletFrom = new ethers.Wallet(env.WALLET_PRIVATE_KEY, provider)

    const tx = await walletFrom.sendTransaction({
      to: toAddress,
      value: amountWei,
    })

    await tx.wait()

    const { clearCache } = await import('@/app/lib/cache')
    clearCache('wallet_balance', env.WALLET_PUBLIC_KEY)
    clearCache('portfolio_value', env.WALLET_PUBLIC_KEY)

    return {
      success: true,
      txHash: tx.hash,
    }
  } catch (error) {
    console.error('Error withdrawing:', error)
    let errorMessage = 'Transaction failed'
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        errorMessage =
          'Insufficient funds. Please ensure you have enough ETH to cover the amount and gas fees.'
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was cancelled'
      } else {
        errorMessage = error.message
      }
    }

    return {
      success: false,
      txHash: '',
      error: errorMessage,
    }
  }
}
