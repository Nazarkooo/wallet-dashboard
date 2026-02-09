'use client'

import { useState, useEffect } from 'react'
import { getDepositAddress } from '@/app/actions/utils'
import CloseIcon from './icons/CloseIcon'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [depositAddress, setDepositAddress] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

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
    if (!isOpen || !mounted) return
    setError(null)
    setDepositAddress(null)
    setIsLoading(true)
    getDepositAddress()
      .then(result => {
        if (result.success && result.depositAddress) {
          setDepositAddress(result.depositAddress)
        } else {
          setError(result.error || 'Failed to get deposit address')
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      })
      .finally(() => setIsLoading(false))
  }, [isOpen, mounted])

  const handleCopyAddress = () => {
    if (
      depositAddress &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard
    ) {
      navigator.clipboard.writeText(depositAddress)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      setDepositAddress(null)
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
        <div className="flex items-center justify-between mb-[15px]">
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

        <div className="flex flex-col gap-[10px]">
          {error && (
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="font-euclid text-sm text-red-600">{error}</p>
            </div>
          )}

          {isLoading && !depositAddress && (
            <div className="py-10 text-center">
              <p className="font-euclid text-base text-gray-500">Loading...</p>
            </div>
          )}

          {depositAddress && (
            <div>
              <label className="block font-euclid text-sm font-medium text-gray-700 mb-4">
                Wallet address for deposits
              </label>
              <div
                className="w-full font-mono text-base text-black break-all bg-white disabled:opacity-50 focus:outline-none transition-all mb-2.5"
                style={{
                  border: '2px solid #d1d5db',
                  borderRadius: '12px',
                  padding: '12px 14px',
                }}
              >
                {depositAddress}
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-8 pt-8">
            {depositAddress && (
              <button
                type="button"
                onClick={handleCopyAddress}
                style={{
                  flex: '1 1 0',
                  height: '44px',
                  borderRadius: '8px',
                  gap: '8px',
                  padding: '7px 12px',
                  backgroundColor: '#ff5100',
                  border: 'none',
                  cursor: 'pointer',
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
                  e.currentTarget.style.backgroundColor = '#ea580c'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#ff5100'
                }}
              >
                Copy
              </button>
            )}
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
                opacity: isLoading ? 0.5 : 1,
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
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (typeof window === 'undefined') {
    return null
  }

  return portalElement
}
