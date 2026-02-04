const isTestMode =
  process.env.NODE_ENV === 'development' &&
  (!process.env.ETHERSCAN_API_KEY ||
    process.env.ETHERSCAN_API_KEY === 'test_key')

export const env = {
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || '',
  WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY || '',
  WALLET_PUBLIC_KEY: process.env.WALLET_PUBLIC_KEY || '',
  HASH_COIN_ADDRESS: process.env.HASH_COIN_ADDRESS || '',
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
      `Missing required environment variables: ${missing.join(', ')}. Please check your .env.local file`
    )
  }

  if (env.WALLET_PRIVATE_KEY && !env.WALLET_PRIVATE_KEY.startsWith('0x')) {
    throw new Error('WALLET_PRIVATE_KEY must start with 0x')
  }

  if (env.WALLET_PUBLIC_KEY && !env.WALLET_PUBLIC_KEY.startsWith('0x')) {
    throw new Error('WALLET_PUBLIC_KEY must start with 0x')
  }

  if (env.HASH_COIN_ADDRESS && !env.HASH_COIN_ADDRESS.startsWith('0x')) {
    throw new Error(
      'HASH_COIN_ADDRESS must be a valid Ethereum address starting with 0x'
    )
  }
}
