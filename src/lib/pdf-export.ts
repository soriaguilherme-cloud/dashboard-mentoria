'use client'

type PdfTone = 'primary' | 'muted' | 'success' | 'warning'

export type PdfSection = {
  title: string
  body?: string
  items?: string[]
  rows?: Array<[string, string]>
}

export type PdfDocumentInput = {
  title: string
  subtitle?: string
  filename: string
  metadata?: Array<[string, string]>
  sections: PdfSection[]
}

const pageWidth = 595.28
const pageHeight = 841.89
const marginX = 56
const marginY = 58
const contentWidth = pageWidth - marginX * 2
const bottomLimit = 58

const colors: Record<PdfTone, [number, number, number]> = {
  primary: [0.91, 0.31, 0.12],
  muted: [0.42, 0.45, 0.5],
  success: [0.06, 0.55, 0.33],
  warning: [0.76, 0.45, 0.08],
}

type PdfPage = {
  commands: string[]
}

class PdfBuilder {
  private pages: PdfPage[] = []
  private y = pageHeight - marginY
  private pageNumber = 0

  constructor(private readonly title: string) {
    this.addPage()
  }

  addPage() {
    this.pageNumber += 1
    this.pages.push({ commands: [] })
    this.y = pageHeight - marginY

    this.text('Mentoria Residencia Afya', marginX, this.y, 10, 'primary', true)
    this.text(`Pagina ${this.pageNumber}`, pageWidth - marginX - 44, this.y, 9, 'muted')
    this.y -= 18
    this.line(marginX, this.y, pageWidth - marginX, this.y, 'primary', 0.8)
    this.y -= 24
  }

  heading(text: string, size = 18) {
    this.ensureSpace(size + 20)
    this.text(text, marginX, this.y, size, 'primary', true)
    this.y -= size + 10
  }

  paragraph(text: string, options: { size?: number; tone?: PdfTone; indent?: number } = {}) {
    const size = options.size ?? 11
    const lineHeight = size + 5
    const x = marginX + (options.indent ?? 0)
    const width = contentWidth - (options.indent ?? 0)

    for (const line of wrapText(text, width, size)) {
      this.ensureSpace(lineHeight)
      this.text(line, x, this.y, size, options.tone ?? 'muted')
      this.y -= lineHeight
    }
  }

  bullet(text: string) {
    this.ensureSpace(18)
    this.text('-', marginX + 3, this.y, 11, 'primary', true)
    this.paragraph(text, { indent: 18, size: 10.5 })
  }

  keyValue(label: string, value: string) {
    this.ensureSpace(18)
    this.text(`${label}:`, marginX, this.y, 10.5, 'primary', true)
    this.text(value, marginX + 128, this.y, 10.5, 'muted')
    this.y -= 18
  }

  section(section: PdfSection) {
    this.ensureSpace(44)
    this.y -= 4
    this.text(section.title, marginX, this.y, 14, 'primary', true)
    this.y -= 18

    if (section.body) {
      this.paragraph(section.body, { size: 10.5 })
      this.y -= 4
    }

    if (section.items) {
      for (const item of section.items) this.bullet(item)
      this.y -= 4
    }

    if (section.rows) {
      for (const [label, value] of section.rows) this.keyValue(label, value)
      this.y -= 4
    }
  }

  spacer(value = 12) {
    this.y -= value
  }

  build() {
    const objects: string[] = []
    const pageObjectIds: number[] = []

    objects.push('<< /Type /Catalog /Pages 2 0 R >>')
    objects.push('PAGES_PLACEHOLDER')
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>')
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>')

    this.pages.forEach(page => {
      const stream = page.commands.join('\n')
      const contentId = objects.length + 1
      objects.push(`<< /Length ${byteLength(stream)} >>\nstream\n${stream}\nendstream`)
      const pageId = objects.length + 1
      pageObjectIds.push(pageId)
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`)
    })

    objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`

    return buildPdfBytes(objects, this.title)
  }

  private ensureSpace(height: number) {
    if (this.y - height < bottomLimit) this.addPage()
  }

  private text(text: string, x: number, y: number, size: number, tone: PdfTone = 'muted', bold = false) {
    const [r, g, b] = colors[tone]
    this.current.commands.push([
      'BT',
      `${r} ${g} ${b} rg`,
      `/${bold ? 'F2' : 'F1'} ${size} Tf`,
      `${x.toFixed(2)} ${y.toFixed(2)} Td`,
      `${pdfString(text)} Tj`,
      'ET',
    ].join('\n'))
  }

  private line(x1: number, y1: number, x2: number, y2: number, tone: PdfTone, width: number) {
    const [r, g, b] = colors[tone]
    this.current.commands.push(`${r} ${g} ${b} RG\n${width} w\n${x1} ${y1} m\n${x2} ${y2} l\nS`)
  }

  private get current() {
    return this.pages[this.pages.length - 1]
  }
}

export function exportPdfDocument(input: PdfDocumentInput) {
  const pdf = new PdfBuilder(input.title)
  pdf.heading(input.title, 21)

  if (input.subtitle) {
    pdf.paragraph(input.subtitle, { size: 12, tone: 'muted' })
    pdf.spacer(8)
  }

  if (input.metadata?.length) {
    for (const [label, value] of input.metadata) pdf.keyValue(label, value)
    pdf.spacer(8)
  }

  for (const section of input.sections) pdf.section(section)

  downloadBytes(pdf.build(), input.filename, 'application/pdf')
}

function wrapText(text: string, maxWidth: number, fontSize: number) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) return []

  const maxChars = Math.max(28, Math.floor(maxWidth / (fontSize * 0.52)))
  const words = normalized.split(' ')
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxChars && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }

  if (line) lines.push(line)
  return lines
}

function pdfString(value: string) {
  const sanitized = value
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/•/g, '-')
    .replace(/✅/g, 'OK')

  let output = '('
  for (const char of sanitized) {
    const code = toWinAnsiCode(char)
    if (code === 40 || code === 41 || code === 92) {
      output += `\\${String.fromCharCode(code)}`
    } else if (code < 32 || code > 126) {
      output += `\\${code.toString(8).padStart(3, '0')}`
    } else {
      output += String.fromCharCode(code)
    }
  }
  return `${output})`
}

function toWinAnsiCode(char: string) {
  const code = char.charCodeAt(0)
  if (code <= 255) return code

  const fallback: Record<string, number> = {
    '€': 128,
    '…': 133,
    '™': 153,
  }

  return fallback[char] ?? 63
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length
}

function buildPdfBytes(objects: string[], title: string) {
  const chunks: string[] = ['%PDF-1.4\n']
  const offsets: number[] = [0]
  let length = byteLength(chunks[0])

  objects.forEach((object, index) => {
    offsets[index + 1] = length
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`
    chunks.push(chunk)
    length += byteLength(chunk)
  })

  const xrefOffset = length
  const xref = [
    `xref\n0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n `),
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R /Info << /Title ${pdfString(title)} /Creator ${pdfString('Mentoria Residencia')} >> >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
  ].join('\n')

  chunks.push(xref)
  return new Blob(chunks, { type: 'application/pdf' })
}

function downloadBytes(blob: Blob, filename: string, type: string) {
  const typedBlob = blob.type === type ? blob : new Blob([blob], { type })
  const url = URL.createObjectURL(typedBlob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
