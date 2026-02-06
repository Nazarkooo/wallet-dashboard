'use client'

import { useEffect } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'
import { motion, useTransform } from 'framer-motion'
import type { NumberFlowProps } from '@/app/types'

export default function NumberFlow({
  value,
  decimals = 2,
  prefix = '',
  suffix = '',
  className = '',
}: NumberFlowProps) {
  const numValue =
    typeof value === 'string'
      ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
      : value
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  })

  const displayValue = useTransform(spring, latest => {
    return latest.toFixed(decimals)
  })

  useEffect(() => {
    motionValue.set(numValue)
  }, [numValue, motionValue])

  return (
    <span className={className} style={{ fontWeight: 400 }}>
      {prefix}
      <motion.span style={{ fontWeight: 400 }}>{displayValue}</motion.span>
      {suffix}
    </span>
  )
}
