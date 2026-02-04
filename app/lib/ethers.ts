import { ethers } from 'ethers'
import { env, validateEnv } from './env'

validateEnv()

export function getProvider() {
  return new ethers.JsonRpcProvider('https://eth.llamarpc.com', 'homestead')
}

export function getEtherscanProvider() {
  return new ethers.EtherscanProvider('homestead', env.ETHERSCAN_API_KEY)
}

export function getWallet() {
  if (!env.WALLET_PRIVATE_KEY) {
    throw new Error('WALLET_PRIVATE_KEY is not set')
  }
  const provider = getProvider()
  return new ethers.Wallet(env.WALLET_PRIVATE_KEY, provider)
}
