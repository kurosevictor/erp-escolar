import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function getSituacaoColor(situacao: string): string {
  const colors: Record<string, string> = {
    EM_DIA: 'bg-green-100 text-green-800',
    INADIMPLENTE: 'bg-red-100 text-red-800',
    ISENTO: 'bg-blue-100 text-blue-800',
    ATIVO: 'bg-green-100 text-green-800',
    INATIVO: 'bg-gray-100 text-gray-800',
    TRANCADO: 'bg-yellow-100 text-yellow-800',
    FORMADO: 'bg-purple-100 text-purple-800',
  }
  return colors[situacao] || 'bg-gray-100 text-gray-800'
}

export function getSituacaoLabel(situacao: string): string {
  const labels: Record<string, string> = {
    EM_DIA: 'Em Dia',
    INADIMPLENTE: 'Inadimplente',
    ISENTO: 'Isento',
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    TRANCADO: 'Trancado',
    FORMADO: 'Formado',
    MANHA: 'Manhã',
    TARDE: 'Tarde',
    NOITE: 'Noite',
  }
  return labels[situacao] || situacao
}

export function getStatusAcademico(percentual: number, faltas: number): {
  label: string
  color: string
} {
  if (percentual >= 100) return { label: 'Concluído', color: 'bg-green-100 text-green-800' }
  if (faltas > 15 || percentual < 30) return { label: 'Em Risco', color: 'bg-red-100 text-red-800' }
  return { label: 'No Prazo', color: 'bg-blue-100 text-blue-800' }
}
