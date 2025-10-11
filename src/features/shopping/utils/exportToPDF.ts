import jsPDF from 'jspdf'
import type { ShoppingListWithItems } from '../../../types/shopping'

export function exportShoppingListToPDF(list: ShoppingListWithItems) {
  const pdf = new jsPDF()

  let yPosition = 20
  const pageWidth = pdf.internal.pageSize.getWidth()
  const leftMargin = 15
  const rightMargin = pageWidth - 15
  const contentWidth = rightMargin - leftMargin

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text(list.name, leftMargin, yPosition)
  yPosition += 10

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  const createdDate = new Date(list.created_at).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  pdf.text(`Creata il: ${createdDate}`, leftMargin, yPosition)
  yPosition += 5

  if (list.notes) {
    const notesLines = pdf.splitTextToSize(`Note: ${list.notes}`, contentWidth)
    pdf.text(notesLines, leftMargin, yPosition)
    yPosition += notesLines.length * 5 + 5
  } else {
    yPosition += 5
  }

  pdf.setDrawColor(200, 200, 200)
  pdf.line(leftMargin, yPosition, rightMargin, yPosition)
  yPosition += 10

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Progresso:', leftMargin, yPosition)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`${list.checked_items}/${list.total_items} (${list.completion_percentage}%)`, leftMargin + 30, yPosition)
  yPosition += 10

  const groupedItems: Record<string, typeof list.items> = {}
  list.items.forEach((item) => {
    if (!groupedItems[item.category_name]) {
      groupedItems[item.category_name] = []
    }
    groupedItems[item.category_name].push(item)
  })

  Object.entries(groupedItems).forEach(([category, items]) => {
    if (yPosition > 270) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(50, 50, 150)
    pdf.text(category, leftMargin, yPosition)
    yPosition += 8

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)

    items.forEach((item) => {
      if (yPosition > 280) {
        pdf.addPage()
        yPosition = 20
      }

      const checkbox = item.is_checked ? '☑' : '☐'
      const itemText = `${checkbox} ${item.product_name}`
      const quantityText = `${item.quantity} ${item.unit || 'pz'}`

      pdf.text(itemText, leftMargin + 5, yPosition)

      pdf.setFont('helvetica', 'bold')
      const quantityWidth = pdf.getTextWidth(quantityText)
      pdf.text(quantityText, rightMargin - quantityWidth, yPosition)
      pdf.setFont('helvetica', 'normal')

      if (item.notes) {
        yPosition += 5
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        const noteLines = pdf.splitTextToSize(`  Note: ${item.notes}`, contentWidth - 10)
        pdf.text(noteLines, leftMargin + 5, yPosition)
        yPosition += noteLines.length * 4
        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
      }

      yPosition += 7
    })

    yPosition += 3
  })

  if (yPosition > 260) {
    pdf.addPage()
    yPosition = 20
  }

  yPosition += 10
  pdf.setDrawColor(200, 200, 200)
  pdf.line(leftMargin, yPosition, rightMargin, yPosition)
  yPosition += 8

  pdf.setFontSize(9)
  pdf.setTextColor(100, 100, 100)
  pdf.text('Generato da Business HACCP Manager', leftMargin, yPosition)
  const generatedDate = new Date().toLocaleString('it-IT')
  const dateWidth = pdf.getTextWidth(generatedDate)
  pdf.text(generatedDate, rightMargin - dateWidth, yPosition)

  const fileName = `${list.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}
