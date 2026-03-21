import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request) {
  try {
    const { cvData, referenceInfo } = await request.json()

    const prompt = `Sen profesyonel bir referans mektubu yazarısın. Aşağıdaki bilgileri kullanarak resmi ve etkileyici bir referans mektubu yaz. Türkçe yaz. Sadece mektubu döndür, başka hiçbir şey yazma.

Çalışan Bilgileri:
Ad: ${cvData.name}
Pozisyon: ${cvData.experience?.[0]?.position || ''}
Şirket: ${cvData.experience?.[0]?.company || ''}
Beceriler: ${cvData.skills?.join(', ') || ''}
Özet: ${cvData.summary || ''}

Referans Veren Bilgileri:
Ad: ${referenceInfo.refName}
Pozisyon: ${referenceInfo.refPosition}
Şirket: ${referenceInfo.refCompany}
İlişki: ${referenceInfo.relationship}

Profesyonel bir referans mektubu yaz.`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 800,
    })

    const letter = completion.choices[0].message.content

    return Response.json({ success: true, letter })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}