import { fmtBs } from '../utils/numberToWords.js'

const th = { padding: '9px 12px', borderBottom: '2px solid #e0e0e0', color: '#555', fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }
const td = { padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }

export default function TeachersTable({ teachers }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>CI</th>
            <th style={th}>Nombre completo</th>
            <th style={{ ...th, textAlign: 'center' }}>Materias</th>
            <th style={{ ...th, textAlign: 'right' }}>Pago mensual (Bs.)</th>
            <th style={{ ...th, textAlign: 'right' }}>Total contrato (Bs.)</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(t => {
            const pago1 = t.subjects.reduce((s, r) => s + r.rem, 0)
            const total  = pago1 * 10
            return (
              <tr key={t.ci} style={{ ':hover': { background: '#fafafa' } }}>
                <td style={{ ...td, color: '#888', fontSize: 12 }}>{t.ci}</td>
                <td style={{ ...td, fontWeight: 600 }}>{t.nombre}</td>
                <td style={{ ...td, textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                    fontSize: 11, background: '#e8f0fe', color: '#1a73e8', fontWeight: 600,
                  }}>
                    {t.subjects.length}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtBs(pago1)}
                </td>
                <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {fmtBs(total)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
