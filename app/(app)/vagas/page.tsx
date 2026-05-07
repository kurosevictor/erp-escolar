import { Suspense } from 'react'
import { getVagasDashboard } from '@/server/actions/vagas.actions'
import { VagasView } from './vagas-client'
import { SkeletonTable } from '@/components/shared/skeleton-table'

async function VagasContent() {
  const turmas = await getVagasDashboard()
  return <VagasView turmas={turmas} />
}

export default function VagasPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
        </div>
        <SkeletonTable rows={8} columns={8} />
      </div>
    }>
      <VagasContent />
    </Suspense>
  )
}
