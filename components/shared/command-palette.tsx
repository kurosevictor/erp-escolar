'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  LayoutDashboard, Users, DollarSign, CalendarCheck,
  FileText, Package, Cake, Settings, ClipboardList, Plus,
  UserCheck, BookOpen, TrendingUp, School, ScrollText, Bot,
} from 'lucide-react'

interface AlunoResult {
  id: string
  nome: string
  foto: string | null
  turma: { nome: string } | null
  situacaoMatricula: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AlunoResult[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/alunos/search?q=${encodeURIComponent(q)}`)
      setResults(await res.json())
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => search(query), 300)
    return () => clearTimeout(t)
  }, [query, search])

  function go(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
    setResults([])
  }

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/alunos', label: 'Alunos', icon: Users },
    { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
    { href: '/financeiro/mensalidades', label: 'Mensalidades', icon: CalendarCheck },
    { href: '/chamada', label: 'Chamada', icon: UserCheck },
    { href: '/frequencia', label: 'Frequência', icon: BookOpen },
    { href: '/chat', label: 'Assistente IA', icon: Bot },
    { href: '/vagas', label: 'Vagas por Turma', icon: School },
    { href: '/financeiro/dashboard', label: 'Dashboard Financeiro', icon: TrendingUp },
    { href: '/material', label: 'Material', icon: Package },
    { href: '/recibos', label: 'Recibos', icon: ScrollText },
    { href: '/nota-fiscal', label: 'Nota Fiscal', icon: FileText },
    { href: '/aniversarios', label: 'Aniversários', icon: Cake },
    { href: '/comunicados', label: 'Comunicados', icon: ClipboardList },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
  ]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Buscar páginas, alunos..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{searching ? 'Buscando...' : 'Nenhum resultado'}</CommandEmpty>

        {results.length > 0 && (
          <>
            <CommandGroup heading="Alunos">
              {results.map((a) => (
                <CommandItem key={a.id} onSelect={() => go(`/alunos/${a.id}`)}>
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      {a.foto
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={a.foto} alt={a.nome} className="w-7 h-7 rounded-full object-cover" />
                        : <span className="text-blue-600 text-xs font-bold">{a.nome.charAt(0)}</span>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.nome}</p>
                      <p className="text-xs text-muted-foreground">{a.turma?.nome} · {a.situacaoMatricula}</p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Ações Rápidas">
          <CommandItem onSelect={() => go('/alunos/novo')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navegação">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
