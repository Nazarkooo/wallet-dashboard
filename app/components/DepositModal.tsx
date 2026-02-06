'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { deposit } from '@/app/actions/utils'
import { useRouter } from 'next/navigation'
import CloseIcon from './icons/CloseIcon'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTxHash(null)

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setIsLoading(true)

    try {
      const result = await deposit(amount)

      if (result.success) {
        setTxHash(result.txHash)
        setTimeout(() => {
          router.refresh()
          onClose()
          setAmount('')
          setTxHash(null)
        }, 2000)
      } else {
        setError(result.error || 'Transaction failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setAmount('')
      setError(null)
      setTxHash(null)
      onClose()
    }
  }

  if (!mounted || !isOpen) {
    return null
  }

  const isDepositDisabled = isLoading || !amount || parseFloat(amount) <= 0

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-euclid font-semibold text-2xl text-black">
            Deposit ETH
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded border-none cursor-pointer disabled:cursor-not-allowed"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="amount"
              className="block font-euclid text-sm text-gray-700 mb-2"
            >
              Amount (ETH)
            </label>
            <input
              id="amount"
              type="number"
              step="0.0001"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
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
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-euclid font-medium border-none cursor-pointer disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDepositDisabled}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-euclid font-medium border-none ${
                isDepositDisabled
                  ? 'bg-[#ffa366] cursor-not-allowed'
                  : 'bg-[#FF5100] cursor-pointer'
              }`}
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
