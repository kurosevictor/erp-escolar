'use server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── Cores ───────────────────────────────────────────────────────────────────
const NAVY      = rgb(0.059, 0.118, 0.239)   // #0f1e3d
const NAVY_MID  = rgb(0.086, 0.145, 0.290)   // #162549
const GOLD      = rgb(0.784, 0.663, 0.329)   // #c8a954 matte gold
const GOLD_DIM  = rgb(0.600, 0.500, 0.240)   // gold escuro para separadores
const WHITE     = rgb(1, 1, 1)
const WHITE_DIM = rgb(0.85, 0.85, 0.90)

export interface DadosRecibo {
  alunoNome:       string
  valorNumerico:   string   // "R$ 289,90"
  valorExtenso:    string   // "Duzentos e oitenta e nove reais..."
  referente:       string   // label legível
  dataFormatada:   string   // "São Paulo, 08 de maio de 2026"
  horaFormatada:   string   // "14h30"
  assinaturaBase64?: string // data URL PNG
  assinanteNome?:  string
}

export async function gerarReciboPdf(dados: DadosRecibo): Promise<string> {
  await requireAuth()

  const W = 595, H = 842
  const M = 48
  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage([W, H])

  const fBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fReg    = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  // ── Background navy full page ──────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: NAVY })

  // ── Header strip ──────────────────────────────────────────────────────────
  const HEADER_H = 148
  page.drawRectangle({ x: 0, y: H - HEADER_H, width: W, height: HEADER_H, color: NAVY_MID })

  // linhas douradas topo e base do header
  page.drawLine({ start: { x: M, y: H - 18 }, end: { x: W - M, y: H - 18 }, thickness: 0.8, color: GOLD })
  page.drawLine({ start: { x: M, y: H - HEADER_H }, end: { x: W - M, y: H - HEADER_H }, thickness: 1.5, color: GOLD })

  // nome da empresa
  page.drawText('FUTURA SCHOOL LTDA', { x: M, y: H - 58, size: 22, font: fBold, color: GOLD })
  page.drawText('CNPJ: 61.300.173/0001-10', { x: M, y: H - 80, size: 10, font: fReg, color: WHITE_DIM })
  page.drawText('Av. Marechal Deodoro da Fonseca, 890 — Sala 3', { x: M, y: H - 95, size: 10, font: fReg, color: WHITE_DIM })

  // "RECIBO" watermark direita
  page.drawText('RECIBO', { x: W - M - 148, y: H - 96, size: 56, font: fBold, color: GOLD, opacity: 0.12 })

  // ── Título centrado ────────────────────────────────────────────────────────
  const TITLE_Y = H - HEADER_H - 46
  const titleTxt = 'RECIBO DE PAGAMENTO'
  const titleW   = fBold.widthOfTextAtSize(titleTxt, 16)
  page.drawText(titleTxt, { x: (W - titleW) / 2, y: TITLE_Y, size: 16, font: fBold, color: GOLD })

  // traços dourados ao redor do título
  const gap = 18
  page.drawLine({ start: { x: M, y: TITLE_Y + 8 }, end: { x: (W - titleW) / 2 - gap, y: TITLE_Y + 8 }, thickness: 0.8, color: GOLD_DIM, opacity: 0.6 })
  page.drawLine({ start: { x: (W + titleW) / 2 + gap, y: TITLE_Y + 8 }, end: { x: W - M, y: TITLE_Y + 8 }, thickness: 0.8, color: GOLD_DIM, opacity: 0.6 })

  // ── Campos de conteúdo ────────────────────────────────────────────────────
  function drawField(label: string, value: string, y: number) {
    // label dourado pequeno
    page.drawText(label.toUpperCase(), { x: M, y: y + 17, size: 8, font: fReg, color: GOLD, opacity: 0.8 })
    // valor branco
    page.drawText(value, { x: M, y: y, size: 13, font: fBold, color: WHITE })
    // linha separadora
    page.drawLine({ start: { x: M, y: y - 8 }, end: { x: W - M, y: y - 8 }, thickness: 0.4, color: GOLD, opacity: 0.25 })
  }

  const FIELD_GAP = 62
  let CY = TITLE_Y - 52

  drawField('Recebemos de', dados.alunoNome, CY); CY -= FIELD_GAP
  drawField('A importância de', `${dados.valorNumerico}  —  ${dados.valorExtenso}`, CY); CY -= FIELD_GAP
  drawField('Referente a', dados.referente, CY); CY -= FIELD_GAP
  drawField('Data e Hora', `${dados.dataFormatada}, às ${dados.horaFormatada}`, CY)

  // ── Área de assinatura ─────────────────────────────────────────────────────
  const SIG_LINE_Y = 178
  const SIG_X      = W / 2 + 10
  const SIG_W      = W - M - SIG_X

  // imagem da assinatura
  if (dados.assinaturaBase64) {
    try {
      const b64   = dados.assinaturaBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      const bytes = Buffer.from(b64, 'base64')
      // tenta PNG, cai em JPEG se falhar
      let img
      try { img = await pdfDoc.embedPng(bytes) }
      catch { img = await pdfDoc.embedJpg(bytes) }
      const { width: iW, height: iH } = img.scale(1)
      const scale  = Math.min(SIG_W / iW, 60 / iH)
      const drawW  = iW * scale
      const drawH  = iH * scale
      page.drawImage(img, {
        x: SIG_X + (SIG_W - drawW) / 2,
        y: SIG_LINE_Y + 10,
        width: drawW, height: drawH,
      })
    } catch { /* se a imagem falhar, só mostra a linha */ }
  }

  // linha de assinatura
  page.drawLine({ start: { x: SIG_X, y: SIG_LINE_Y + 4 }, end: { x: SIG_X + SIG_W, y: SIG_LINE_Y + 4 }, thickness: 0.8, color: GOLD, opacity: 0.8 })

  // nome do assinante
  if (dados.assinanteNome) {
    const nW = fReg.widthOfTextAtSize(dados.assinanteNome, 10)
    page.drawText(dados.assinanteNome, {
      x: SIG_X + (SIG_W - nW) / 2, y: SIG_LINE_Y - 12,
      size: 10, font: fReg, color: WHITE_DIM,
    })
  }
  const compTxt = 'Futura School LTDA'
  const compW   = fItalic.widthOfTextAtSize(compTxt, 9)
  page.drawText(compTxt, {
    x: SIG_X + (SIG_W - compW) / 2, y: SIG_LINE_Y - 26,
    size: 9, font: fItalic, color: GOLD, opacity: 0.75,
  })

  // caixa dourada ao redor da assinatura
  page.drawRectangle({
    x: SIG_X - 8, y: SIG_LINE_Y - 36, width: SIG_W + 16, height: 110,
    borderColor: GOLD, borderWidth: 0.6, borderOpacity: 0.35, color: rgb(1,1,1), opacity: 0.02,
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: M, y: 50 }, end: { x: W - M, y: 50 }, thickness: 0.8, color: GOLD, opacity: 0.3 })
  const footerTxt = 'Documento gerado eletronicamente  •  Futura School LTDA  •  CNPJ: 61.300.173/0001-10'
  const footerW   = fReg.widthOfTextAtSize(footerTxt, 7.5)
  page.drawText(footerTxt, { x: (W - footerW) / 2, y: 34, size: 7.5, font: fReg, color: WHITE, opacity: 0.35 })

  // bordas laterais douradas sutis
  page.drawLine({ start: { x: M - 10, y: 50 }, end: { x: M - 10, y: H - 18 }, thickness: 0.5, color: GOLD, opacity: 0.12 })
  page.drawLine({ start: { x: W - M + 10, y: 50 }, end: { x: W - M + 10, y: H - 18 }, thickness: 0.5, color: GOLD, opacity: 0.12 })

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes).toString('base64')
}

// ─── Dados para o formulário ─────────────────────────────────────────────────
export async function getAlunosParaRecibo() {
  await requireAuth()
  return prisma.aluno.findMany({
    where: { situacaoMatricula: 'ATIVO', deletedAt: null },
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
  })
}

export async function getUsuariosComAssinatura() {
  await requireAuth()
  return prisma.user.findMany({
    where: { ativo: true, assinaturaUrl: { not: null } },
    select: { id: true, nome: true, assinaturaUrl: true },
  })
}

export async function salvarAssinatura(assinaturaDataUrl: string) {
  const user = await requireAuth()
  await prisma.user.update({
    where: { id: user.id },
    data: { assinaturaUrl: assinaturaDataUrl },
  })
}

export async function getMinhaAssinatura() {
  const user = await requireAuth()
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { assinaturaUrl: true, nome: true },
  })
  return u
}
