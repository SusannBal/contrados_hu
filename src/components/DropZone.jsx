import { useRef, useState } from 'react'

export default function DropZone({ onFile }) {
  const inputRef  = useRef(null)
  const [over, setOver] = useState(false)

  const handle = file => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => onFile(e.target.result, file.name)
    reader.readAsArrayBuffer(file)
  }

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDragOver={e  => { e.preventDefault(); setOver(true)  }}
      onDragLeave={() => setOver(false)}
      onDrop={e      => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]) }}
      style={{
        border:        `2px dashed ${over ? '#1a73e8' : '#ccc'}`,
        borderRadius:  10,
        padding:       '40px 24px',
        textAlign:     'center',
        cursor:        'pointer',
        background:    over ? '#f0f7ff' : '#fafafa',
        transition:    'all .15s',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
        Arrastrá el Excel aquí o hacé clic para elegir
      </p>
      <p style={{ color: '#888', fontSize: 12 }}>
        Formato .xlsx · Columnas: CI · NOMBRE Y APELLIDO · SIGLA · ASIGNATURA · HORAS · REMUNERACION
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={e => { handle(e.target.files[0]); e.target.value = '' }}
      />
    </div>
  )
}
