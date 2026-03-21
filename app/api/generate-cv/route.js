import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { cvContent, template, isRawText } = await request.json()

    const prompt = isRawText
      ? `Sen profesyonel bir CV yazarısın. Kullanıcı aşağıdaki ham bilgileri verdi. Bu bilgileri kullanarak ${template} şablonuna uygun, profesyonel ve etkileyici bir CV oluştur. Eğer bilgiler eksikse, mevcut bilgilerin ruhuna uygun şekilde dolgun ve profesyonel bir dil kullan. Sadece JSON formatında döndür, başka hiçbir şey yazma.
      
Kullanıcının verdiği bilgiler:
${cvContent}

Şu JSON formatında döndür:
{
  "name": "Ad Soyad",
  "email": "email",
  "phone": "telefon",
  "location": "şehir",
  "summary": "profesyonel özet",
  "experience": [{"company": "şirket", "position": "pozisyon", "duration": "süre", "description": "açıklama"}],
  "education": [{"school": "okul", "degree": "derece", "year": "yıl"}],
  "skills": ["beceri1", "beceri2"]
}`
      : `Sen profesyonel bir CV yazarısın. Kullanıcının mevcut CV içeriğini ${template} şablonuna uygun şekilde yeniden düzenle ve geliştir. Sadece JSON formatında döndür, başka hiçbir şey yazma.

Mevcut CV içeriği:
${cvContent}

Şu JSON formatında döndür:
{
  "name": "Ad Soyad",
  "email": "email",
  "phone": "telefon",
  "location": "şehir",
  "summary": "profesyonel özet",
  "experience": [{"company": "şirket", "position": "pozisyon", "duration": "süre", "description": "açıklama"}],
  "education": [{"school": "okul", "degree": "derece", "year": "yıl"}],
  "skills": ["beceri1", "beceri2"]
}`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    })

    const responseText = completion.choices[0].message.content
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const cvData = JSON.parse(jsonMatch[0])

    // Aktivite logu kaydet
    try {
      const authHeader = request.headers.get('authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabaseAdmin.auth.getUser(token)
        if (user) {
          await supabaseAdmin.from('activity_logs').insert({
            user_id: user.id,
            action: 'CV Oluşturuldu',
            details: `${template} şablonu kullanıldı`
          })
        }
      }
    } catch (e) {}

    return Response.json({ success: true, cvData })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}