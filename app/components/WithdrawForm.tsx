'use client'

interface WithdrawFormProps {
  amount: string
  recipientAddress: string
  balance: string | null
  isLoading: boolean
  error: string | null
  txHash: string | null
  onAmountChange: (amount: string) => void
  onRecipientAddressChange: (address: string) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function WithdrawForm({
  amount,
  recipientAddress,
  balance,
  isLoading,
  error,
  txHash,
  onAmountChange,
  onRecipientAddressChange,
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
    !recipientAddress ||
    (balance !== null && parseFloat(amount) > parseFloat(balance))

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="amount"
            className="block font-euclid text-sm font-medium text-gray-700"
          >
            Amount (ETH)
          </label>
          {balance && (
            <button
              type="button"
              onClick={handleMax}
              disabled={isLoading}
              className="font-euclid text-sm font-medium text-[#FF5100] bg-transparent border-none cursor-pointer disabled:cursor-not-allowed hover:underline transition-colors"
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
          value={amount || ''}
          onChange={e => onAmountChange(e.target.value)}
          disabled={isLoading}
          style={{
            border: '2px solid #d1d5db',
            borderRadius: '12px',
            padding: '12px 14px',
          }}
          className="w-full font-euclid text-base text-black disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FF5100] focus:border-[#FF5100] transition-all mb-[10px]"
          placeholder="0.0"
          required
        />
      </div>

      <div>
        <label
          htmlFor="recipientAddress"
          className="block font-euclid text-sm font-medium text-gray-700 mb-4"
        >
          Recipient Address
        </label>
        <input
          id="recipientAddress"
          type="text"
          value={recipientAddress || ''}
          onChange={e => onRecipientAddressChange(e.target.value)}
          disabled={isLoading}
          style={{
            border: '2px solid #d1d5db',
            borderRadius: '12px',
            padding: '12px 14px',
          }}
          className="w-full font-euclid text-base text-black disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FF5100] focus:border-[#FF5100] transition-all mb-[10px]"
          placeholder="0x..."
          required
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 rounded-xl">
          <p className="font-euclid text-sm text-red-600">{error}</p>
        </div>
      )}

      {txHash && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <p className="font-euclid text-sm font-medium text-green-600 mb-2">
            Transaction successful!
          </p>
          <p className="font-euclid text-xs text-green-500 break-all">
            TX: {txHash}
          </p>
        </div>
      )}

      <div className="flex gap-4 mt-8 pt-8">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          style={{
            flex: '1 1 0',
            height: '44px',
            borderRadius: '8px',
            gap: '8px',
            padding: '7px 12px',
            backgroundColor: '#f8f8f8',
            border: '1px solid #e1e1e1',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontFamily:
              "'Euclid Circular A', Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '100%',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            color: '#000000',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#f0f0f0'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#f8f8f8'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isWithdrawDisabled}
          style={{
            flex: '1 1 0',
            height: '44px',
            borderRadius: '8px',
            gap: '8px',
            padding: '7px 12px',
            backgroundColor: isWithdrawDisabled ? '#ffa366' : '#ff5100',
            border: 'none',
            cursor: isWithdrawDisabled ? 'not-allowed' : 'pointer',
            fontFamily:
              "'Euclid Circular A', Inter, -apple-system, BlinkMacSystemFont, sans-serif",
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '100%',
            letterSpacing: '-0.02em',
            textAlign: 'center',
            color: '#ffffff',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => {
            if (!isWithdrawDisabled) {
              e.currentTarget.style.backgroundColor = '#ea580c'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = isWithdrawDisabled
              ? '#ffa366'
              : '#ff5100'
          }}
        >
          {isLoading ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </form>
  )
}
