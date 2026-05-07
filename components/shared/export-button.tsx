'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { notify } from '@/lib/toast'

export function ExportButton({
  onExport,
  label = 'Exportar',
  disabled,
}: {
  onExport: () => Promise<void>
  label?: string
  disabled?: boolean
}) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      await onExport()
      notify.success('Arquivo exportado com sucesso')
    } catch {
      notify.error('Erro ao exportar arquivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={disabled || loading} className="no-print">
      <Download className="h-4 w-4 mr-2" />
      {loading ? 'Exportando...' : label}
    </Button>
  )
}
