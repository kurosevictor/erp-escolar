'use client'
import { useEffect, useState } from 'react'
import { Cake } from 'lucide-react'

interface Aluno {
  id: string
  nome: string
  foto: string | null
  dataNascimento: string | null
}

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

function diasParaAniversario(dataNasc: string): number {
  const hoje = new Date()
  const nasc = new Date(dataNasc)
  const proximo = new Date(hoje.getFullYear(), nasc.getMonth(), nasc.getDate())
  if (proximo < hoje) proximo.setFullYear(hoje.getFullYear() + 1)
  return Math.ceil((proximo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export default function AniversariosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)

  const hoje = new Date()
  const diaHoje = hoje.getDate()
  const mesHoje = hoje.getMonth()

  useEffect(() => {
    fetch('/api/alunos?limit=300')
      .then(r => r.json())
      .then(d => {
        const comData = (d.alunos || []).filter((a: Aluno) => a.dataNascimento)
        setAlunos(comData)
        setLoading(false)
      })
  }, [])

  // Ordena por próximo aniversário
  const ordenados = [...alunos].sort((a, b) =>
    diasParaAniversario(a.dataNascimento!) - diasParaAniversario(b.dataNascimento!)
  )

  // Agrupa por mês
  const porMes: Record<number, Aluno[]> = {}
  ordenados.forEach(a => {
    const mes = new Date(a.dataNascimento!).getMonth()
    if (!porMes[mes]) porMes[mes] = []
    porMes[mes].push(a)
  })

  // Meses ordenados por proximidade
  const mesesOrdenados = Object.keys(porMes)
    .map(Number)
    .sort((a, b) => {
      const da = diasParaAniversario(porMes[a][0].dataNascimento!)
      const db = diasParaAniversario(porMes[b][0].dataNascimento!)
      return da - db
    })

  const aniversariantesHoje = alunos.filter(a => {
    const nasc = new Date(a.dataNascimento!)
    return nasc.getDate() === diaHoje && nasc.getMonth() === mesHoje
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Aniversários</h1>
        <p className="text-gray-500 mt-1">Alunos ordenados pelo próximo aniversário</p>
      </div>

      {aniversariantesHoje.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 font-semibold mb-3 flex items-center gap-2">
            <Cake className="w-5 h-5" /> Aniversário hoje! 🎉
          </p>
          <div className="flex flex-wrap gap-3">
            {aniversariantesHoje.map(a => (
              <div key={a.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                {a.foto ? (
                  <img src={a.foto} alt={a.nome} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">{a.nome.charAt(0)}</span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-800">{a.nome}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {mesesOrdenados.map(mes => (
            <div key={mes} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className={`px-5 py-3 flex items-center gap-2 ${mes === mesHoje ? 'bg-blue-600' : 'bg-gray-50 border-b'}`}>
                <Cake className={`w-4 h-4 ${mes === mesHoje ? 'text-white' : 'text-gray-400'}`} />
                <h2 className={`font-semibold text-sm ${mes === mesHoje ? 'text-white' : 'text-gray-700'}`}>
                  {MESES[mes]}
                  {mes === mesHoje && <span className="ml-2 text-blue-200 font-normal">• mês atual</span>}
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {porMes[mes]
                  .sort((a, b) => new Date(a.dataNascimento!).getDate() - new Date(b.dataNascimento!).getDate())
                  .map(aluno => {
                    const nasc = new Date(aluno.dataNascimento!)
                    const dia = nasc.getDate()
                    const isHoje = dia === diaHoje && mes === mesHoje
                    const diasFaltam = diasParaAniversario(aluno.dataNascimento!)

                    return (
                      <div key={aluno.id} className={`flex items-center gap-3 px-5 py-3 ${isHoje ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                        <div className="w-10 text-center shrink-0">
                          <span className={`text-lg font-bold ${isHoje ? 'text-yellow-500' : 'text-gray-300'}`}>{dia}</span>
                        </div>
                        {aluno.foto ? (
                          <img src={aluno.foto} alt={aluno.nome} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-blue-600 text-xs font-bold">{aluno.nome.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-800 flex-1">{aluno.nome}</span>
                        {isHoje ? (
                          <span className="text-xs bg-yellow-400 text-white px-2 py-0.5 rounded-full font-medium">Hoje 🎂</span>
                        ) : diasFaltam <= 7 ? (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{diasFaltam}d</span>
                        ) : null}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
