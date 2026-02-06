import { ethers } from 'ethers'
import { env, validateEnv } from './env'

validateEnv()

type JsonRpcProviderWithInternals = ethers.JsonRpcProvider & {
  _networkPromise?: Promise<ethers.Network>
  _detectNetwork?: () => Promise<ethers.Network>
}

if (typeof process !== 'undefined' && process.stderr) {
  const originalWrite = process.stderr.write.bind(process.stderr)
  process.stderr.write = ((
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((err?: Error | null) => void),
    cb?: (err?: Error | null) => void
  ): boolean => {
    const message = chunk?.toString() || ''
    if (
      message.includes('JsonRpcProvider failed to detect network') ||
      message.includes('failed to bootstrap network detection')
    ) {
      return true
    }
    if (typeof encoding === 'function') {
      return originalWrite(chunk, encoding)
    }
    return originalWrite(chunk, encoding, cb)
  }) as typeof process.stderr.write
}

let cachedProvider: ethers.JsonRpcProvider | null = null

export function getProvider(): ethers.JsonRpcProvider {
  if (cachedProvider) {
    return cachedProvider
  }

  const rpcUrl = env.RPC_URL
  const network = ethers.Network.from(env.NETWORK || 'mainnet')
  const provider = new ethers.JsonRpcProvider(
    rpcUrl,
    network
  ) as JsonRpcProviderWithInternals

  if (provider._networkPromise) {
    provider._networkPromise = Promise.resolve(network)
  }

  provider._detectNetwork = async () => network
  cachedProvider = provider as ethers.JsonRpcProvider

  return provider
}

export function getEtherscanProvider() {
  const network = env.NETWORK === 'sepolia' ? 'sepolia' : 'homestead'
  return new ethers.EtherscanProvider(network, env.ETHERSCAN_API_KEY)
}

export function getWallet() {
  if (!env.WALLET_PRIVATE_KEY) {
    throw new Error('WALLET_PRIVATE_KEY is not set')
  }
  const provider = getProvider()
  return new ethers.Wallet(env.WALLET_PRIVATE_KEY, provider)
}
