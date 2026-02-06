export const timeframes = ['1H', '6H', '1D', '1W', '1M', 'All'] as const

export type Timeframe = (typeof timeframes)[number]

export const timeframeLabels: Record<Timeframe, string> = {
  '1H': 'Past Hour',
  '6H': 'Past 6 Hours',
  '1D': 'Past Day',
  '1W': 'Past Week',
  '1M': 'Past Month',
  All: 'All Time',
}

export const timeframeMapSeconds: Record<Timeframe, number> = {
  '1H': 3600,
  '6H': 21600,
  '1D': 86400,
  '1W': 604800,
  '1M': 2592000,
  All: 0,
}

export const timeframeMapMilliseconds: Record<Timeframe, number> = {
  '1H': 3600000,
  '6H': 21600000,
  '1D': 86400000,
  '1W': 604800000,
  '1M': 2592000000,
  All: 2592000000,
}
