import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const body = await request.json()
    
    const record = body.record
    const oldRecord = body.old_record

    // Sadece email_confirmed_at değişince tetiklensin
    if (!record.email_confirmed_at || oldRecord.email_confirmed_at) {
      return Response.json({ success: true, skipped: true })
    }

    const email = record.email

    await resend.emails.send({
      from: 'Resumind <destek@resumind.com.tr>',
      to: email,
      subject: '🎉 Resumind\'e Hoş Geldiniz!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px;background:#f9f9f9">
          <div style="background:white;border-radius:16px;padding:40px;border:1px solid #e0e0e0">
            
            <div style="text-align:center;margin-bottom:32px">
              <h1 style="color:#2563EB;font-size:28px;margin:0">Resumind</h1>
              <p style="color:#666;font-size:14px;margin-top:4px">Yapay Zeka ile CV Oluştur</p>
            </div>

            <h2 style="color:#1a1a2e;font-size:22px;margin:0 0 16px">Hoş Geldiniz! 🎉</h2>
            
            <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 16px">
              Merhaba, Resumind ailesine katıldığınız için çok mutluyuz!
            </p>

            <p style="color:#444;font-size:15px;line-height:1.7;margin:0 0 24px">
              Email adresinizi doğruladınız. Artık yapay zeka destekli CV oluşturucumuzu kullanabilirsiniz!
            </p>

            <div style="background:#f0f7ff;border-radius:12px;padding:20px;margin-bottom:24px">
              <p style="color:#1a1a2e;font-size:14px;font-weight:bold;margin:0 0 12px">Neler yapabilirsiniz?</p>
              <ul style="color:#444;font-size:14px;line-height:1.8;margin:0;padding-left:20px">
                <li>12+ profesyonel CV şablonu arasından seçin</li>
                <li>PDF ve Word dosyalarınızı yükleyin</li>
                <li>CV'nizi İngilizceye çevirin</li>
                <li>LinkedIn profil özeti oluşturun</li>
                <li>CV puanlama sistemi ile CV'nizi değerlendirin</li>
              </ul>
            </div>

            <div style="text-align:center;margin-bottom:32px">
              <a href="https://resumind.com.tr/dashboard" style="background:#2563EB;color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block">
                🚀 Hemen CV Oluştur
              </a>
            </div>

            <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
            
            <p style="color:#999;font-size:12px;text-align:center;margin:0">
              Bu email Resumind tarafından gönderilmiştir.<br>
              <a href="https://resumind.com.tr" style="color:#2563EB">resumind.com.tr</a>
            </p>
          </div>
        </div>
      `
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}