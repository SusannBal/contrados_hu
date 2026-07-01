import { useState } from 'react'
import DropZone      from './components/DropZone.jsx'
import TeachersTable from './components/TeachersTable.jsx'
import { parseExcel }  from './utils/parseExcel.js'
import { generateZip } from './utils/buildDocx.js'

// ─── Estilos inline reutilizables ────────────────────────────────────────────
const card = {
  background:   '#fff',
  border:       '1px solid #e0e0e0',
  borderRadius: 10,
  padding:      24,
  marginBottom: 20,
}

const btnBase = {
  display:       'inline-flex',
  alignItems:    'center',
  gap:           6,
  padding:       '10px 20px',
  borderRadius:  6,
  border:        'none',
  cursor:        'pointer',
  fontSize:      14,
  fontWeight:    500,
  transition:    'all .15s',
}

const btnPrimary   = { ...btnBase, background: '#1a73e8', color: '#fff' }
const btnSecondary = { ...btnBase, background: '#fff', color: '#444', border: '1px solid #ccc' }
const btnDisabled  = { ...btnPrimary, background: '#aac4f0', cursor: 'not-allowed' }

// ─── Componente principal ─────────────────────────────────────────────────────
export default function App() {
  const [teachers,  setTeachers]  = useState([])
  const [fileName,  setFileName]  = useState('')
  const [msg,       setMsg]       = useState(null)   // { text, type }
  const [progress,  setProgress]  = useState(null)   // { done, total }
  const [generating, setGenerating] = useState(false)

  // Leer y parsear Excel
  function handleFile(buffer, name) {
    setMsg(null)
    try {
      const result = parseExcel(buffer)
      setTeachers(result)
      setFileName(name)
      setMsg({ text: `${result.length} docente${result.length !== 1 ? 's' : ''} encontrado${result.length !== 1 ? 's' : ''}.`, type: 'ok' })
    } catch (err) {
      setMsg({ text: err.message, type: 'err' })
      setTeachers([])
    }
  }

  // Generar ZIP con todos los contratos
  async function handleGenerate() {
    if (!teachers.length || generating) return
    setGenerating(true)
    setProgress({ done: 0, total: teachers.length })
    setMsg({ text: `Generando ${teachers.length} contrato${teachers.length !== 1 ? 's' : ''}...`, type: 'info' })
    try {
      await generateZip(teachers, (done, total) => setProgress({ done, total }))
      setMsg({ text: `✓ ${teachers.length} contratos generados y descargados.`, type: 'ok' })
    } catch (err) {
      setMsg({ text: 'Error al generar: ' + err.message, type: 'err' })
    } finally {
      setGenerating(false)
      setProgress(null)
    }
  }

  const msgColors = {
    ok:   { background: '#e6f4ea', color: '#137333' },
    err:  { background: '#fce8e6', color: '#c5221f' },
    info: { background: '#e8f0fe', color: '#1557b0' },
  }

  return (
    <div>
      {/* Header */}
      <p style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
        UCB "San Pablo" · Tarija · Gestión 2026
      </p>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Generador de contratos docentes
      </h1>
      <p style={{ color: '#666', fontSize: 13, marginBottom: 28 }}>
        Subí el Excel → revisá los totales → descargá todos los contratos Word en un ZIP.
      </p>

      {/* Upload */}
      <div style={card}>
        <DropZone onFile={handleFile} />
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{
          ...msgColors[msg.type],
          borderRadius: 6,
          padding:      '10px 14px',
          marginBottom: 16,
          fontSize:     13,
        }}>
          {msg.text}
        </div>
      )}

      {/* Resultados */}
      {teachers.length > 0 && (
        <div style={card}>
          {/* Barra superior */}
          <div style={{
            display:       'flex',
            justifyContent:'space-between',
            alignItems:    'center',
            marginBottom:  16,
            flexWrap:      'wrap',
            gap:           10,
          }}>
            <div>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>📄 {fileName}</p>
              <p style={{ fontSize: 15, fontWeight: 700 }}>
                {teachers.length} docente{teachers.length !== 1 ? 's' : ''} · {' '}
                {teachers.reduce((s, t) => s + t.subjects.length, 0)} asignatura{teachers.reduce((s, t) => s + t.subjects.length, 0) !== 1 ? 's' : ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={btnSecondary}
                onClick={() => { setTeachers([]); setFileName(''); setMsg(null) }}
              >
                ↑ Cambiar archivo
              </button>
              <button
                style={generating ? btnDisabled : btnPrimary}
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating
                  ? `⏳ ${progress ? progress.done + '/' + progress.total : '...'}`
                  : '⬇ Generar todos (.zip)'}
              </button>
            </div>
          </div>

          {/* Barra de progreso */}
          {generating && progress && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 6, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height:     '100%',
                  background: '#1a73e8',
                  borderRadius: 3,
                  width:      `${(progress.done / progress.total) * 100}%`,
                  transition: 'width .2s',
                }} />
              </div>
              <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                {progress.done} de {progress.total} contratos generados
              </p>
            </div>
          )}

          {/* Tabla de docentes */}
          <TeachersTable teachers={teachers} />

          <p style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
            💡 Total contrato = suma de remuneraciones mensuales × 10 pagos
          </p>
        </div>
      )}
    </div>
  )
}
