const unidades = [
  '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
]
const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

function inteiroExtenso(n: number): string {
  if (n === 0) return 'zero'
  if (n === 100) return 'cem'
  if (n === 1000) return 'mil'

  const partes: string[] = []

  if (n >= 1000) {
    const m = Math.floor(n / 1000)
    partes.push(m === 1 ? 'mil' : `${inteiroExtenso(m)} mil`)
    n = n % 1000
  }

  if (n >= 100) {
    partes.push(centenas[Math.floor(n / 100)])
    n = n % 100
  }

  if (n >= 20) {
    const d = dezenas[Math.floor(n / 10)]
    const u = n % 10 ? ` e ${unidades[n % 10]}` : ''
    partes.push(d + u)
  } else if (n > 0) {
    partes.push(unidades[n])
  }

  return partes.join(' e ')
}

export function valorExtenso(valor: number): string {
  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)

  const parteInteira = inteiroExtenso(inteiro)
  const labelInteiro = inteiro === 1 ? 'real' : 'reais'

  if (centavos === 0) return `${parteInteira} ${labelInteiro}`

  const parteCentavos = inteiroExtenso(centavos)
  const labelCentavos = centavos === 1 ? 'centavo' : 'centavos'

  return `${parteInteira} ${labelInteiro} e ${parteCentavos} ${labelCentavos}`
}
