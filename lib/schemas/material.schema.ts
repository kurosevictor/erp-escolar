import { z } from 'zod'

export const createMaterialSchema = z.object({
  titulo: z.string().min(1, 'Título obrigatório').max(500),
  arquivo: z.string().url('URL inválida'),
  ordem: z.coerce.number().int().min(0).optional().default(0),
  turmaId: z.string().min(1, 'Turma obrigatória'),
})

export const updateMaterialSchema = createMaterialSchema.partial()

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>
