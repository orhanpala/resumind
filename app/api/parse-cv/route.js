import { NextResponse } from 'next/server'

async function extractPDFText(buffer) {
  let text = ''

  // Yöntem 1: pdf-parse
  try {
    const raw = await import('pdf-parse')
    const fn  = raw.default || raw
    if (typeof fn === 'function') {
      const r = await fn(buffer)
      text = r.text || ''
    }
  } catch {}

  // Yöntem 2: pdf2json (fallback)
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
          ;(tx.R || []).forEach(r => {
            try { t += decodeURIComponent(r.T) + ' ' } catch { t += (r.T || '') + ' ' }
          })
        })
        t += '\n'
      })
      if (t.trim().length > text.trim().length) text = t
    } catch {}
  }

  return text.trim()
}

async function detectPDFPhoto(buffer) {
  try {
    const PDFParser = (await import('pdf2json')).default
    const data = await new Promise((res, rej) => {
      const p = new PDFParser()
      p.on('pdfParser_dataReady', res)
      p.on('pdfParser_dataError', rej)
      p.parseBuffer(buffer)
    })
    for (const pg of (data.Pages || [])) {
      for (const img of (pg.Imgs || [])) {
        if (img.w > 3 && img.h > 3) return true
      }
    }
  } catch {}
  return false
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const name   = (file.name || '').toLowerCase()
    const type   = file.type || ''

    let text = '', hasPhoto = false, photoBase64 = null

    /* ── TXT ── */
    if (name.endsWith('.txt') || type === 'text/plain') {
      text = buffer.toString('utf-8')

    /* ── PDF ── */
    } else if (name.endsWith('.pdf') || type === 'application/pdf') {
      text     = await extractPDFText(buffer)
      hasPhoto = await detectPDFPhoto(buffer)

      if (!text || text.trim().length < 30) {
        return NextResponse.json({
          success:  false,
          isScanned: true,
          error: 'Bu PDF taranmış görüntü içeriyor, metin okunamıyor. Lütfen bilgilerinizi manuel olarak girin.',
        })
      }

    /* ── DOCX / DOC ── */
    } else if (
      name.endsWith('.docx') || name.endsWith('.doc') ||
      type.includes('word')
    ) {
      const mammoth = await import('mammoth')
      text = (await mammoth.extractRawText({ buffer })).value || ''

      // İçindeki ilk büyük görseli çıkarmayı dene
      try {
        const html = await mammoth.convertToHtml({ buffer })
        const m = html.value.match(/src="data:image\/(jpeg|png|gif|webp);base64,([^"]{3000,})"/)
        if (m) { photoBase64 = `data:image/${m[1]};base64,${m[2]}`; hasPhoto = true }
      } catch {}

    /* ── Diğer (metin olarak okumayı dene) ── */
    } else {
      try {
        const decoded   = buffer.toString('utf-8')
        const readable  = decoded.replace(/[^\x20-\x7E\u00C0-\u024F]/g, '').length
        if (readable > 50) {
          text = decoded
        } else {
          return NextResponse.json(
            { error: `"${file.name}" desteklenmiyor. PDF, Word (.docx) veya metin (.txt) dosyası yükleyin.` },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json({ error: 'Dosya okunamadı.' }, { status: 400 })
      }
    }

    // Metni temizle
    text = text
      .replace(/[ \t]+/g, ' ')
      .replace(/(\r\n|\r|\n){3,}/g, '\n\n')
      .trim()

    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'Dosyadan metin okunamadı.' }, { status: 400 })
    }

    return NextResponse.json({ success: true, text, hasPhoto, photoBase64 })

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
