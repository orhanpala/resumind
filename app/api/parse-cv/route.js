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
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      return NextResponse.json({ error: 'Sadece PDF veya Word dosyası yükleyebilirsiniz' }, { status: 400 })
    }

    return NextResponse.json({ success: true, text })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}