import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AuditoriaClient from './auditoria-client'

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; entity?: string; action?: string; userId?: string; from?: string; to?: string }>
}) {
  await requireRole(['ADMIN'])

  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const limit = 50

  const where: Record<string, unknown> = {}
  if (params.entity) where.entity = params.entity
  if (params.action) where.action = params.action
  if (params.userId) where.userId = params.userId
  if (params.from || params.to) {
    where.createdAt = {
      ...(params.from ? { gte: new Date(params.from) } : {}),
      ...(params.to ? { lte: new Date(params.to + 'T23:59:59') } : {}),
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { nome: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ])

  const entities = await prisma.auditLog
    .findMany({ select: { entity: true }, distinct: ['entity'] })
    .then((r) => r.map((e) => e.entity))

  const serialized = logs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    before: l.before as Record<string, unknown> | null,
    after: l.after as Record<string, unknown> | null,
  }))

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Auditoria</h1>
        <p className="text-sm text-gray-500 mt-1">Registro de todas as ações no sistema</p>
      </div>
      <AuditoriaClient
        logs={serialized}
        total={total}
        page={page}
        limit={limit}
        entities={entities}
        filters={{ entity: params.entity, action: params.action, userId: params.userId, from: params.from, to: params.to }}
      />
    </div>
  )
}
