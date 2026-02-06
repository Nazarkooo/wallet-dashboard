'use client'

import { useState, useEffect } from 'react'
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
    if (isOpen && !mounted) {
      setMounted(true)
    }
  }, [isOpen, mounted])

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
        router.refresh()
        setTimeout(() => {
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

  if (!isOpen) {
    return null
  }

  if (typeof window === 'undefined') {
    return null
  }

  if (!mounted) {
    if (isOpen && typeof window !== 'undefined') {
      setTimeout(() => setMounted(true), 0)
    }
    return null
  }

  const isDepositDisabled = isLoading || !amount || parseFloat(amount) <= 0

  const portalElement = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 99999,
        position: 'fixed',
        display: 'flex',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 99998,
          pointerEvents: 'auto',
        }}
      />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '32rem',
          width: '100%',
          padding: '32px',
          maxHeight: '90vh',
          overflowY: 'auto',
          zIndex: 99999,
          pointerEvents: 'auto',
        }}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-euclid font-semibold text-3xl text-black">
            Deposit ETH
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg border-none cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="amount"
              className="block font-euclid text-sm font-medium text-gray-700 mb-4"
            >
              Amount (ETH)
            </label>
            <input
              id="amount"
              type="number"
              step="0.0001"
              min="0"
              value={amount || ''}
              onChange={e => setAmount(e.target.value)}
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
              onClick={handleClose}
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
              disabled={isDepositDisabled}
              style={{
                flex: '1 1 0',
                height: '44px',
                borderRadius: '8px',
                gap: '8px',
                padding: '7px 12px',
                backgroundColor: isDepositDisabled ? '#ffa366' : '#ff5100',
                border: 'none',
                cursor: isDepositDisabled ? 'not-allowed' : 'pointer',
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
                if (!isDepositDisabled) {
                  e.currentTarget.style.backgroundColor = '#ea580c'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = isDepositDisabled
                  ? '#ffa366'
                  : '#ff5100'
              }}
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  if (typeof window === 'undefined') {
    return null
  }

  return portalElement
}
