import * as XLSX from 'xlsx'

function parseAmt(v) {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    // Formato boliviano: "1.112,40" → 1112.40
    const f = parseFloat(v.trim().replace(/\./g, '').replace(',', '.'))
    return isNaN(f) ? 0 : f
  }
  return 0
}

function parseHrs(v) {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const f = parseFloat(v.replace(',', '.'))
    return isNaN(f) ? 0 : f
  }
  return 0
}

/**
 * Lee un ArrayBuffer de Excel y devuelve un array de docentes agrupados por CI.
 * Cada docente: { ci, nombre, subjects: [{ sigla, asig, ac, ef, acM, efM, rem }] }
 */
export function parseExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

  if (!rows.length) throw new Error('El archivo no tiene datos.')

  const keys = Object.keys(rows[0])

  // Búsqueda flexible de columnas por nombre
  const findCol = (tests) =>
    keys.find(k => tests.some(t => k.toLowerCase().includes(t.toLowerCase()))) || null

  const colCI    = keys.find(k => /^c\.?i\.?$/i.test(k.trim())) || findCol(['ci'])
  const colNom   = findCol(['nombre y ap', 'nombre y apellido'])
  const colSigla = keys.find(k => k.toLowerCase().trim() === 'sigla') || findCol(['sigla'])
  const colAsig  = findCol(['asignatura'])
  const colAcSem = findCol(['horas academicas sem', 'horas aca. sem', 'horas académicas sem'])
  const colEfSem = keys.find(k => /horas.?efectivas/i.test(k) && !/mensual/i.test(k))
  const colAcMen = findCol(['horas aca. mensual', 'horas académicas mensual', 'horas academicas mensual'])
  const colEfMen = findCol(['horas efec. mensual', 'horas efectivas mensual'])
  const colRem   = findCol(['remuneraci'])

  // Fallback por índice si el nombre no matchea (columnas B,C,E,F,G,H,I,J,M)
  const C = (col, idx) => col || keys[idx] || null
  const cCI    = C(colCI,    1)
  const cNom   = C(colNom,   2)
  const cSig   = C(colSigla, 4)
  const cAsig  = C(colAsig,  5)
  const cAcS   = C(colAcSem, 6)
  const cEfS   = C(colEfSem, 7)
  const cAcM   = C(colAcMen, 8)
  const cEfM   = C(colEfMen, 9)
  const cRem   = C(colRem,  12)

  const map = {}

  rows.forEach(r => {
    const ci  = String(r[cCI]  || '').trim()
    const nom = String(r[cNom] || '').trim()
    if (!ci || !nom || ci === cCI) return  // saltar filas vacías o encabezado

    if (!map[ci]) map[ci] = { ci, nombre: nom, subjects: [] }

    map[ci].subjects.push({
      sigla: String(r[cSig]  || '').trim(),
      asig:  String(r[cAsig] || '').trim(),
      ac:    parseHrs(r[cAcS]),
      ef:    parseHrs(r[cEfS]),
      acM:   parseHrs(r[cAcM]),
      efM:   parseHrs(r[cEfM]),
      rem:   parseAmt(r[cRem]),
    })
  })

  const teachers = Object.values(map).filter(t => t.subjects.length > 0)
  if (!teachers.length) throw new Error('No se encontraron docentes. Verificá las columnas del Excel.')
  return teachers
}
