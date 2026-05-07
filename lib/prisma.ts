import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

const SOFT_DELETE_MODELS = ['Aluno', 'Parcela', 'Material', 'Responsavel', 'User']

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!
  const adapter = new PrismaPg({ connectionString })
  const base = new PrismaClient({ adapter })

  return base.$extends({
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async findMany({ model, args, query }: any) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            args.where = { deletedAt: null, ...(args.where ?? {}) }
          }
          return query(args)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async findFirst({ model, args, query }: any) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            args.where = { deletedAt: null, ...(args.where ?? {}) }
          }
          return query(args)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async findFirstOrThrow({ model, args, query }: any) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            args.where = { deletedAt: null, ...(args.where ?? {}) }
          }
          return query(args)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async count({ model, args, query }: any) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            args.where = { deletedAt: null, ...(args.where ?? {}) }
          }
          return query(args)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async aggregate({ model, args, query }: any) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            args.where = { deletedAt: null, ...(args.where ?? {}) }
          }
          return query(args)
        },
        // Converte delete → update com deletedAt
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async delete({ model, args, query }: any) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            const key = model.charAt(0).toLowerCase() + model.slice(1)
            return (base as unknown as Record<string, { update: (a: unknown) => unknown }>)[key].update({
              where: args.where,
              data: { deletedAt: new Date() },
            })
          }
          return query(args)
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async deleteMany({ model, args, query }: any) {
          if (SOFT_DELETE_MODELS.includes(model)) {
            const key = model.charAt(0).toLowerCase() + model.slice(1)
            return (base as unknown as Record<string, { updateMany: (a: unknown) => unknown }>)[key].updateMany({
              where: args.where ?? {},
              data: { deletedAt: new Date() },
            })
          }
          return query(args)
        },
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
