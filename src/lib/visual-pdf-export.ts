'use client'

type VisualPdfOptions = {
  filename: string
  selector?: string
}

export async function exportVisualPdf(root: HTMLElement, options: VisualPdfOptions) {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
    document.fonts?.ready ?? Promise.resolve(),
  ])
  const html2canvas = html2canvasModule.default
  const pages = Array.from(root.querySelectorAll<HTMLElement>(options.selector ?? '.student-guide-sheet'))

  if (pages.length === 0) {
    throw new Error('Nenhuma página do relatório foi encontrada para exportar.')
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  for (const [index, page] of pages.entries()) {
    const canvas = await html2canvas(page, {
      backgroundColor: '#ffffff',
      scale: Math.min(3, window.devicePixelRatio || 2),
      useCORS: true,
      allowTaint: true,
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
      onclone: clonedDocument => {
        clonedDocument.body.style.background = '#ffffff'
        clonedDocument.querySelectorAll('.no-print').forEach(element => element.remove())
        clonedDocument.querySelectorAll<HTMLElement>('.student-guide-document').forEach(element => {
          element.style.gap = '0'
        })
        clonedDocument.querySelectorAll<HTMLElement>('.student-guide-sheet').forEach(element => {
          element.style.margin = '0'
          element.style.boxShadow = 'none'
        })
      },
    })

    if (index > 0) pdf.addPage('a4', 'portrait')
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297, undefined, 'FAST')
  }

  pdf.save(options.filename)
}
