/* eslint-disable no-console */
const { ethers } = require('ethers')

const wallet = ethers.Wallet.createRandom()

console.log('\n=== Test Wallet Generated ===\n')
console.log('Add these to your .env.local file:\n')
console.log(`WALLET_PRIVATE_KEY=${wallet.privateKey}`)
console.log(`WALLET_PUBLIC_KEY=${wallet.address}\n`)
console.log('⚠️  This is a TEST wallet. Do NOT use it with real funds!\n')
console.log('For EtherScan API key, get it from: https://etherscan.io/myapikey')
console.log('For HASH_COIN_ADDRESS, use any ERC-20 token contract address\n')
