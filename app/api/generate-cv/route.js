import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { cvContent, template, isRawText } = await request.json()

    const prompt = isRawText
      ? `Sen profesyonel bir CV uzmanısın. Kullanıcı aşağıdaki ham bilgileri verdi. Bu bilgileri kullanarak profesyonel ve etkileyici bir CV oluştur. Eksik bilgileri mevcut bilgilerin ruhuna uygun şekilde tamamla. Sadece JSON formatında döndür, başka hiçbir şey yazma.

Kullanıcının verdiği bilgiler:
${cvContent}

Şu JSON formatında döndür:
{
  "name": "Ad Soyad",
  "email": "email@example.com",
  "phone": "telefon",
  "location": "şehir",
  "summary": "profesyonel özet (3-4 cümle)",
  "experience": [{"company": "şirket", "position": "pozisyon", "duration": "süre", "description": "açıklama"}],
  "education": [{"school": "okul", "degree": "bölüm/derece", "year": "yıl"}],
  "skills": ["beceri1", "beceri2", "beceri3"]
}`
      : `Sen profesyonel bir CV uzmanısın. Aşağıdaki metin bir PDF'den otomatik çıkarılmıştır — sıralama bozuk, bazı kelimeler dağınık veya tekrar eden olabilir. Bu ham metinden CV bilgilerini akıllıca ayıkla ve ${template} şablonuna uygun, profesyonel bir CV oluştur.

ÖNEMLİ KURALLAR:
- Metinde karışık bile olsa isim, email, telefon, şehir, deneyim, eğitim ve becerileri doğru tespit et
- Tekrar eden veya anlamsız kısımları yoksay
- Eksik alanları boş string olarak bırak ("")
- Sadece JSON döndür, başka hiçbir şey yazma

Ham CV metni:
${cvContent}

JSON formatı:
{
  "name": "Ad Soyad",
  "email": "email",
  "phone": "telefon",
  "location": "şehir",
  "summary": "profesyonel özet",
  "experience": [{"company": "şirket", "position": "pozisyon", "duration": "süre", "description": "açıklama"}],
  "education": [{"school": "okul", "degree": "bölüm", "year": "yıl"}],
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
    } catch (e) {
      console.error('Aktivite log hatası:', e.message)
    }

    return Response.json({ success: true, cvData })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
