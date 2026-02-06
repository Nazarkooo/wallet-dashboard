const isTestMode =
  process.env.NODE_ENV === 'development' &&
  (!process.env.ETHERSCAN_API_KEY ||
    process.env.ETHERSCAN_API_KEY === 'test_key')

const networkName = process.env.NETWORK || 'mainnet'

export const env = {
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',
  WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY || '',
  WALLET_PUBLIC_KEY: process.env.WALLET_PUBLIC_KEY || '',
  HASH_COIN_ADDRESS: process.env.HASH_COIN_ADDRESS || '',
  RPC_URL:
    process.env.RPC_URL ||
    (networkName === 'sepolia'
      ? 'https://rpc.sepolia.org'
      : 'https://ethereum.publicnode.com'),
  NETWORK: networkName,
  IS_TEST_MODE: isTestMode,
} as const

export function validateEnv() {
  const required = [
    'ETHERSCAN_API_KEY',
    'WALLET_PRIVATE_KEY',
    'WALLET_PUBLIC_KEY',
    'HASH_COIN_ADDRESS',
  ] as const

  const missing = required.filter(key => !env[key] || env[key].trim() === '')

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file and provide real values from the client.`
    )
  }

  const isPlaceholder = (value: string) =>
    value.includes('your_') || value.includes('here')

  if (
    isPlaceholder(env.ETHERSCAN_API_KEY) ||
    isPlaceholder(env.WALLET_PRIVATE_KEY)
  ) {
    throw new Error(
      'Please provide real environment variables. Placeholder values are not allowed. All keys from .env + private key wallet are required for full functionality.'
    )
  }

  if (!env.WALLET_PRIVATE_KEY.startsWith('0x')) {
    throw new Error('WALLET_PRIVATE_KEY must start with 0x')
  }

  if (!env.WALLET_PUBLIC_KEY.startsWith('0x')) {
    throw new Error('WALLET_PUBLIC_KEY must start with 0x')
  }

  if (!env.HASH_COIN_ADDRESS.startsWith('0x')) {
    throw new Error(
      'HASH_COIN_ADDRESS must be a valid Ethereum address starting with 0x'
    )
  }
}
