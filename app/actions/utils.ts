'use server'

import { validateEnv, env } from '@/app/lib/env'
import { getProvider, getWallet } from '@/app/lib/ethers'
import { getCachedData, setCachedData } from '@/app/lib/cache'
import {
  timeframeMapSeconds,
  timeframeMapMilliseconds,
} from '@/app/lib/timeframe'
import { API_URLS } from '@/app/lib/urls'
import { ethers } from 'ethers'
import type { ChartDataPoint } from '@/app/types'

validateEnv()

export async function getWalletBalance() {
  try {
    const provider = getProvider()
    const balance = await provider.getBalance(env.WALLET_PUBLIC_KEY)
    const usdcBalance = await getUSDCBalance()

    const previousBalance = parseFloat(usdcBalance) * 0.95
    const currentBalance = parseFloat(usdcBalance)
    const dailyChange = currentBalance - previousBalance
    const dailyChangePercent =
      previousBalance > 0
        ? ((dailyChange / previousBalance) * 100).toFixed(1)
        : '0.0'

    return {
      balance: ethers.formatEther(balance),
      usdc: usdcBalance,
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
      usdc: '0',
      dailyChange: {
        amount: '+$0.00',
        percentage: '0.0%',
      },
    }
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

async function getUSDCBalance(): Promise<string> {
  try {
    const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    const provider = getProvider()
    const usdcAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function decimals() view returns (uint8)',
    ]
    const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider)
    const balance = await usdcContract.balanceOf(env.WALLET_PUBLIC_KEY)
    const decimals = await usdcContract.decimals()
    return ethers.formatUnits(balance, decimals)
  } catch (error) {
    console.error('Error getting USDC balance:', error)
    return '0'
  }
}

export async function getPortfolioValue() {
  try {
    const provider = getProvider()
    const hashCoinBalance = await getHashCoinBalance()
    const hashCoinPrice = await getHashCoinPrice()
    const notUSDC = (parseFloat(hashCoinBalance) * hashCoinPrice).toFixed(2)

    const usdcBalance = await getUSDCBalance()
    const ethBalance = await provider.getBalance(env.WALLET_PUBLIC_KEY)
    const ethPrice = await getETHPrice()
    const totalBalance =
      parseFloat(usdcBalance) +
      parseFloat(ethers.formatEther(ethBalance)) * ethPrice +
      parseFloat(notUSDC)
    const usdcPlusPortfolio = totalBalance.toFixed(2)

    return {
      notUSDC,
      usdcPlusPortfolio,
    }
  } catch (error) {
    console.error('Error getting portfolio value:', error)
    return { notUSDC: '0', usdcPlusPortfolio: '0' }
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

async function getETHPrice(): Promise<number> {
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

    const response = await fetchWithRetry(
      API_URLS.ETHERSCAN.TRANSACTIONS(
        env.WALLET_PUBLIC_KEY,
        startBlock,
        env.ETHERSCAN_API_KEY
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
        value: Math.max(0, currentValue),
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

export async function deposit(amount: string) {
  try {
    validateEnv()
    const wallet = getWallet()
    const provider = getProvider()

    const walletBalance = await provider.getBalance(wallet.address)
    const amountWei = ethers.parseEther(amount)

    const gasPrice = await provider.getFeeData()
    const estimatedGas = await provider.estimateGas({
      from: wallet.address,
      to: env.WALLET_PUBLIC_KEY,
      value: amountWei,
    })

    const gasCost =
      estimatedGas * (gasPrice.gasPrice || gasPrice.maxFeePerGas || BigInt(0))
    const totalRequired = amountWei + gasCost

    if (walletBalance < totalRequired) {
      const balanceEth = ethers.formatEther(walletBalance)
      const requiredEth = ethers.formatEther(totalRequired)
      return {
        success: false,
        txHash: '',
        error: `Insufficient funds. Your wallet has ${parseFloat(balanceEth).toFixed(6)} ETH, but ${parseFloat(requiredEth).toFixed(6)} ETH is required (amount + gas fees).`,
      }
    }

    const tx = await wallet.sendTransaction({
      to: env.WALLET_PUBLIC_KEY,
      value: amountWei,
    })

    await tx.wait()

    return {
      success: true,
      txHash: tx.hash,
    }
  } catch (error) {
    console.error('Error depositing:', error)

    let errorMessage = 'Transaction failed'
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        errorMessage =
          'Insufficient funds in your wallet. Please ensure you have enough ETH to cover the amount and gas fees.'
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

export async function withdraw(amount: string) {
  try {
    validateEnv()
    const provider = getProvider()
    const wallet = getWallet()

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

    const gasPrice = await provider.getFeeData()
    const estimatedGas = await provider.estimateGas({
      from: wallet.address,
      to: env.WALLET_PUBLIC_KEY,
      value: amountWei,
    })

    const gasCost =
      estimatedGas * (gasPrice.gasPrice || gasPrice.maxFeePerGas || BigInt(0))
    const walletSenderBalance = await provider.getBalance(wallet.address)

    if (walletSenderBalance < gasCost) {
      return {
        success: false,
        txHash: '',
        error:
          'Insufficient funds in sender wallet to pay for gas fees. Please add ETH to your wallet.',
      }
    }

    const tx = await wallet.sendTransaction({
      to: env.WALLET_PUBLIC_KEY,
      value: amountWei,
    })

    await tx.wait()

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
