'use client'

import CloseIcon from './icons/CloseIcon'

interface WithdrawModalHeaderProps {
  onClose: () => void
  isLoading: boolean
}

export default function WithdrawModalHeader({
  onClose,
  isLoading,
}: WithdrawModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-10">
      <h2 className="font-euclid font-semibold text-3xl text-black">
        Withdraw ETH
      </h2>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg border-none cursor-pointer disabled:cursor-not-allowed transition-colors"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
