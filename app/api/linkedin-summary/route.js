import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request) {
  try {
    const { cvData } = await request.json()

    const prompt = `Sen bir LinkedIn uzmanısın. Aşağıdaki CV bilgilerini kullanarak profesyonel ve etkileyici bir LinkedIn profil özeti yaz. Özet 3-4 paragraf olsun, birinci şahıs kullan, Türkçe yaz. Sadece özet metnini döndür, başka hiçbir şey yazma.

CV Bilgileri:
Ad: ${cvData.name}
Pozisyon: ${cvData.experience?.[0]?.position || ''}
Şirket: ${cvData.experience?.[0]?.company || ''}
Özet: ${cvData.summary || ''}
Beceriler: ${cvData.skills?.join(', ') || ''}
Eğitim: ${cvData.education?.[0]?.school || ''} - ${cvData.education?.[0]?.degree || ''}

LinkedIn profil özeti:`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500,
    })

    const summary = completion.choices[0].message.content

    return Response.json({ success: true, summary })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}