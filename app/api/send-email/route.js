import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = 'palaorhan30@gmail.com'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Yetkisiz' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user || user.email !== ADMIN_EMAIL) return Response.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json()
    const { subject, message, target } = body

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    
    let emails = []
    if (target === 'custom' && body.customEmail) {
      emails = [body.customEmail]
    } else if (target === 'confirmed') {
      emails = users.filter(u => u.email_confirmed_at).map(u => u.email).filter(Boolean)
    } else {
      emails = users.map(u => u.email).filter(Boolean)
    }

    let successCount = 0
    let errorCount = 0

    for (const email of emails) {
      try {
        await resend.emails.send({
          from: 'Resumind <destek@resumind.com.tr>',
          to: email,
          subject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px;background:#f9f9f9">
              <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e0e0e0">
                <h1 style="color:#1a1a2e;font-size:24px;margin:0 0 8px">Resumind</h1>
                <hr style="border:none;border-top:2px solid #2563EB;margin:16px 0">
                <div style="color:#333;font-size:15px;line-height:1.7">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0">
                <p style="color:#999;font-size:12px;text-align:center">Bu email Resumind tarafından gönderilmiştir. <a href="https://resumind.com.tr">resumind.com.tr</a></p>
              </div>
            </div>
          `
        })
        successCount++
      } catch (e) {
        errorCount++
      }
    }

    return Response.json({ success: true, successCount, errorCount, total: emails.length })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}