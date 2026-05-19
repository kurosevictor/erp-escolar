import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import { valorExtenso } from '@/lib/numero-extenso'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PizZip = require('pizzip')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Docxtemplater = require('docxtemplater')

function formatarData(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatarMoeda(val: number): string {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function mesExtenso(data: Date): string {
  return data.toLocaleString('pt-BR', { month: 'long' })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Carrega o template
    const templatePath = path.join(process.cwd(), 'lib', 'templates', 'contrato_template.docx')
    const content = readFileSync(templatePath)
    const zip = new PizZip(content)
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{', end: '}' },
    })

    // Data do contrato gerada automaticamente
    const hoje = new Date()
    const dataContrato = `${hoje.getDate()} de ${mesExtenso(hoje)} de ${hoje.getFullYear()}`

    // Converte valor para extenso
    const custoDesconto = parseFloat(body.custoDesconto) || 0
    const custoDescontoExtenso = valorExtenso(custoDesconto)
    const custoDescontoFmt = formatarMoeda(custoDesconto)

    // Monta os dados para o template
    const dados: Record<string, string> = {
      // Aluno
      nomeAluno: body.nomeAluno || '',
      cpfAluno: body.cpfAluno || '',
      nascAluno: formatarData(body.nascAluno),
      cpfAlunoAss: body.cpfAluno || '',

      // Responsável legal (menores)
      nomeResponsavelLegal: body.nomeResponsavelLegal || '',
      grauParentescoLegal: body.grauParentescoLegal || '',
      cpfResponsavelLegal: body.cpfResponsavelLegal || '',
      nascResponsavelLegal: formatarData(body.nascResponsavelLegal),
      enderecoResponsavel: body.enderecoResponsavel || '',
      bairroResponsavel: body.bairroResponsavel || '',
      municipioResponsavel: body.municipioResponsavel || '',
      celularResponsavel: body.celularResponsavel || '',
      emailResponsavel: body.emailResponsavel || '',
      nomeResponsavelFinanceiro: body.nomeResponsavelLegal || body.nomeAluno || '',
      cpfResponsavelAss: body.cpfResponsavelLegal || body.cpfAluno || '',

      // Mensalidades
      dataPrimeiraMensalidade: formatarData(body.dataPrimeiraMensalidade),
      valorPrimeiraMensalidade: formatarMoeda(parseFloat(body.valorPrimeiraMensalidade) || 0),
      dataSegundaMensalidade: formatarData(body.dataSegundaMensalidade),
      valorSegundaMensalidade: formatarMoeda(parseFloat(body.valorSegundaMensalidade) || 0),

      // Curso
      curso: body.curso || '',
      duracaoHoras: body.duracaoHoras || '',
      primeiroDiaAula: formatarData(body.primeiroDiaAula),
      diaAula: body.diaAula || '',
      horarioAula: body.horarioAula || '',

      // Financeiro
      custoIntegral: '8.220,00',
      custoDesconto: custoDescontoFmt,
      custoDescontoExtenso,
      numParcelas: body.numParcelas || '',
      valorParcelaSemDesconto: formatarMoeda(parseFloat(body.valorParcelaSemDesconto) || 0),
      valorParcelaComDesconto: formatarMoeda(parseFloat(body.valorParcelaComDesconto) || 0),
      diaVencimento: body.diaVencimento || '',
      valorMaterial: formatarMoeda(parseFloat(body.valorMaterial) || 0),

      // Data
      dataContrato,
    }

    doc.render(dados)

    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' })

    const nomeArquivo = `contrato_${(body.nomeAluno || 'aluno').replace(/\s+/g, '_')}.docx`

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${nomeArquivo}"`,
      },
    })
  } catch (err) {
    console.error('Erro ao gerar contrato:', err)
    return NextResponse.json({ error: 'Erro ao gerar contrato' }, { status: 500 })
  }
}
