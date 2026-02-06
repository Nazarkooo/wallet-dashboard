'use client'

import { useState, useEffect } from 'react'
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
  const [recipientAddress, setRecipientAddress] = useState('')
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
    } catch {
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

    if (!recipientAddress) {
      setError('Please enter recipient address')
      return
    }

    setIsLoading(true)

    try {
      const result = await withdraw(amount, recipientAddress)

      if (result.success) {
        setTxHash(result.txHash)
        router.refresh()
        setTimeout(() => {
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
      setRecipientAddress('')
      setError(null)
      setTxHash(null)
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  if (!mounted) {
    if (isOpen && typeof window !== 'undefined') {
      setTimeout(() => setMounted(true), 0)
    }
    return null
  }

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
        <WithdrawModalHeader onClose={handleClose} isLoading={isLoading} />
        <WithdrawBalanceDisplay
          balance={balance}
          isCheckingBalance={isCheckingBalance}
        />
        {!isCheckingBalance && (
          <WithdrawForm
            amount={amount}
            recipientAddress={recipientAddress}
            balance={balance}
            isLoading={isLoading}
            error={error}
            txHash={txHash}
            onAmountChange={setAmount}
            onRecipientAddressChange={setRecipientAddress}
            onSubmit={handleSubmit}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  )

  if (typeof window === 'undefined') {
    return null
  }

  return portalElement
}
