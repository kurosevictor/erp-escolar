'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, Upload, Trash2, Eye, Download, Loader2 } from 'lucide-react'

interface Arquivo {
  name: string
  created_at: string
  metadata?: { size?: number }
}

function formatBytes(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function nomeLegivel(nome: string) {
  return nome.replace(/^\d+-/, '').replace(/_/g, ' ').replace(/\.pdf$/i, '')
}

export default function ContratosPage() {
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewNome, setPreviewNome] = useState('')
  const [removendo, setRemovendo] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/contratos')
      const data = await res.json()
      setArquivos(data.arquivos ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.type !== 'application/pdf') continue
        const fd = new FormData()
        fd.append('arquivo', file)
        await fetch('/api/contratos', { method: 'POST', body: fd })
      }
      await load()
    } finally {
      setUploading(false)
    }
  }

  async function remover(nome: string) {
    setRemovendo(nome)
    try {
      await fetch('/api/contratos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      })
      setArquivos(prev => prev.filter(a => a.name !== nome))
      if (previewNome === nome) { setPreviewUrl(null); setPreviewNome('') }
    } finally {
      setRemovendo(null)
    }
  }

  async function abrirPreview(nome: string) {
    const res = await fetch(`/api/contratos/url?nome=${encodeURIComponent(nome)}`)
    const data = await res.json()
    setPreviewUrl(data.url)
    setPreviewNome(nome)
  }

  async function baixar(nome: string) {
    const res = await fetch(`/api/contratos/url?nome=${encodeURIComponent(nome)}`)
    const data = await res.json()
    const a = document.createElement('a')
    a.href = data.url
    a.download = nome
    a.click()
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    upload(e.dataTransfer.files)
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-7 h-7 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Contratos</h1>
          <p className="text-sm text-muted-foreground">Armazenamento de contratos em PDF</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-6 select-none ${
          dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-muted-foreground/30 hover:border-blue-400 hover:bg-muted/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Enviando...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="w-8 h-8" />
            <span className="font-medium">Arraste PDFs aqui ou clique para selecionar</span>
            <span className="text-xs">Apenas arquivos .pdf</span>
          </div>
        )}
      </div>

      {/* Lista */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : arquivos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhum contrato enviado ainda.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Enviado em</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Tamanho</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {arquivos.map((a) => (
                <tr key={a.name} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${previewNome === a.name ? 'bg-blue-50 dark:bg-blue-950/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="font-medium truncate max-w-xs">{nomeLegivel(a.name)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatData(a.created_at)}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatBytes(a.metadata?.size)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirPreview(a.name)}
                        title="Visualizar"
                        className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => baixar(a.name)}
                        title="Baixar"
                        className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900 text-green-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remover(a.name)}
                        title="Remover"
                        disabled={removendo === a.name}
                        className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors disabled:opacity-40"
                      >
                        {removendo === a.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col" onClick={() => { setPreviewUrl(null); setPreviewNome('') }}>
          <div className="flex items-center justify-between px-4 py-2 bg-[#1e3a5f] text-white shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-medium truncate">{nomeLegivel(previewNome)}</span>
            <div className="flex gap-2">
              <button onClick={() => baixar(previewNome)} className="text-xs px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors">Baixar</button>
              <button onClick={() => { setPreviewUrl(null); setPreviewNome('') }} className="text-xs px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors">Fechar</button>
            </div>
          </div>
          <iframe
            src={previewUrl}
            className="flex-1 w-full"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
