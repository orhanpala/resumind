import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = file.name.toLowerCase()
    let text = ''
    let hasPhoto = false
    let photoBase64 = null

    if (fileName.endsWith('.pdf')) {

      // ── 1. Metni çıkar (pdf-parse önce, pdf2json yedek) ──────────
      try {
        const pdfParse = (await import('pdf-parse')).default
        const result = await pdfParse(buffer)
        text = result.text
      } catch {
        try {
          const PDFParser = (await import('pdf2json')).default
          text = await new Promise((resolve, reject) => {
            const parser = new PDFParser()
            parser.on('pdfParser_dataReady', (data) => {
              let t = ''
              ;(data.Pages || []).forEach(page => {
                ;(page.Texts || []).forEach(tx => {
                  ;(tx.R || []).forEach(r => {
                    try { t += decodeURIComponent(r.T) + ' ' } catch { t += r.T + ' ' }
                  })
                })
                t += '\n'
              })
              resolve(t)
            })
            parser.on('pdfParser_dataError', reject)
            parser.parseBuffer(buffer)
          })
        } catch {
          return NextResponse.json(
            { error: 'PDF okunamadı. Metin tabanlı bir PDF veya Word dosyası yükleyin.' },
            { status: 400 }
          )
        }
      }

      // ── 2. PDF içinde fotoğraf var mı? (pdf2json Imgs kontrolü) ──
      try {
        const PDFParser = (await import('pdf2json')).default
        await new Promise((resolve) => {
          const parser = new PDFParser()
          parser.on('pdfParser_dataReady', (data) => {
            const pages = data.Pages || []
            for (const page of pages) {
              const imgs = page.Imgs || []
              // Makul boyutta bir resim varsa (CV fotosu genellikle w>3 h>3)
              const cvPhoto = imgs.find(img => img.w > 3 && img.h > 3)
              if (cvPhoto) { hasPhoto = true; break }
            }
            resolve()
          })
          parser.on('pdfParser_dataError', resolve) // hata olursa skip
          parser.parseBuffer(buffer)
        })
      } catch { /* sessizce geç */ }

    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {

      const mammoth = await import('mammoth')

      // ── Metin çıkar ──
      const textResult = await mammoth.extractRawText({ buffer })
      text = textResult.value

      // ── DOCX içindeki ilk görseli çıkarmayı dene ──
      try {
        const raw = await mammoth.convertToHtml({ buffer })
        // mammoth HTML'de base64 img var mı?
        const imgMatch = raw.value.match(/src="data:image\/(jpeg|png|gif);base64,([^"]+)"/)
        if (imgMatch) {
          const mime  = imgMatch[1]
          const b64   = imgMatch[2]
          // Makul boyut kontrolü (küçük ikonlar olmasın)
          if (b64.length > 5000) {
            photoBase64 = `data:image/${mime};base64,${b64}`
            hasPhoto = true
          }
        }
      } catch { /* görsel yoksa sorun değil */ }

    } else {
      return NextResponse.json(
        { error: 'Sadece PDF veya Word dosyası yükleyebilirsiniz (.pdf, .doc, .docx)' },
        { status: 400 }
      )
    }

    // ── 3. Metni temizle ──────────────────────────────────────────
    text = text
      .replace(/[ \t]+/g, ' ')
      .replace(/(\r\n|\r|\n){3,}/g, '\n\n')
      .trim()

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'Dosyadan metin okunamadı. Taranmış PDF olabilir. Metin tabanlı dosya yükleyin.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      text,
      hasPhoto,
      photoBase64,  // DOCX'tan çıkarıldıysa dolu, PDF'te null
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
