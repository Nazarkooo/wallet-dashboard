'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { withdraw, getETHBalance } from '@/app/actions/utils'
import { useRouter } from 'next/navigation'
import WithdrawModalHeader from './WithdrawModalHeader'
import WithdrawBalanceDisplay from './WithdrawBalanceDisplay'
import WithdrawForm from './WithdrawForm'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
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

  useEffect(() => {
    if (isOpen) {
      checkBalance()
    }
  }, [isOpen])

  const checkBalance = async () => {
    setIsCheckingBalance(true)
    try {
      const ethBalance = await getETHBalance()
      setBalance(ethBalance)
    } catch (err) {
      console.error('Error checking balance:', err)
      setError('Failed to fetch balance')
    } finally {
      setIsCheckingBalance(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setTxHash(null)

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (balance && parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance')
      return
    }

    setIsLoading(true)

    try {
      const result = await withdraw(amount)

      if (result.success) {
        setTxHash(result.txHash)
        setTimeout(() => {
          router.refresh()
          onClose()
          setAmount('')
          setTxHash(null)
          checkBalance()
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
        <WithdrawModalHeader onClose={handleClose} isLoading={isLoading} />
        <WithdrawBalanceDisplay
          balance={balance}
          isCheckingBalance={isCheckingBalance}
        />
        {!isCheckingBalance && (
          <WithdrawForm
            amount={amount}
            balance={balance}
            isLoading={isLoading}
            error={error}
            txHash={txHash}
            onAmountChange={setAmount}
            onSubmit={handleSubmit}
            onClose={handleClose}
          />
        )}
      </div>
    </div>,
    document.body
  )
}
