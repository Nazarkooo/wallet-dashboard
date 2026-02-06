interface CloseIconProps {
  width?: number
  height?: number
  className?: string
}

export default function CloseIcon({
  width = 16,
  height = 16,
  className = '',
}: CloseIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
