'use server'
import Tesseract from 'tesseract.js'
import { requireAuth } from '@/lib/auth'

export interface DadosExtraidos {
  nome?: string
  cpf?: string
  dataNascimento?: string
  rg?: string
  confianca: number
}

export async function extrairDadosDocumento(
  base64: string,
  _mimeType: string
): Promise<DadosExtraidos> {
  await requireAuth()

  const buffer = Buffer.from(base64, 'base64')

  const result = await Tesseract.recognize(buffer, 'por', {
    logger: () => {},
  })

  const texto = result.data.text
  const confianca = Math.round(result.data.confidence)

  const cpfMatch = texto.match(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/)
  const cpf = cpfMatch ? cpfMatch[0].replace(/\D/g, '') : undefined

  const rgMatch = texto.match(/\d{1,2}\.?\d{3}\.?\d{3}-?[\dxX]/)
  const rg = rgMatch ? rgMatch[0] : undefined

  const dataMatch = texto.match(/\d{2}\/\d{2}\/\d{2,4}/)
  const dataNascimento = dataMatch ? dataMatch[0] : undefined

  const labelsConhecidos = /cpf|rg|registro|data|nasc|válido|nome|filiação/i
  const linhas = texto.split('\n').map(l => l.trim()).filter(Boolean)
  const linhaNome = linhas.find(l =>
    /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]{5,}$/.test(l) &&
    l.split(' ').length >= 2 &&
    !labelsConhecidos.test(l)
  )
  const nome = linhaNome
    ? linhaNome.split(' ')
        .map(p => p.charAt(0) + p.slice(1).toLowerCase())
        .join(' ')
    : undefined

  return { nome, cpf, rg, dataNascimento, confianca }
}
