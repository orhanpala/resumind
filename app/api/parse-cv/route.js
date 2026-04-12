import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function extractPDFText(buffer) {
  let text = ''
  try {
    const raw = await import('pdf-parse')
    const fn = raw.default || raw
    if (typeof fn === 'function') { const r = await fn(buffer); text = r.text || '' }
  } catch {}

  if (!text || text.trim().length < 50) {
    try {
      const PDFParser = (await import('pdf2json')).default
      const data = await new Promise((res, rej) => {
        const p = new PDFParser()
        p.on('pdfParser_dataReady', res)
        p.on('pdfParser_dataError', rej)
        p.parseBuffer(buffer)
      })
      let t = ''
      ;(data.Pages || []).forEach(pg => {
        ;(pg.Texts || []).forEach(tx => {
          ;(tx.R || []).forEach(r => { try { t += decodeURIComponent(r.T) + ' ' } catch { t += (r.T || '') + ' ' } })
        })
        t += '\n'
      })
      if (t.trim().length > text.trim().length) text = t
    } catch {}
  }
  return text.trim()
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const name   = (file.name || '').toLowerCase()
    let text = '', hasPhoto = false, photoBase64 = null

    if (name.endsWith('.txt') || file.type === 'text/plain') {
      text = buffer.toString('utf-8')

    } else if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      text = await extractPDFText(buffer)

      try {
        const PDFParser = (await import('pdf2json')).default
        const data = await new Promise((res, rej) => {
          const p = new PDFParser()
          p.on('pdfParser_dataReady', res)
          p.on('pdfParser_dataError', rej)
          p.parseBuffer(buffer)
        })
        ;(data.Pages || []).forEach(pg => {
          ;(pg.Imgs || []).forEach(img => { if (img.w > 3 && img.h > 3) hasPhoto = true })
        })
      } catch {}

      if (!text || text.trim().length < 30) {
        return NextResponse.json({
          success: false,
          isScanned: true,
          error: 'Bu PDF taranmış görüntü içeriyor, metin okunamıyor. Lütfen bilgilerinizi manuel olarak girin.',
        })
      }

    } else if (name.endsWith('.docx') || name.endsWith('.doc') || file.type?.includes('word')) {
      const mammoth = await import('mammoth')
      text = (await mammoth.extractRawText({ buffer })).value || ''
      try {
        const html = await mammoth.convertToHtml({ buffer })
        const m = html.value.match(/src="data:image\/(jpeg|png|gif|webp);base64,([^"]{3000,})"/)
        if (m) { photoBase64 = `data:image/${m[1]};base64,${m[2]}`; hasPhoto = true }
      } catch {}

    } else {
      try {
        const dec = buffer.toString('utf-8')
        if (dec.replace(/[^\x20-\x7E\u00C0-\u024F]/g, '').length > 50) text = dec
        else return NextResponse.json({ error: `"${file.name}" desteklenmiyor. PDF, Word veya TXT yükleyin.` }, { status: 400 })
      } catch {
        return NextResponse.json({ error: 'Dosya okunamadı.' }, { status: 400 })
      }
    }

    text = text.replace(/[ \t]+/g, ' ').replace(/(\r\n|\r|\n){3,}/g, '\n\n').trim()
    if (!text || text.length < 10) return NextResponse.json({ error: 'Dosyadan metin okunamadı.' }, { status: 400 })

    return NextResponse.json({ success: true, text, hasPhoto, photoBase64 })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
