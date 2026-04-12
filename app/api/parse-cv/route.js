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

    if (fileName.endsWith('.pdf')) {
      // Önce pdf-parse dene (fotolu ve karmaşık PDF'ler için daha güvenilir)
      try {
        const pdfParse = (await import('pdf-parse')).default
        const result = await pdfParse(buffer, {
          // Her sayfadan metin çek
          pagerender: function(pageData) {
            return pageData.getTextContent().then(function(textContent) {
              let text = ''
              let lastY = null
              for (const item of textContent.items) {
                if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                  text += '\n'
                }
                text += item.str + ' '
                lastY = item.transform[5]
              }
              return text
            })
          }
        })
        text = result.text
      } catch (pdfParseError) {
        // pdf-parse başarısız olursa pdf2json ile dene
        try {
          const PDFParser = (await import('pdf2json')).default
          text = await new Promise((resolve, reject) => {
            const pdfParser = new PDFParser()
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
              const pages = pdfData.Pages || []
              let fullText = ''
              pages.forEach(page => {
                const texts = page.Texts || []
                texts.forEach(t => {
                  const textItems = t.R || []
                  textItems.forEach(r => {
                    try {
                      fullText += decodeURIComponent(r.T) + ' '
                    } catch {
                      fullText += r.T + ' '
                    }
                  })
                })
                fullText += '\n'
              })
              resolve(fullText)
            })
            pdfParser.on('pdfParser_dataError', reject)
            pdfParser.parseBuffer(buffer)
          })
        } catch (fallbackError) {
          return NextResponse.json(
            { error: 'PDF okunamadı. Lütfen metin tabanlı bir PDF veya Word dosyası yükleyin.' },
            { status: 400 }
          )
        }
      }
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json(
        { error: 'Sadece PDF veya Word dosyası yükleyebilirsiniz (.pdf, .doc, .docx)' },
        { status: 400 }
      )
    }

    // Metni temizle
    text = text
      .replace(/\s+/g, ' ')           // Çoklu boşlukları tek yap
      .replace(/(\r\n|\r|\n)+/g, '\n') // Satır sonlarını normalize et
      .replace(/[^\x20-\x7E\u00C0-\u024F\u0400-\u04FF\n]/g, ' ') // Bozuk karakterleri temizle
      .trim()

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'PDF\'den metin okunamadı. Bu PDF taranmış görüntü içeriyor olabilir. Lütfen metin tabanlı bir PDF veya Word dosyası yükleyin.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, text })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
