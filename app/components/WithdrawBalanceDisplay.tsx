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
      <div className="py-10 text-center mb-6">
        <p className="font-euclid text-base text-gray-500">
          Checking balance...
        </p>
      </div>
    )
  }

  if (!balance) {
    return null
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
      <p className="font-euclid text-sm font-medium text-gray-600 mb-[5px]">
        Available Balance
      </p>
      <p className="font-euclid text-xl font-semibold text-black">
        {parseFloat(balance).toFixed(4)} ETH
      </p>
    </div>
  )
}
