'use server'

import { validateEnv } from '@/app/lib/env'

validateEnv()

export async function getWalletBalance() {
  return { balance: '0', usdc: '0' }
}

export async function getPortfolioValue() {
  return { notUSDC: '0', usdcPlusPortfolio: '0' }
}

export async function getProfitLoss(_timeframe: string) {
  return { value: '0', chartData: [] }
}

export async function deposit(_amount: string) {
  return { success: false, txHash: '' }
}

export async function withdraw(_amount: string) {
  return { success: false, txHash: '' }
}
