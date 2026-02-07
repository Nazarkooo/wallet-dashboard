export const API_URLS = {
  COINGECKO: {
    TOKEN_PRICE: (contractAddress: string) =>
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddress}&vs_currencies=usd&include_24hr_change=true`,
    ETH_PRICE:
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true',
  },
  ETHERSCAN: {
    TRANSACTIONS: (
      address: string,
      startBlock: number,
      apiKey: string,
      chainId: number
    ) =>
      `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&sort=asc&apikey=${apiKey}`,
  },
} as const
