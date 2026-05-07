import Link from 'next/link'
import { ShieldOff } from 'lucide-react'

export default function NaoAutorizadoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <ShieldOff className="w-16 h-16 text-red-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso não autorizado</h1>
      <p className="text-gray-500 mb-6">Você não tem permissão para acessar esta página.</p>
      <Link
        href="/"
        className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
