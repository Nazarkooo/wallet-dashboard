'use client'

import { useEffect } from 'react'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      value: number
      originalDate: string
    }
  }>
  setHoveredValue: (value: number | null) => void
  setHoveredDate: (date: string | null) => void
}

export default function ChartTooltip({
  active,
  payload,
  setHoveredValue,
  setHoveredDate,
}: ChartTooltipProps) {
  useEffect(() => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      setHoveredValue(data.value)
      setHoveredDate(
        new Date(data.originalDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        })
      )
    } else {
      setHoveredValue(null)
      setHoveredDate(null)
    }
  }, [active, payload, setHoveredValue, setHoveredDate])

  return null
}
