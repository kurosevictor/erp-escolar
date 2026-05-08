'use client'
import { useEffect, useRef, useState } from 'react'
import { FileDown, Upload, Check, Search } from 'lucide-react'
import { toast } from 'sonner'
import { valorPorExtenso } from '@/lib/valor-extenso'
import { gerarReciboPdf, salvarAssinatura } from '@/server/actions/recibos.actions'

interface Aluno  { id: string; nome: string }
interface UsuarioSig { id: string; nome: string; assinaturaUrl: string }

interface Props {
  alunos: Aluno[]
  usuariosComSig: UsuarioSig[]
  minhaSig: { assinaturaUrl: string | null; nome: string } | null
  meuNome: string
}

const REFERENTES = ['Mensalidade', 'Rescisão', 'Inscrição', 'Material']

const MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']

function formatarData(d: Date) {
  return `${d.getDate().toString().padStart(2,'0')} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}
function formatarHora(d: Date) {
  return `${d.getHours().toString().padStart(2,'0')}h${d.getMinutes().toString().padStart(2,'0')}`
}

export function ReciboClient({ alunos, usuariosComSig, minhaSig, meuNome }: Props) {
  const agora = new Date()

  // Form
  const [busca, setBusca] = useState('')
  const [alunoId, setAlunoId] = useState('')
  const [alunoNome, setAlunoNome] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [valorNum, setValorNum] = useState('')
  const [extenso, setExtenso] = useState('')
  const [extensoManual, setExtensoManual] = useState(false)
  const [referente, setReferente] = useState(REFERENTES[0])
  const [dataHora] = useState(agora)
  const [sigSelecionada, setSigSelecionada] = useState<UsuarioSig | null>(null)

  // Assinatura upload
  const sigInputRef = useRef<HTMLInputElement>(null)
  const [sigPreview, setSigPreview] = useState<string | null>(minhaSig?.assinaturaUrl ?? null)
  const [salvandoSig, setSalvandoSig] = useState(false)

  // Geração
  const [gerando, setGerando] = useState(false)
  const [pdfBase64, setPdfBase64] = useState<string | null>(null)

  // Fechar dropdown ao clicar fora
  const dropRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowDropdown(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Auto-converter valor
  useEffect(() => {
    if (extensoManual) return
    const num = parseFloat(valorNum.replace(',', '.'))
    setExtenso(isNaN(num) ? '' : valorPorExtenso(num))
  }, [valorNum, extensoManual])

  const alunosFiltrados = alunos.filter(a => a.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 8)

  function selecionarAluno(a: Aluno) {
    setAlunoId(a.id)
    setAlunoNome(a.nome)
    setBusca(a.nome)
    setShowDropdown(false)
  }

  // Upload de assinatura
  function onSigFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setSigPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function salvarSig() {
    if (!sigPreview) return
    setSalvandoSig(true)
    try {
      await salvarAssinatura(sigPreview)
      toast.success('Assinatura salva!')
    } catch {
      toast.error('Erro ao salvar assinatura')
    } finally {
      setSalvandoSig(false)
    }
  }

  async function gerarPdf() {
    if (!alunoNome) { toast.error('Selecione um aluno'); return }
    if (!valorNum)  { toast.error('Informe o valor'); return }
    if (!extenso)   { toast.error('Informe o valor por extenso'); return }

    setGerando(true)
    setPdfBase64(null)
    try {
      const num = parseFloat(valorNum.replace(',', '.'))
      const valorFormatado = `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

      const sig  = sigSelecionada ?? (sigPreview ? { assinaturaUrl: sigPreview, nome: meuNome } : null)

      const base64 = await gerarReciboPdf({
        alunoNome,
        valorNumerico: valorFormatado,
        valorExtenso: extenso,
        referente,
        dataFormatada: formatarData(dataHora),
        horaFormatada: formatarHora(dataHora),
        assinaturaBase64: sig?.assinaturaUrl ?? undefined,
        assinanteNome: sig?.nome ?? undefined,
      })
      setPdfBase64(base64)
      toast.success('Recibo gerado!')
    } catch {
      toast.error('Erro ao gerar recibo')
    } finally {
      setGerando(false)
    }
  }

  function baixarPdf() {
    if (!pdfBase64) return
    const bytes = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0))
    const blob  = new Blob([bytes], { type: 'application/pdf' })
    const url   = URL.createObjectURL(blob)
    const a     = document.createElement('a')
    a.href = url
    a.download = `recibo-${alunoNome.split(' ')[0].toLowerCase()}-${formatarData(dataHora).replace(/ /g,'-')}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const todasSigs: (UsuarioSig & { label: string })[] = [
    ...(sigPreview ? [{ id: '__eu__', nome: meuNome, assinaturaUrl: sigPreview, label: `${meuNome} (minha)` }] : []),
    ...usuariosComSig.filter(u => u.nome !== meuNome).map(u => ({ ...u, label: u.nome })),
  ]

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Formulário ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
        <h2 className="font-semibold text-gray-900">Dados do recibo</h2>

        {/* Recebemos de */}
        <div ref={dropRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Recebemos de *</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              value={busca}
              onChange={e => { setBusca(e.target.value); setShowDropdown(true); if (!e.target.value) { setAlunoId(''); setAlunoNome('') } }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Buscar aluno..."
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {showDropdown && alunosFiltrados.length > 0 && (
            <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
              {alunosFiltrados.map(a => (
                <button key={a.id} onMouseDown={() => selecionarAluno(a)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700">
                  {a.nome}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Valor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
            <input
              type="number" min="0" step="0.01"
              value={valorNum}
              onChange={e => { setValorNum(e.target.value); setExtensoManual(false) }}
              placeholder="289,90"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referente a *</label>
            <select value={referente} onChange={e => setReferente(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {REFERENTES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Por extenso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            A importância de *
            {extensoManual && <span className="text-xs text-blue-500 ml-1">(editado manualmente)</span>}
          </label>
          <input
            value={extenso}
            onChange={e => { setExtenso(e.target.value); setExtensoManual(true) }}
            placeholder="Duzentos e oitenta e nove reais e noventa centavos"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!extensoManual && (
            <p className="text-xs text-gray-400 mt-0.5">Preenchido automaticamente • edite se precisar corrigir</p>
          )}
        </div>

        {/* Data/hora automática */}
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
          <span className="font-medium">Data/hora:</span> {formatarData(dataHora)}, às {formatarHora(dataHora)}
          <span className="text-xs text-gray-400 ml-2">(automático)</span>
        </div>
      </div>

      {/* ── Assinatura ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Assinatura</h2>

        {/* Upload da minha assinatura */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Sua assinatura (salva na conta)</p>
          <div className="flex items-center gap-3">
            {sigPreview && (
              <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sigPreview} alt="Assinatura" className="h-12 object-contain" />
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => sigInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50">
                <Upload className="w-4 h-4" />
                {sigPreview ? 'Trocar' : 'Enviar PNG'}
              </button>
              {sigPreview && sigPreview !== minhaSig?.assinaturaUrl && (
                <button onClick={salvarSig} disabled={salvandoSig}
                  className="flex items-center gap-1.5 text-sm bg-blue-600 text-white rounded-lg px-3 py-1.5 hover:bg-blue-700 disabled:opacity-50">
                  <Check className="w-4 h-4" /> {salvandoSig ? 'Salvando...' : 'Salvar'}
                </button>
              )}
            </div>
            <input ref={sigInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onSigFile} />
          </div>
        </div>

        {/* Escolher qual assinatura usar no recibo */}
        {todasSigs.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usar no recibo</label>
            <select
              value={sigSelecionada?.id ?? '__eu__'}
              onChange={e => {
                const sel = todasSigs.find(s => s.id === e.target.value)
                setSigSelecionada(sel && sel.id !== '__eu__' ? sel : null)
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {todasSigs.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* ── Botão gerar ─────────────────────────────────────────────────────── */}
      <button onClick={gerarPdf} disabled={gerando || !alunoNome || !valorNum}
        className="w-full bg-[#0f1e3d] hover:bg-[#162549] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {gerando ? (
          <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Gerando recibo...</>
        ) : (
          <><FileDown className="w-4 h-4" /> Gerar Recibo</>
        )}
      </button>

      {/* ── Download ────────────────────────────────────────────────────────── */}
      {pdfBase64 && (
        <div className="bg-[#0f1e3d] rounded-xl p-5 flex items-center justify-between border border-[#c8a954]/30">
          <div>
            <p className="text-[#c8a954] font-semibold text-sm">Recibo gerado com sucesso</p>
            <p className="text-white/60 text-xs mt-0.5">Clique para baixar o PDF</p>
          </div>
          <button onClick={baixarPdf}
            className="flex items-center gap-2 bg-[#c8a954] hover:bg-[#b8943e] text-[#0f1e3d] font-bold text-sm px-4 py-2 rounded-lg transition-colors">
            <FileDown className="w-4 h-4" /> Baixar PDF
          </button>
        </div>
      )}
    </div>
  )
}
