'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import NumberFlow from './NumberFlow'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'
import type { WalletCardClientProps } from '@/app/types'

export default function WalletCardClient({
  usdt,
  dailyChange,
  portfolioNotUSDT,
  portfolioTotal,
}: WalletCardClientProps) {
  const [walletName, setWalletName] = useState('My Wallet')
  const [isEditing, setIsEditing] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)

  return (
    <div className="border border-[#E5E5E5] wallet-card">
      <div className="flex items-start justify-between wallet-header max-[597px]:flex-col max-[597px]:gap-4">
        <div className="flex items-center">
          <motion.div
            className="flex items-center justify-center flex-shrink-0 wallet-icon-wrapper"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img
              src="/wallet-icon.svg"
              alt="Wallet Icon"
              width={40}
              height={40}
              className="w-10 h-10 block"
            />
          </motion.div>
          <div className="wallet-text-container">
            {isEditing ? (
              <input
                type="text"
                value={walletName}
                onChange={e => setWalletName(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={e => {
                  if (e.key === 'Enter') setIsEditing(false)
                }}
                className="wallet-input"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="wallet-title">{walletName}</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center bg-transparent border-none cursor-pointer p-0"
                >
                  <img
                    src="/edit.svg"
                    alt="Edit"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                </button>
              </div>
            )}
            <p className="wallet-subtitle">Joined Nov 2025</p>
          </div>
        </div>
        <div className="flex items-start gap-28 max-[1300px]:flex-col max-[1300px]:gap-4 max-[597px]:w-full">
          <div>
            <p className="portfolio-label">Portfolio ( Not USDT )</p>
            <p className="portfolio-value">${portfolioNotUSDT}</p>
          </div>
          <div className="portfolio-divider max-[1300px]:hidden" />
          <div className="pl-28 max-[1300px]:pl-0">
            <p className="portfolio-label mb-4">USDT + Portfolio</p>
            <div className="flex items-center gap-4">
              <img
                src="/money.svg"
                alt="Money"
                width={16}
                height={16}
                className="w-4 h-4"
              />
              <p className="portfolio-value">${portfolioTotal}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pb-19">
        <h3 className="usdt-balance pb-4">
          <NumberFlow value={usdt} decimals={2} suffix=" USDT" />
        </h3>
        <div className="flex items-center pt-4 gap-4">
          <span
            className="daily-change"
            style={{
              color: dailyChange.percentage.startsWith('-')
                ? '#dc2626'
                : '#3cab68',
            }}
          >
            {dailyChange.amount}
          </span>
          <img
            src="/arrow.svg"
            alt="Arrow"
            width={12}
            height={12}
            className="w-3 h-3"
            style={{
              transform: dailyChange.percentage.startsWith('-')
                ? 'rotate(180deg)'
                : 'none',
              filter: dailyChange.percentage.startsWith('-')
                ? 'brightness(0) saturate(100%) invert(27%) sepia(95%) saturate(1500%) hue-rotate(340deg) brightness(95%) contrast(90%)'
                : 'brightness(0) saturate(100%) invert(60%) sepia(90%) saturate(400%) hue-rotate(90deg) brightness(95%) contrast(85%)',
            }}
          />
          <span
            className="daily-change"
            style={{
              color: dailyChange.percentage.startsWith('-')
                ? '#dc2626'
                : '#3cab68',
            }}
          >
            {dailyChange.percentage}
          </span>
          <span className="daily-change daily-change-label">Today</span>
        </div>
      </div>

      <div className="flex gap-8">
        <motion.button
          className="btn-deposit flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{ scale: 0.95, opacity: 0.8 }}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setIsDepositModalOpen(true)
          }}
        >
          <img
            src="/import.svg"
            alt="Import"
            width={30}
            height={30}
            className="pr-2"
            style={{ width: '30px', height: '30px', display: 'block' }}
            onError={() => {
              console.error('Failed to load import.svg icon')
            }}
          />
          <span className="btn-text-white">Deposit</span>
        </motion.button>
        <motion.button
          className="btn-withdraw flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          whileDrag={{ scale: 0.95, opacity: 0.8 }}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setIsWithdrawModalOpen(true)
          }}
        >
          <img
            src="/export.svg"
            alt="Export"
            width={20}
            height={20}
            className="w-5 h-5 pr-2"
            style={{ width: '30px', height: '30px' }}
          />
          <span className="btn-text-black">Withdraw</span>
        </motion.button>
      </div>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false)
        }}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false)
        }}
      />
    </div>
  )
}
