import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
})

export async function POST(request) {
  try {
    const { cvData } = await request.json()

    const prompt = `Sen profesyonel bir CV uzmanısın. Aşağıdaki CV'yi değerlendir ve 100 üzerinden puan ver. 

CV Bilgileri:
${JSON.stringify(cvData, null, 2)}

Şu kriterlere göre değerlendir:
1. İçerik zenginliği (0-25 puan)
2. Profesyonellik (0-25 puan)
3. Beceri çeşitliliği (0-25 puan)
4. Deneyim yeterliliği (0-25 puan)

Sadece JSON formatında döndür, başka hiçbir şey yazma:
{
  "totalScore": 85,
  "contentScore": 20,
  "professionalScore": 22,
  "skillsScore": 18,
  "experienceScore": 25,
  "strengths": ["güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
  "improvements": ["geliştirilecek alan 1", "geliştirilecek alan 2", "geliştirilecek alan 3"],
  "summary": "Genel değerlendirme özeti buraya"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1000,
    })

    const responseText = completion.choices[0].message.content
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const scoreData = JSON.parse(jsonMatch[0])

    return Response.json({ success: true, scoreData })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}