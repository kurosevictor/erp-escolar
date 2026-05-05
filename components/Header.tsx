'use client'
import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'

export default function Header() {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setTotal(d.totalAlunos))
      .catch(() => {})
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">ERP Escolar</h2>
      {total !== null && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{total} alunos cadastrados</span>
        </div>
      )}
    </header>
  )
}
