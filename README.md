# Generador de Contratos Docentes – UCB "San Pablo" Tarija

App React local para generar contratos Word en masa a partir de un Excel.

## Stack

- **React 18** + **Vite**
- **xlsx** (SheetJS) – parsear el Excel
- **jszip** – manipular el .docx y empaquetar el ZIP final
- **file-saver** – disparar la descarga del ZIP
- La plantilla `PLANTILLA.docx` está embebida en `src/utils/template.b64.js` como base64

## Instalación y uso

```bash
npm install
npm run dev
```

Abrí http://localhost:5173 en el navegador.

## Columnas requeridas en el Excel

| Columna | Ejemplo |
|---|---|
| CI | 10647980 |
| NOMBRE Y APELLIDO | ALMAZAN AGUIRRE NATHALIA BELEN |
| SIGLA | FIS-111 |
| ASIGNATURA | FISICA I Y LABORATORIO |
| HORAS ACADEMICAS SEMANA | 6 |
| HORAS EFECTIVAS | 4.5 |
| HORAS ACA. MENSUAL | 24 |
| HORAS EFEC. MENSUAL | 18 |
| REMUNERACION | 1.112,40 |

Si un docente dicta varias materias aparece con varias filas en el Excel.
La app agrupa automáticamente por CI.

## Qué completa en cada contrato

- `[NOMBRE_COMPLETO]` y `[CI]` del contratista
- Tabla de asignaturas (cláusula 3) con horas semanales y mensuales
- `[TOTAL_BS]` = suma de remuneraciones × 10 pagos, formato `23.200,00`
- `[TOTAL_LITERAL]` = monto en palabras (VEINTITRES MIL DOSCIENTOS 00/100)
- `[PAGO_1]` y `[PAGO_1_LITERAL]` = pago mensual y su literal

## Para actualizar la plantilla

Si cambia el `PLANTILLA.docx`:

1. Fijate que tenga los placeholders `[NOMBRE_COMPLETO]`, `[CI]`, `[TABLA_MATERIAS]`,
   `[TOTAL_BS]`, `[TOTAL_LITERAL]`, `[PAGO_1]`, `[PAGO_1_LITERAL]`
2. Convertí el nuevo .docx a base64:
   ```bash
   python3 -c "import base64; print(base64.b64encode(open('PLANTILLA.docx','rb').read()).decode())"
   ```
3. Reemplazá el contenido de `src/utils/template.b64.js`

## Build para producción

```bash
npm run build
```
Genera la carpeta `dist/` lista para servir como sitio estático.
