'use client'

interface WithdrawBalanceDisplayProps {
  balance: string | null
  isCheckingBalance: boolean
}

export default function WithdrawBalanceDisplay({
  balance,
  isCheckingBalance,
}: WithdrawBalanceDisplayProps) {
  if (isCheckingBalance) {
    return (
      <div className="py-8 text-center">
        <p className="font-euclid text-gray-500">Checking balance...</p>
      </div>
    )
  }

  if (!balance) {
    return null
  }

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <p className="font-euclid text-sm text-gray-600 mb-1">
        Available Balance
      </p>
      <p className="font-euclid text-lg font-semibold text-black">
        {parseFloat(balance).toFixed(4)} ETH
      </p>
    </div>
  )
}
