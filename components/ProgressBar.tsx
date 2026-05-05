interface ProgressBarProps {
  value: number
  max: number
  type: 'financeira' | 'academica'
  label?: string
}

export default function ProgressBar({ value, max, type, label }: ProgressBarProps) {
  const percentage = Math.min(100, max > 0 ? (value / max) * 100 : 0)

  const getColor = () => {
    if (type === 'academica') return 'bg-blue-500'
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
