import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = (file.name || '').toLowerCase()
    let text = ''
    let hasPhoto = false
    let photoBase64 = null
    let isScanned = false

    /* ── TXT ─────────────────────────────────────────────────── */
    if (fileName.endsWith('.txt') || file.type === 'text/plain') {
      text = buffer.toString('utf-8')

    /* ── PDF ─────────────────────────────────────────────────── */
    } else if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {

      /* Deneme 1: pdf-parse */
      try {
        const raw = await import('pdf-parse')
        const pdfParse = raw.default || raw
        if (typeof pdfParse === 'function') {
          const result = await pdfParse(buffer)
          text = result.text || ''
        }
      } catch {}

      /* Deneme 2: pdf2json (fallback veya foto tespiti için) */
      try {
        const PDFParser = (await import('pdf2json')).default
        const result = await new Promise((resolve, reject) => {
          const parser = new PDFParser()
          parser.on('pdfParser_dataReady', resolve)
          parser.on('pdfParser_dataError', reject)
          parser.parseBuffer(buffer)
        })
        /* Metin çıkar */
        if (!text || text.trim().length < 50) {
          let t = ''
          ;(result.Pages || []).forEach(page => {
            ;(page.Texts || []).forEach(tx => {
              ;(tx.R || []).forEach(r => {
                try { t += decodeURIComponent(r.T) + ' ' } catch { t += (r.T || '') + ' ' }
              })
            })
            t += '\n'
          })
          if (t.trim().length > text.trim().length) text = t
        }
        /* Foto tespiti */
        ;(result.Pages || []).forEach(page => {
          ;(page.Imgs || []).forEach(img => {
            if (img.w > 3 && img.h > 3) hasPhoto = true
          })
        })
      } catch {}

      /* Taranmış PDF kontrolü */
      if (!text || text.trim().length < 30) {
        isScanned = true
        text = ''  // boş döndür, client uyarı gösterir
      }

    /* ── DOCX / DOC ──────────────────────────────────────────── */
    } else if (
      fileName.endsWith('.docx') || fileName.endsWith('.doc') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      const mammoth = await import('mammoth')
      const textResult = await mammoth.extractRawText({ buffer })
      text = textResult.value || ''

      /* DOCX içi görsel */
      try {
        const html = await mammoth.convertToHtml({ buffer })
        const imgMatch = html.value.match(/src="data:image\/(jpeg|png|gif|webp);base64,([^"]{3000,})"/)
        if (imgMatch) {
          photoBase64 = `data:image/${imgMatch[1]};base64,${imgMatch[2]}`
          hasPhoto = true
        }
      } catch {}

    /* ── Diğer tüm dosyalar ──────────────────────────────────── */
    } else {
      /* UTF-8 metin olarak okumayı dene */
      try {
        const decoded = buffer.toString('utf-8')
        /* Makul miktarda okunabilir karakter varsa kabul et */
        const readableChars = decoded.replace(/[^\x20-\x7E\u00C0-\u024F\u0100-\u024F]/g, '').length
        if (readableChars > 50) {
          text = decoded
        } else {
          return NextResponse.json(
            { error: `"${file.name}" dosyası desteklenmiyor. PDF, Word (.docx) veya metin (.txt) dosyası yükleyin.` },
            { status: 400 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Dosya okunamadı. PDF, Word veya metin dosyası yükleyin.' },
          { status: 400 }
        )
      }
    }

    /* ── Metin temizle ───────────────────────────────────────── */
    text = text
      .replace(/[ \t]+/g, ' ')
      .replace(/(\r\n|\r|\n){3,}/g, '\n\n')
      .trim()

    /* Taranmış PDF */
    if (isScanned) {
      return NextResponse.json({
        success: false,
        isScanned: true,
        error: 'Bu PDF görsel tabanlı (taranmış) görünüyor ve metin çıkarılamıyor. Bilgilerinizi manuel olarak yazabilir veya metin içeren bir PDF yükleyebilirsiniz.',
      })
    }

    if (!text || text.length < 10) {
      return NextResponse.json(
        { error: 'Dosyadan metin okunamadı.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, text, hasPhoto, photoBase64 })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
