import { z } from 'zod'

export const cpfSchema = z
  .string()
  .optional()
  .nullable()
  .transform((v) => v?.replace(/\D/g, '') ?? null)
  .refine((v) => !v || v.length === 11, { message: 'CPF deve ter 11 dígitos' })

export const telefoneSchema = z
  .string()
  .optional()
  .nullable()
  .transform((v) => v?.replace(/\D/g, '') ?? null)

export const createAlunoSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(200),
  cpf: cpfSchema,
  dataNascimento: z.coerce.date().optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  telefone: telefoneSchema,
  turmaId: z.string().min(1, 'Turma obrigatória'),
  turmaId2: z.string().nullable().optional(),
  situacaoMatricula: z.string().optional().default('ATIVO'),
  dataMatricula: z.coerce.date().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  foto: z.string().optional().nullable(),
  diaVencimento: z.coerce.number().int().min(1).max(31).optional().nullable(),
  valorMensalidade: z.coerce.number().min(0).optional().nullable(),
})

export const updateAlunoSchema = createAlunoSchema.partial().extend({
  id: z.string().min(1),
})

export type CreateAlunoInput = z.infer<typeof createAlunoSchema>
export type UpdateAlunoInput = z.infer<typeof updateAlunoSchema>
