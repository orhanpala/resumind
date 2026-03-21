import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request) {
  try {
    const { cvData, targetLanguage } = await request.json()

    const prompt = `Sen profesyonel bir çevirmensin. Aşağıdaki CV verilerini ${targetLanguage} diline çevir. Sadece metin içeriklerini çevir, JSON yapısını koru. Sadece JSON formatında döndür, başka hiçbir şey yazma.

CV Verileri:
${JSON.stringify(cvData, null, 2)}

Aynı JSON formatında döndür, sadece metin değerlerini ${targetLanguage} diline çevir.`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000,
    })

    const responseText = completion.choices[0].message.content
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const translatedCV = JSON.parse(jsonMatch[0])

    return Response.json({ success: true, translatedCV })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}