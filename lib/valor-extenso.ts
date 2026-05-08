const UNIDADES = [
  '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
]
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

function grupo(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'
  const partes: string[] = []
  if (n >= 100) { partes.push(CENTENAS[Math.floor(n / 100)]); n %= 100 }
  if (n >= 20) {
    const u = n % 10
    partes.push(u > 0 ? `${DEZENAS[Math.floor(n / 10)]} e ${UNIDADES[u]}` : DEZENAS[Math.floor(n / 10)])
  } else if (n > 0) {
    partes.push(UNIDADES[n])
  }
  return partes.join(' e ')
}

export function valorPorExtenso(valor: number): string {
  if (isNaN(valor) || valor < 0) return ''
  if (valor === 0) return 'zero reais'

  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)

  const partes: string[] = []

  if (inteiro >= 1000) {
    const mil = Math.floor(inteiro / 1000)
    partes.push(mil === 1 ? 'mil' : `${grupo(mil)} mil`)
    const resto = inteiro % 1000
    if (resto > 0) partes.push(grupo(resto))
  } else if (inteiro > 0) {
    partes.push(grupo(inteiro))
  }

  const strInteiro = partes.join(' e ')
  const sufixoReais = inteiro === 1 ? 'real' : 'reais'
  const partesFinais: string[] = []
  if (inteiro > 0) partesFinais.push(`${strInteiro} ${sufixoReais}`)
  if (centavos > 0) {
    const sufCentavos = centavos === 1 ? 'centavo' : 'centavos'
    partesFinais.push(`${grupo(centavos)} ${sufCentavos}`)
  }

  const result = partesFinais.join(' e ')
  return result.charAt(0).toUpperCase() + result.slice(1)
}
