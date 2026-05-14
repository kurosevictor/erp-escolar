'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, User, ScanText } from 'lucide-react'
import { toast } from 'sonner'
import { OcrUploadDialog } from '@/components/shared/ocr-upload-dialog'
import type { DadosExtraidos } from '@/server/actions/ocr.actions'

interface Turma {
  id: string
  nome: string
  curso: string
  turno: string
  horario: string
}

interface AlunoFormProps {
  initialData?: {
    id?: string
    nome?: string
    cpf?: string
    email?: string
    telefone?: string
    foto?: string
    dataNascimento?: string
    dataMatricula?: string
    situacaoMatricula?: string
    observacoes?: string
    turmaId?: string
    turmaId2?: string | null
  }
  mode: 'novo' | 'editar'
}

function formatCPFInput(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

function formatPhoneInput(value: string) {
  return value.replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2')
    .slice(0, 15)
}

export default function AlunoForm({ initialData, mode }: AlunoFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [fotoPreview, setFotoPreview] = useState<string | null>(initialData?.foto || null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [ocrOpen, setOcrOpen] = useState(false)

  const [form, setForm] = useState({
    nome: initialData?.nome || '',
    cpf: initialData?.cpf || '',
    email: initialData?.email || '',
    telefone: initialData?.telefone || '',
    dataNascimento: initialData?.dataNascimento?.split('T')[0] || '',
    dataMatricula: initialData?.dataMatricula?.split('T')[0] || new Date().toISOString().split('T')[0],
    situacaoMatricula: initialData?.situacaoMatricula || 'ATIVO',
    observacoes: initialData?.observacoes || '',
    turmaId: initialData?.turmaId || '',
    turmaId2: initialData?.turmaId2 || '',
  })

  useEffect(() => {
    fetch('/api/turmas')
      .then(r => r.json())
      .then(data => {
        setTurmas(data)
        if (!form.turmaId && data.length > 0) {
          setForm(f => ({ ...f, turmaId: data[0].id }))
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const turmaSelecionada = turmas.find(t => t.id === form.turmaId)

  function aplicarDadosOcr(dados: DadosExtraidos) {
    setForm(f => ({
      ...f,
      ...(dados.nome && { nome: dados.nome }),
      ...(dados.cpf && { cpf: dados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') }),
      ...(dados.dataNascimento && {
        dataNascimento: (() => {
          const partes = dados.dataNascimento!.split('/')
          if (partes.length === 3) {
            const ano = partes[2].length === 2 ? `20${partes[2]}` : partes[2]
            return `${ano}-${partes[1]}-${partes[0]}`
          }
          return f.dataNascimento
        })(),
      }),
    }))
    toast.success('Dados aplicados — revise antes de salvar')
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = ev => setFotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...form,
        cpf: form.cpf.replace(/\D/g, ''),
        telefone: form.telefone.replace(/\D/g, '') || null,
        dataNascimento: form.dataNascimento || null,
        turmaId2: form.turmaId2 || null,
      }

      let alunoId = initialData?.id

      if (mode === 'novo') {
        const res = await fetch('/api/alunos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const created = await res.json()
        alunoId = created.id
      } else {
        const res = await fetch(`/api/alunos/${alunoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          console.error('Erro ao salvar aluno:', err)
          alert('Erro ao salvar: ' + (JSON.stringify(err.error) ?? 'verifique o console'))
          setLoading(false)
          return
        }
      }

      if (fotoFile && alunoId) {
        const fd = new FormData()
        fd.append('foto', fotoFile)
        await fetch(`/api/alunos/${alunoId}/foto`, { method: 'POST', body: fd })
      }

      router.push(`/alunos/${alunoId}`)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <>
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={mode === 'novo' ? '/alunos' : `/alunos/${initialData?.id}`}
          className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'novo' ? 'Novo Aluno' : 'Editar Aluno'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Foto</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => fileInputRef.current?.click()}>
              {fotoPreview
                ? <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-blue-400" />}
            </div>
            <div>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Upload className="w-4 h-4" /> Escolher foto
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG até 5MB</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
          </div>
        </div>

        {/* OCR */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOcrOpen(true)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ScanText className="w-4 h-4" />
            Preencher via documento
          </button>
        </div>

        {/* Dados pessoais */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Dados Pessoais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
              <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
              <input required value={form.cpf}
                onChange={e => setForm(f => ({ ...f, cpf: formatCPFInput(e.target.value) }))}
                placeholder="000.000.000-00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" value={form.dataNascimento}
                onChange={e => setForm(f => ({ ...f, dataNascimento: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input value={form.telefone}
                onChange={e => setForm(f => ({ ...f, telefone: formatPhoneInput(e.target.value) }))}
                placeholder="(00) 00000-0000"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Turma */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Turma e Matrícula</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Turma *</label>
              <select required value={form.turmaId}
                onChange={e => setForm(f => ({ ...f, turmaId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione uma turma...</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} — {t.turno} · {t.horario}
                  </option>
                ))}
              </select>
              {turmaSelecionada && (
                <p className="text-xs text-gray-400 mt-1">
                  Curso: {turmaSelecionada.curso}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Segunda Turma <span className="text-gray-400 font-normal">(opcional)</span></label>
              <select value={form.turmaId2}
                onChange={e => setForm(f => ({ ...f, turmaId2: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Nenhuma</option>
                {turmas.filter(t => t.id !== form.turmaId).map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} — {t.turno} · {t.horario}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Matrícula *</label>
              <input required type="date" value={form.dataMatricula}
                onChange={e => setForm(f => ({ ...f, dataMatricula: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Situação da Matrícula</label>
              <select value={form.situacaoMatricula}
                onChange={e => setForm(f => ({ ...f, situacaoMatricula: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
                <option value="TRANCADO">Trancado</option>
                <option value="FORMADO">Formado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="flex-1 bg-[#1e3a5f] text-white py-2 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 font-medium">
            {loading ? 'Salvando...' : mode === 'novo' ? 'Cadastrar Aluno' : 'Salvar Alterações'}
          </button>
          <Link href={mode === 'novo' ? '/alunos' : `/alunos/${initialData?.id}`}
            className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-center">
            Cancelar
          </Link>
        </div>
      </form>
    </div>

      {ocrOpen && (
        <OcrUploadDialog
          onAplicar={aplicarDadosOcr}
          onClose={() => setOcrOpen(false)}
        />
      )}
    </>
  )
}
