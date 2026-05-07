import { z } from 'zod'

export const createTurmaSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(200),
  curso: z.string().min(1, 'Curso obrigatório'),
  turno: z.string().min(1, 'Turno obrigatório'),
  horario: z.string().min(1, 'Horário obrigatório'),
  ativo: z.boolean().optional().default(true),
})

export const updateTurmaSchema = createTurmaSchema.partial()

export type CreateTurmaInput = z.infer<typeof createTurmaSchema>
export type UpdateTurmaInput = z.infer<typeof updateTurmaSchema>
