'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AlunoForm from '@/components/AlunoForm'

interface Aluno {
  id: string
  nome: string
  cpf: string
  email?: string
  telefone?: string
  foto?: string
  curso: string
  turno: string
  horario: string
  situacaoMatricula: string
  situacaoPagamento: string
  totalParcelas: number
  parcelaAtual: number
  valorMensalidade: number
  dataNascimento?: string
  dataMatricula: string
  observacoes?: string
  totalHorasCurso: number
  horasRealizadas: number
  faltas: number
}

export default function EditarAlunoPage() {
  const params = useParams()
  const [aluno, setAluno] = useState<Aluno | null>(null)

  useEffect(() => {
    fetch(`/api/alunos/${params.id}`)
      .then(r => r.json())
      .then(setAluno)
  }, [params.id])

  if (!aluno) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  )

  return <AlunoForm mode="editar" initialData={aluno} />
}
