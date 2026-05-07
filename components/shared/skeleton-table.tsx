import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonTable({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-8 rounded-full' : 'flex-1'}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
