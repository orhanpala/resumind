import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { cvContent, template, isRawText, improveContent = true } = await request.json()

    let prompt

    if (isRawText) {
      prompt = `Sen profesyonel bir CV uzmanısın. Kullanıcı aşağıdaki ham bilgileri verdi. Profesyonel ve etkileyici bir CV oluştur. Eksik bilgileri mevcut bilgilerin ruhuna uygun şekilde tamamla. Sadece JSON döndür.

Bilgiler:
${cvContent}

JSON:
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

    } else if (improveContent) {
      prompt = `Sen profesyonel bir CV uzmanısın. Aşağıdaki metin bir CV dosyasından otomatik çıkarılmıştır. Metindeki bilgileri ayıkla, ${template} şablonuna uygun şekilde yeniden yaz ve profesyonel hale getir.

ÖNEMLİ:
- Metin dağınık veya tekrar içerebilir, doğru bilgileri ayıkla
- Özeti 3-4 güçlü, etkileyici cümleyle yaz
- Deneyim açıklamalarını eylem fiilleriyle geliştir
- Eksik alanları boş string ("") olarak bırak
- SADECE JSON döndür

Ham metin:
${cvContent}

JSON:
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

    } else {
      prompt = `Sen bir CV veri çıkarma asistanısın. Aşağıdaki metin bir CV dosyasından çıkarılmıştır. Metindeki bilgileri OLDUĞU GİBİ çıkar, hiçbir şeyi değiştirme veya geliştirme.

ÖNEMLİ:
- Orijinal ifadeleri koru, ekleme yapma
- Bulamadığın alanları boş string ("") olarak bırak
- SADECE JSON döndür

Ham metin:
${cvContent}

JSON:
{
  "name": "Ad Soyad",
  "email": "email",
  "phone": "telefon",
  "location": "şehir",
  "summary": "özet (orijinal haliyle)",
  "experience": [{"company": "şirket", "position": "pozisyon", "duration": "süre", "description": "açıklama (orijinal)"}],
  "education": [{"school": "okul", "degree": "bölüm", "year": "yıl"}],
  "skills": ["beceri1", "beceri2"]
}`
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: improveContent ? 0.7 : 0.2,
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
            details: `${template} şablonu kullanıldı${improveContent ? '' : ' (ham)'}`
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
