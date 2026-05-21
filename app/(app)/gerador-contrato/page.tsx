'use client'
import { useState, useEffect } from 'react'
import { FileText, Download, Loader2, User, Users, DollarSign, GraduationCap } from 'lucide-react'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <Icon className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}

function calcIdade(nasc: string): number {
  if (!nasc) return 99
  const [y, m, d] = nasc.split('-').map(Number)
  const hoje = new Date()
  let idade = hoje.getFullYear() - y
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) idade--
  return idade
}

const CURSOS = [
  'Mecânica de Carros', 'Mecânica de Motos', 'Solda', 'Elétrica Industrial',
  'Elétrica Residencial', 'Informática', 'Inglês Kids', 'Inglês Básico',
  'Inglês Intermediário', 'Inglês Avançado', 'Administração / Secretariado',
]

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']

export default function GeradorContratoPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    // Aluno
    nomeAluno: '', cpfAluno: '', nascAluno: '',
    enderecoAluno: '', bairroAluno: '', municipioAluno: '',
    celularAluno: '', emailAluno: '',
    // Responsável legal (menores)
    nomeResponsavelLegal: '', grauParentescoLegal: '', cpfResponsavelLegal: '',
    nascResponsavelLegal: '', enderecoResponsavel: '', bairroResponsavel: '',
    municipioResponsavel: '', celularResponsavel: '', emailResponsavel: '',
    // Mensalidades
    dataPrimeiraMensalidade: '', valorPrimeiraMensalidade: '',
    dataSegundaMensalidade: '', valorSegundaMensalidade: '',
    // Curso
    curso: '', duracaoHoras: '', primeiroDiaAula: '', diaAula: '', horarioAula: '',
    // Financeiro
    custoDesconto: '', numParcelas: '', valorParcelaSemDesconto: '',
    valorParcelaComDesconto: '', diaVencimento: '', valorMaterial: '',
  })

  const menor = calcIdade(form.nascAluno) < 18

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }

  // Auto-calcula valor com desconto de R$50
  useEffect(() => {
    const sem = parseFloat(form.valorParcelaSemDesconto)
    if (!isNaN(sem) && sem > 0) {
      set('valorParcelaComDesconto', (sem - 50).toFixed(2))
    }
  }, [form.valorParcelaSemDesconto])

  async function handleGerar() {
    if (!form.nomeAluno || !form.curso) {
      alert('Preencha ao menos o nome do aluno e o curso.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/contrato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erro ao gerar contrato')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `contrato_${form.nomeAluno.replace(/\s+/g, '_')}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Erro ao gerar contrato. Verifique o console.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gerador de Contrato</h1>
            <p className="text-sm text-slate-500">Preencha os dados para gerar o contrato em Word</p>
          </div>
        </div>
        <button
          onClick={handleGerar}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loading ? 'Gerando...' : 'Gerar Contrato'}
        </button>
      </div>

      {/* DADOS DO ALUNO */}
      <Section icon={User} title="Dados do Aluno">
        <Field label="Nome completo" required>
          <input className={inputCls} value={form.nomeAluno} onChange={e => set('nomeAluno', e.target.value)} placeholder="Nome completo do aluno" />
        </Field>
        <Field label="CPF">
          <input className={inputCls} value={form.cpfAluno} onChange={e => set('cpfAluno', e.target.value)} placeholder="000.000.000-00" />
        </Field>
        <Field label="Data de nascimento">
          <input className={inputCls} type="date" value={form.nascAluno} onChange={e => set('nascAluno', e.target.value)} />
        </Field>
        {form.nascAluno && (
          <div className="flex items-center">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${menor ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
              {menor ? `⚠️ Menor de idade (${calcIdade(form.nascAluno)} anos) — responsável obrigatório` : `✓ Maior de idade (${calcIdade(form.nascAluno)} anos)`}
            </span>
          </div>
        )}
        <Field label="Telefone / Celular">
          <input className={inputCls} value={form.celularAluno} onChange={e => set('celularAluno', e.target.value)} placeholder="(47) 9 9999-9999" />
        </Field>
        <Field label="E-mail">
          <input className={inputCls} type="email" value={form.emailAluno} onChange={e => set('emailAluno', e.target.value)} placeholder="email@exemplo.com" />
        </Field>
        <Field label="Endereço residencial">
          <input className={inputCls} value={form.enderecoAluno} onChange={e => set('enderecoAluno', e.target.value)} placeholder="Rua, número" />
        </Field>
        <Field label="Bairro">
          <input className={inputCls} value={form.bairroAluno} onChange={e => set('bairroAluno', e.target.value)} />
        </Field>
        <Field label="Município">
          <input className={inputCls} value={form.municipioAluno} onChange={e => set('municipioAluno', e.target.value)} placeholder="Jaraguá do Sul" />
        </Field>
      </Section>

      {/* RESPONSÁVEL LEGAL (só menores) */}
      {menor && (
        <Section icon={Users} title="Responsável Legal / Financeiro">
          <Field label="Nome do responsável" required>
            <input className={inputCls} value={form.nomeResponsavelLegal} onChange={e => set('nomeResponsavelLegal', e.target.value)} placeholder="Nome completo" />
          </Field>
          <Field label="Grau de parentesco">
            <input className={inputCls} value={form.grauParentescoLegal} onChange={e => set('grauParentescoLegal', e.target.value)} placeholder="Ex: Mãe, Pai, Tutor" />
          </Field>
          <Field label="CPF do responsável">
            <input className={inputCls} value={form.cpfResponsavelLegal} onChange={e => set('cpfResponsavelLegal', e.target.value)} placeholder="000.000.000-00" />
          </Field>
          <Field label="Data de nascimento do responsável">
            <input className={inputCls} type="date" value={form.nascResponsavelLegal} onChange={e => set('nascResponsavelLegal', e.target.value)} />
          </Field>
          <Field label="Endereço residencial">
            <input className={inputCls} value={form.enderecoResponsavel} onChange={e => set('enderecoResponsavel', e.target.value)} placeholder="Rua, número" />
          </Field>
          <Field label="Bairro">
            <input className={inputCls} value={form.bairroResponsavel} onChange={e => set('bairroResponsavel', e.target.value)} />
          </Field>
          <Field label="Município">
            <input className={inputCls} value={form.municipioResponsavel} onChange={e => set('municipioResponsavel', e.target.value)} placeholder="Jaraguá do Sul" />
          </Field>
          <Field label="Telefone / Celular">
            <input className={inputCls} value={form.celularResponsavel} onChange={e => set('celularResponsavel', e.target.value)} placeholder="(47) 9 9999-9999" />
          </Field>
          <Field label="E-mail" >
            <input className={inputCls} type="email" value={form.emailResponsavel} onChange={e => set('emailResponsavel', e.target.value)} placeholder="email@exemplo.com" />
          </Field>
        </Section>
      )}

      {/* MENSALIDADES */}
      <Section icon={DollarSign} title="Datas das Mensalidades">
        <Field label="Data da 1ª mensalidade">
          <input className={inputCls} type="date" value={form.dataPrimeiraMensalidade} onChange={e => set('dataPrimeiraMensalidade', e.target.value)} />
        </Field>
        <Field label="Valor da 1ª mensalidade">
          <input className={inputCls} type="number" value={form.valorPrimeiraMensalidade} onChange={e => set('valorPrimeiraMensalidade', e.target.value)} placeholder="0.00" />
        </Field>
        <Field label="Data da 2ª mensalidade">
          <input className={inputCls} type="date" value={form.dataSegundaMensalidade} onChange={e => set('dataSegundaMensalidade', e.target.value)} />
        </Field>
        <Field label="Valor da 2ª mensalidade">
          <input className={inputCls} type="number" value={form.valorSegundaMensalidade} onChange={e => set('valorSegundaMensalidade', e.target.value)} placeholder="0.00" />
        </Field>
      </Section>

      {/* CURSO */}
      <Section icon={GraduationCap} title="Dados do Curso">
        <Field label="Curso adquirido" required>
          <select className={inputCls} value={form.curso} onChange={e => set('curso', e.target.value)}>
            <option value="">Selecione...</option>
            {CURSOS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Duração (horas)">
          <input className={inputCls} value={form.duracaoHoras} onChange={e => set('duracaoHoras', e.target.value)} placeholder="Ex: 120" />
        </Field>
        <Field label="Primeiro dia de aula">
          <input className={inputCls} type="date" value={form.primeiroDiaAula} onChange={e => set('primeiroDiaAula', e.target.value)} />
        </Field>
        <Field label="Dia de aula">
          <select className={inputCls} value={form.diaAula} onChange={e => set('diaAula', e.target.value)}>
            <option value="">Selecione...</option>
            {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Horário">
          <input className={inputCls} value={form.horarioAula} onChange={e => set('horarioAula', e.target.value)} placeholder="Ex: 08:00–10:00" />
        </Field>
      </Section>

      {/* VALORES */}
      <Section icon={DollarSign} title="Valores e Pagamento">
        <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm text-slate-600 dark:text-slate-400">
          💡 Custo integral sempre R$ 8.220,00 (fixo no contrato)
        </div>
        <Field label="Custo com desconto (R$)" required>
          <input className={inputCls} type="number" value={form.custoDesconto} onChange={e => set('custoDesconto', e.target.value)} placeholder="Ex: 4500" />
        </Field>
        <Field label="Número de parcelas">
          <input className={inputCls} type="number" value={form.numParcelas} onChange={e => set('numParcelas', e.target.value)} placeholder="Ex: 12" />
        </Field>
        <Field label="Valor da parcela (sem desconto pontualidade)">
          <input className={inputCls} type="number" value={form.valorParcelaSemDesconto} onChange={e => set('valorParcelaSemDesconto', e.target.value)} placeholder="Ex: 350.00" />
        </Field>
        <Field label="Valor da parcela (com desconto R$50)">
          <input className={inputCls} type="number" value={form.valorParcelaComDesconto} onChange={e => set('valorParcelaComDesconto', e.target.value)} placeholder="Calculado automaticamente" />
        </Field>
        <Field label="Dia de vencimento">
          <input className={inputCls} type="number" value={form.diaVencimento} onChange={e => set('diaVencimento', e.target.value)} placeholder="Ex: 10" min="1" max="31" />
        </Field>
        <Field label="Valor do material didático (R$)">
          <input className={inputCls} type="number" value={form.valorMaterial} onChange={e => set('valorMaterial', e.target.value)} placeholder="Ex: 250.00" />
        </Field>
      </Section>

      {/* GERAR */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleGerar}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-base"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          {loading ? 'Gerando contrato...' : 'Gerar e Baixar Contrato'}
        </button>
      </div>
    </div>
  )
}
