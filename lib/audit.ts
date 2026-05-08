import { prisma } from '@/lib/prisma'
type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE'
import { headers } from 'next/headers'

interface AuditParams {
  userId?: string
  userEmail?: string
  action: AuditAction
  entity: string
  entityId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
}

export async function audit(params: AuditParams) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown'
    const userAgent = headersList.get('user-agent') ?? undefined

    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        userEmail: params.userEmail ?? null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        before: params.before ?? undefined,
        after: params.after ?? undefined,
        ip,
        userAgent,
      },
    })
  } catch (err) {
    // Nunca deixar audit quebrar a operação principal
    console.error('[AuditLog] Falha ao registrar:', err)
  }
}
