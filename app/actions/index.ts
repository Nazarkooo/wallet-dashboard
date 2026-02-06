'use server'

import { validateEnv, env } from '@/app/lib/env'
import { getProvider, getWallet } from '@/app/lib/ethers'
import { getCachedData, setCachedData } from '@/app/lib/cache'
import { API_URLS } from '@/app/lib/urls'
import {
  timeframeMapSeconds,
  timeframeMapMilliseconds,
} from '@/app/lib/timeframe'
import { ethers } from 'ethers'
import type { ChartDataPoint } from '@/app/types'

validateEnv()

export async function getWalletBalance() {
  try {
    const provider = getProvider()
    const balance = await provider.getBalance(env.WALLET_PUBLIC_KEY)
    const usdtBalance = await getUSDTBalance()

    const previousBalance = parseFloat(usdtBalance) * 0.95
    const currentBalance = parseFloat(usdtBalance)
    const dailyChange = currentBalance - previousBalance
    const dailyChangePercent =
      previousBalance > 0
        ? ((dailyChange / previousBalance) * 100).toFixed(1)
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
    return {
      balance: '0',
      usdt: '0',
      dailyChange: {
        amount: '+$0.00',
        percentage: '0.0%',
      },
    }
  }
}

async function getUSDTBalance(): Promise<string> {
  try {
    const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const provider = getProvider()
    const usdtAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ]
    const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, provider)
    const balance = await usdtContract.balanceOf(env.WALLET_PUBLIC_KEY)
    const decimals = await usdtContract.decimals()
    return ethers.formatUnits(balance, decimals)
  } catch (error) {
    console.error('Error getting USDT balance:', error)
    return '0'
  }
}

export async function getPortfolioValue() {
  try {
    const provider = getProvider()
    const hashCoinBalance = await getHashCoinBalance()
    const hashCoinPrice = await getHashCoinPrice()
    const notUSDT = (parseFloat(hashCoinBalance) * hashCoinPrice).toFixed(2)

    const usdtBalance = await getUSDTBalance()
    const ethBalance = await provider.getBalance(env.WALLET_PUBLIC_KEY)
    const ethPrice = await getETHPrice()
    const totalBalance =
      parseFloat(usdtBalance) +
      parseFloat(ethers.formatEther(ethBalance)) * ethPrice +
      parseFloat(notUSDT)
    const usdtPlusPortfolio = totalBalance.toFixed(2)

    return {
      notUSDT,
      usdtPlusPortfolio,
    }
  } catch (error) {
    console.error('Error getting portfolio value:', error)
    return { notUSDT: '0', usdtPlusPortfolio: '0' }
  }
}

async function getHashCoinBalance(): Promise<string> {
  try {
    if (!env.HASH_COIN_ADDRESS) return '0'
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

async function getHashCoinPrice(): Promise<number> {
  try {
    const response = await fetch(
      API_URLS.COINGECKO.TOKEN_PRICE(env.HASH_COIN_ADDRESS)
    )
    const data = await response.json()
    const address = env.HASH_COIN_ADDRESS.toLowerCase()
    return data[address]?.usd || 0
  } catch (error) {
    console.error('Error getting hash coin price:', error)
    return 0
  }
}

async function getETHPrice(): Promise<number> {
  try {
    const response = await fetch(API_URLS.COINGECKO.ETH_PRICE)
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
    const latestValue = chartData[chartData.length - 1]?.value || 0
    const firstValue = chartData[0]?.value || 0
    const profitLoss = latestValue - firstValue

    return {
      value: profitLoss.toFixed(2),
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

    const response = await fetch(
      API_URLS.ETHERSCAN.TRANSACTIONS(
        env.WALLET_PUBLIC_KEY,
        startBlock,
        env.ETHERSCAN_API_KEY
      )
    )
    const data = await response.json()

    if (data.status !== '1' || !data.result) {
      return generateMockChartData(timeframe, true)
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
        value: Math.max(0, currentValue),
        timestamp: parseInt(tx.timeStamp),
        isMock: false,
      })
    }

    if (chartData.length === 0) {
      return generateMockChartData(timeframe, true)
    }

    setCachedData(cacheKey, env.WALLET_PUBLIC_KEY, chartData)
    return chartData
  } catch (error) {
    console.error('Error getting chart data:', error)
    return generateMockChartData(timeframe, true)
  }
}

function generateMockChartData(
  timeframe: string,
  isMock: boolean = true
): ChartDataPoint[] {
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
      isMock: isMock,
    })
  }

  return chartData
}

export async function deposit(amount: string) {
  try {
    validateEnv()
    const wallet = getWallet()
    const tx = await wallet.sendTransaction({
      to: env.WALLET_PUBLIC_KEY,
      value: ethers.parseEther(amount),
    })

    await tx.wait()

    return {
      success: true,
      txHash: tx.hash,
    }
  } catch (error) {
    console.error('Error depositing:', error)
    return {
      success: false,
      txHash: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function withdraw(amount: string) {
  try {
    validateEnv()
    const wallet = getWallet()
    const provider = getProvider()
    const balance = await provider.getBalance(wallet.address)

    if (balance < ethers.parseEther(amount)) {
      return {
        success: false,
        txHash: '',
        error: 'Insufficient balance',
      }
    }

    const tx = await wallet.sendTransaction({
      to: env.WALLET_PUBLIC_KEY,
      value: ethers.parseEther(amount),
    })

    await tx.wait()

    return {
      success: true,
      txHash: tx.hash,
    }
  } catch (error) {
    console.error('Error withdrawing:', error)
    return {
      success: false,
      txHash: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
