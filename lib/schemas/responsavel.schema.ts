import { z } from 'zod'

export const createResponsavelSchema = z.object({
  nome: z.string().min(2, 'Nome obrigatório').max(200),
  cpf: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v?.replace(/\D/g, '') ?? null)
    .refine((v) => !v || v.length === 11, { message: 'CPF deve ter 11 dígitos' }),
  telefone: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v?.replace(/\D/g, '') ?? null),
  alunoId: z.string().min(1),
})

export const updateResponsavelSchema = createResponsavelSchema.partial()

export type CreateResponsavelInput = z.infer<typeof createResponsavelSchema>
export type UpdateResponsavelInput = z.infer<typeof updateResponsavelSchema>
