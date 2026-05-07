'use client'
import { useRef, useState } from 'react'
import { Upload, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react'
import { extrairDadosDocumento, type DadosExtraidos } from '@/server/actions/ocr.actions'

interface Props {
  onAplicar: (dados: DadosExtraidos) => void
  onClose: () => void
}

type Etapa = 'upload' | 'processando' | 'revisao'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_BYTES = 5 * 1024 * 1024

function ConfiancaBadge({ confianca }: { confianca: number }) {
  if (confianca >= 70) {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
        <CheckCircle className="w-3 h-3" /> Alta confiança ({confianca}%)
      </span>
    )
  }
  if (confianca >= 50) {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
        <AlertTriangle className="w-3 h-3" /> Confiança média ({confianca}%)
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
      <AlertTriangle className="w-3 h-3" /> Baixa confiança ({confianca}%)
    </span>
  )
}

export function OcrUploadDialog({ onAplicar, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [etapa, setEtapa] = useState<Etapa>('upload')
  const [erro, setErro] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [extraido, setExtraido] = useState<DadosExtraidos | null>(null)
  const [form, setForm] = useState({ nome: '', cpf: '', rg: '', dataNascimento: '' })

  function handleFile(file: File) {
    setErro(null)
    if (!ACCEPTED.includes(file.type)) {
      setErro('Formato não suportado. Use JPG, PNG, WebP ou PDF.')
      return
    }
    if (file.size > MAX_BYTES) {
      setErro('Arquivo muito grande. Limite: 5MB.')
      return
    }
    setArquivo(file)
    if (file.type !== 'application/pdf') {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  async function extrair() {
    if (!arquivo) return
    setEtapa('processando')
    setErro(null)
    try {
      const reader = new FileReader()
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = e => {
          const result = e.target?.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(arquivo)
      })
      const dados = await extrairDadosDocumento(base64, arquivo.type)
      setExtraido(dados)
      setForm({
        nome: dados.nome ?? '',
        cpf: dados.cpf ?? '',
        rg: dados.rg ?? '',
        dataNascimento: dados.dataNascimento ?? '',
      })
      setEtapa('revisao')
    } catch {
      setErro('Erro ao processar o documento. Tente novamente.')
      setEtapa('upload')
    }
  }

  function aplicar() {
    onAplicar({
      nome: form.nome || undefined,
      cpf: form.cpf || undefined,
      rg: form.rg || undefined,
      dataNascimento: form.dataNascimento || undefined,
      confianca: extraido?.confianca ?? 0,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-semibold text-gray-900">Preencher via documento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Etapa 1: Upload */}
          {etapa === 'upload' && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded object-contain" />
                ) : arquivo?.type === 'application/pdf' ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <FileText className="w-10 h-10 text-blue-400" />
                    <span className="text-sm font-medium">{arquivo.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload className="w-8 h-8" />
                    <p className="text-sm font-medium text-gray-600">Arraste um arquivo ou clique para selecionar</p>
                    <p className="text-xs">JPG, PNG, WebP, PDF · máx 5MB</p>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  accept={ACCEPTED.join(',')}
                  onChange={onInputChange}
                />
              </div>

              {arquivo && (
                <p className="text-xs text-gray-500 text-center">
                  {arquivo.name} ({(arquivo.size / 1024).toFixed(0)} KB)
                </p>
              )}

              {erro && <p className="text-sm text-red-600 text-center">{erro}</p>}

              <button
                disabled={!arquivo}
                onClick={extrair}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Extrair dados
              </button>
            </>
          )}

          {/* Etapa 2: Processando */}
          {etapa === 'processando' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
              <p className="text-sm text-gray-600">Lendo documento...</p>
            </div>
          )}

          {/* Etapa 3: Revisão */}
          {etapa === 'revisao' && extraido && (
            <>
              <div className="flex items-center justify-between">
                <ConfiancaBadge confianca={extraido.confianca} />
              </div>

              {extraido.confianca < 50 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                  Verifique os dados cuidadosamente — a qualidade de leitura foi baixa.
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    placeholder="Nome completo"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    value={form.cpf}
                    onChange={e => setForm(f => ({ ...f, cpf: e.target.value }))}
                    placeholder="00000000000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">RG</label>
                  <input
                    value={form.rg}
                    onChange={e => setForm(f => ({ ...f, rg: e.target.value }))}
                    placeholder="RG"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <input
                    value={form.dataNascimento}
                    onChange={e => setForm(f => ({ ...f, dataNascimento: e.target.value }))}
                    placeholder="DD/MM/AAAA"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={aplicar}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Aplicar ao formulário
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
