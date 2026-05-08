import { requireAuth } from '@/lib/auth'
import {
  getAlunosParaRecibo,
  getUsuariosComAssinatura,
  getMinhaAssinatura,
} from '@/server/actions/recibos.actions'
import { ReciboClient } from './recibo-client'
import { ScrollText } from 'lucide-react'

export default async function RecibosPage() {
  const user = await requireAuth()

  const [alunos, usuariosComSig, minhaSig] = await Promise.all([
    getAlunosParaRecibo(),
    getUsuariosComAssinatura(),
    getMinhaAssinatura(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ScrollText className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recibos</h1>
          <p className="text-gray-500 mt-1">Gerador de recibos de pagamento</p>
        </div>
      </div>

      <ReciboClient
        alunos={alunos}
        usuariosComSig={usuariosComSig as { id: string; nome: string; assinaturaUrl: string }[]}
        minhaSig={minhaSig}
        meuNome={user.nome}
      />
    </div>
  )
}
