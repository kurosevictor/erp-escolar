import { z } from 'zod'

export const createParcelaSchema = z.object({
  alunoId: z.string().min(1),
  numero: z.coerce.number().int().min(1),
  valor: z.coerce.number().min(0),
  vencimento: z.coerce.date(),
  pago: z.boolean().optional().default(false),
})

export const updateParcelaSchema = z.object({
  pago: z.boolean().optional(),
  nfEmitida: z.boolean().optional(),
  dataPagamento: z.coerce.date().optional().nullable(),
})

export const gerarMensalidadesSchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/, 'Formato inválido, use YYYY-MM'),
  valor: z.coerce.number().min(0).optional().default(0),
})

export type CreateParcelaInput = z.infer<typeof createParcelaSchema>
export type UpdateParcelaInput = z.infer<typeof updateParcelaSchema>
export type GerarMensalidadesInput = z.infer<typeof gerarMensalidadesSchema>
