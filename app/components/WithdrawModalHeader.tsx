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
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-euclid font-semibold text-2xl text-black">
        Withdraw ETH
      </h2>
      <button
        onClick={onClose}
        disabled={isLoading}
        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded border-none cursor-pointer disabled:cursor-not-allowed"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
