// Conversión de números a palabras en español (estilo boliviano)

const UNOS = [
  '', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
  'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
  'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
]
const DECENAS = [
  '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA',
  'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA',
]
const CENTENAS = [
  '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS',
  'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS',
]
const VEINTIS = [
  '', 'VEINTIUN', 'VEINTIDOS', 'VEINTITRES', 'VEINTICUATRO',
  'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE',
]

function lt1000(n) {
  if (n === 0) return ''
  if (n === 100) return 'CIEN'
  if (n < 20) return UNOS[n]
  if (n < 30) return n % 10 === 0 ? 'VEINTE' : VEINTIS[n % 10]
  const h = Math.floor(n / 100)
  const r = n % 100
  if (h > 0) {
    const hs = CENTENAS[h]
    return r === 0 ? hs : hs + ' ' + lt1000(r)
  }
  const t = Math.floor(r / 10)
  const u = r % 10
  return DECENAS[t] + (u > 0 ? ' Y ' + UNOS[u] : '')
}

export function numToWords(n) {
  n = Math.round(n)
  if (n === 0) return 'CERO'
  const millones = Math.floor(n / 1_000_000)
  const miles    = Math.floor((n % 1_000_000) / 1_000)
  const resto    = n % 1_000
  let r = ''
  if (millones > 0) r += millones === 1 ? 'UN MILLON' : lt1000(millones) + ' MILLONES'
  if (miles    > 0) r += (r ? ' ' : '') + (miles === 1 ? 'MIL' : lt1000(miles) + ' MIL')
  if (resto    > 0) r += (r ? ' ' : '') + lt1000(resto)
  return r
}

/** Formatea un número como "23.200,00" (estilo boliviano) */
export function fmtBs(n) {
  const cents = Math.round((n % 1) * 100)
  const int   = Math.floor(n)
  const intStr = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return intStr + ',' + String(cents).padStart(2, '0')
}

/** Devuelve el literal del monto: "VEINTITRES MIL DOSCIENTOS 00/100" */
export function moneyWords(n) {
  const cents = Math.round((n % 1) * 100)
  const int   = Math.floor(n)
  return numToWords(int) + ' ' + String(cents).padStart(2, '0') + '/100'
}
