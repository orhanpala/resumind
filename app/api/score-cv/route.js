import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const { cvData } = await request.json()

    // photo base64 alanı çok büyük — skorlama için gerekli değil, çıkar
    const { photo, ...dataWithoutPhoto } = cvData || {}

    // Her alanı kısalt — token limitini aşmamak için
    const slim = {
      name:       (dataWithoutPhoto.name        || '').slice(0, 80),
      email:      (dataWithoutPhoto.email       || '').slice(0, 80),
      phone:      (dataWithoutPhoto.phone       || '').slice(0, 30),
      location:   (dataWithoutPhoto.location    || '').slice(0, 60),
      summary:    (dataWithoutPhoto.summary     || '').slice(0, 400),
      skills:      dataWithoutPhoto.skills?.slice(0, 20) || [],
      experience: (dataWithoutPhoto.experience  || []).slice(0, 5).map(e => ({
        company:     (e.company    || '').slice(0, 60),
        position:    (e.position   || '').slice(0, 60),
        duration:    (e.duration   || '').slice(0, 30),
        description: (e.description|| '').slice(0, 200),
      })),
      education: (dataWithoutPhoto.education || []).slice(0, 3).map(e => ({
        school: (e.school || '').slice(0, 60),
        degree: (e.degree || '').slice(0, 60),
        year:   (e.year   || '').slice(0, 20),
      })),
    }

    const prompt = `Sen profesyonel bir CV uzmanısın. Aşağıdaki CV'yi değerlendir ve 100 üzerinden puan ver.

CV:
Ad: ${slim.name}
Özet: ${slim.summary}
Beceriler: ${slim.skills.join(', ')}
Deneyimler: ${slim.experience.map(e=>`${e.position} @ ${e.company} (${e.duration}): ${e.description}`).join(' | ')}
Eğitim: ${slim.education.map(e=>`${e.school} - ${e.degree} ${e.year}`).join(' | ')}

Şu kriterlere göre değerlendir:
1. İçerik zenginliği (0-25)
2. Profesyonellik (0-25)
3. Beceri çeşitliliği (0-25)
4. Deneyim yeterliliği (0-25)

SADECE JSON döndür:
{
  "totalScore": 85,
  "contentScore": 20,
  "professionalScore": 22,
  "skillsScore": 18,
  "experienceScore": 25,
  "strengths": ["güçlü yön 1", "güçlü yön 2", "güçlü yön 3"],
  "improvements": ["öneri 1", "öneri 2", "öneri 3"],
  "summary": "Genel değerlendirme"
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 600,
    })

    const responseText = completion.choices[0].message.content
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const scoreData = JSON.parse(jsonMatch[0])

    return Response.json({ success: true, scoreData })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
