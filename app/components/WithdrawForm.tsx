'use client'

interface WithdrawFormProps {
  amount: string
  balance: string | null
  isLoading: boolean
  error: string | null
  txHash: string | null
  onAmountChange: (amount: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function WithdrawForm({
  amount,
  balance,
  isLoading,
  error,
  txHash,
  onAmountChange,
  onSubmit,
  onClose,
}: WithdrawFormProps) {
  const handleMax = () => {
    if (balance) {
      const maxAmount = (parseFloat(balance) * 0.99).toFixed(4)
      onAmountChange(maxAmount)
    }
  }

  const isWithdrawDisabled =
    isLoading ||
    !amount ||
    parseFloat(amount) <= 0 ||
    (balance !== null && parseFloat(amount) > parseFloat(balance))

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="amount"
            className="block font-euclid text-sm text-gray-700"
          >
            Amount (ETH)
          </label>
          {balance && (
            <button
              type="button"
              onClick={handleMax}
              disabled={isLoading}
              className="font-euclid text-xs text-[#FF5100] bg-transparent border-none cursor-pointer disabled:cursor-not-allowed hover:underline"
            >
              Max
            </button>
          )}
        </div>
        <input
          id="amount"
          type="number"
          step="0.0001"
          min="0"
          max={balance || undefined}
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-euclid text-base text-black disabled:opacity-50"
          placeholder="0.0"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-euclid text-sm text-red-600">{error}</p>
        </div>
      )}

      {txHash && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-euclid text-sm text-green-600 mb-1">
            Transaction successful!
          </p>
          <p className="font-euclid text-xs text-green-500 break-all">
            TX: {txHash}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-euclid font-medium border-none cursor-pointer disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isWithdrawDisabled}
          className={`flex-1 px-4 py-3 text-white rounded-lg font-euclid font-medium border-none ${
            isWithdrawDisabled
              ? 'bg-[#ffa366] cursor-not-allowed'
              : 'bg-[#FF5100] cursor-pointer'
          }`}
        >
          {isLoading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </form>
  )
}
