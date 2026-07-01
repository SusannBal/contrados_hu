import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import TEMPLATE_B64 from './template.b64.js'
import { fmtBs, moneyWords } from './numberToWords.js'

// ─── Generar tabla OOXML para la cláusula 3 ───────────────────────────────────
function makeTableXml(subjects) {
  const COL_WIDTHS = [2900, 1100, 2100, 2206]

  const esc = s =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const rProps = (bold) =>
    `<w:rPr>
      <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
      ${bold ? '<w:b/>' : ''}
      <w:sz w:val="18"/><w:szCs w:val="18"/>
    </w:rPr>`

  const cell = (text, width, bold = false) =>
    `<w:tc>
      <w:tcPr><w:tcW w:w="${width}" w:type="dxa"/></w:tcPr>
      <w:p>
        <w:pPr><w:jc w:val="center"/>${rProps(bold)}</w:pPr>
        <w:r>${rProps(bold)}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>
      </w:p>
    </w:tc>`

  const HEADERS = [
    'ASIGNATURA', 'SIGLA',
    'HORA DE SERVICIO POR SEMANA',
    'HORAS DE SERVICIO MENSUAL',
  ]

  const headerRow =
    '<w:tr>' + HEADERS.map((h, i) => cell(h, COL_WIDTHS[i], true)).join('') + '</w:tr>'

  const fmtHrs = n => (Number.isInteger(n) ? String(n) : String(n))

  const dataRows = subjects
    .map(s => {
      const semana  = `${fmtHrs(s.ef)} horas efectivas de servicio, equivalentes a ${fmtHrs(s.ac)} horas academicas.`
      const mensual = `${fmtHrs(s.efM)} horas efectivas de servicio, equivalentes a ${fmtHrs(s.acM)} horas academicas.`
      return (
        '<w:tr>' +
        cell(s.asig,  COL_WIDTHS[0]) +
        cell(s.sigla, COL_WIDTHS[1]) +
        cell(semana,  COL_WIDTHS[2]) +
        cell(mensual, COL_WIDTHS[3]) +
        '</w:tr>'
      )
    })
    .join('')

  const borders = `
    <w:tblBorders>
      <w:top    w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:left   w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:right  w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
    </w:tblBorders>`

  return `
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="8306" w:type="dxa"/>
        ${borders}
      </w:tblPr>
      <w:tblGrid>
        ${COL_WIDTHS.map(w => `<w:gridCol w:w="${w}"/>`).join('')}
      </w:tblGrid>
      ${headerRow}
      ${dataRows}
    </w:tbl>`
}

// ─── Generar el .docx para un docente ────────────────────────────────────────
export async function buildDocx(teacher) {
  const zip = await JSZip.loadAsync(TEMPLATE_B64, { base64: true })
  let xml = await zip.file('word/document.xml').async('text')

  const pago1 = teacher.subjects.reduce((sum, s) => sum + s.rem, 0)
  const total  = pago1 * 10

  // Reemplazos simples
  xml = xml.replaceAll('[NOMBRE_COMPLETO]', teacher.nombre)
  xml = xml.replaceAll('[CI]',              teacher.ci)
  xml = xml.replaceAll('[TOTAL_BS]',        fmtBs(total))
  xml = xml.replaceAll('[TOTAL_LITERAL]',   moneyWords(total))
  xml = xml.replaceAll('[PAGO_1]',          fmtBs(pago1))
  xml = xml.replaceAll('[PAGO_1_LITERAL]',  moneyWords(pago1))

  // Reemplazar el párrafo [TABLA_MATERIAS] con la tabla OOXML
  const markerIdx = xml.indexOf('[TABLA_MATERIAS]')
  if (markerIdx !== -1) {
    const paraStart = xml.lastIndexOf('<w:p ', markerIdx)
    const paraEnd   = xml.indexOf('</w:p>', markerIdx) + '</w:p>'.length
    xml = xml.slice(0, paraStart) + makeTableXml(teacher.subjects) + xml.slice(paraEnd)
  }

  zip.file('word/document.xml', xml)

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

// ─── Generar todos los contratos y descargar como ZIP ────────────────────────
export async function generateZip(teachers, onProgress) {
  const outputZip = new JSZip()

  for (let i = 0; i < teachers.length; i++) {
    const t    = teachers[i]
    const blob = await buildDocx(t)

    // Nombre de archivo seguro: apellidos sin caracteres especiales
    const safe = t.nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .trim()
      .replace(/ +/g, '_')
      .substring(0, 50)

    outputZip.file(`contrato_${safe}.docx`, blob)
    onProgress && onProgress(i + 1, teachers.length)
  }

  const zipBlob = await outputZip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, 'contratos_UCB_2026.zip')
}
