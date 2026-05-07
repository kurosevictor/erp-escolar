import ExcelJS from 'exceljs'

interface ExportColumn<T> {
  header: string
  key: string
  width?: number
  formatter?: (value: unknown, row: T) => string | number
}

export async function exportToXlsx<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName = 'Dados'
): Promise<void> {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'ERP Escolar'
  wb.created = new Date()

  const ws = wb.addWorksheet(sheetName)
  ws.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width ?? 20,
  }))

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' },
  }
  ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
  ws.getRow(1).height = 24

  data.forEach((row) => {
    const rowData: Record<string, unknown> = {}
    columns.forEach((col) => {
      const rawValue = col.key.includes('.')
        ? col.key.split('.').reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], row)
        : row[col.key]
      rowData[col.key] = col.formatter ? col.formatter(rawValue, row) : rawValue
    })
    ws.addRow(rowData)
  })

  ws.eachRow((row, idx) => {
    if (idx > 1) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: idx % 2 === 0 ? 'FFF8FAFC' : 'FFFFFFFF' },
      }
    }
    row.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } }
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
