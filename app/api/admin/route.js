import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError) return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    if (!user) return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    if (user.email !== ADMIN_EMAIL) return Response.json({ error: 'Yetkisiz erişim' }, { status: 401 })

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) return Response.json({ error: 'Bir hata oluştu' }, { status: 500 })

    return Response.json({ success: true, users })
  } catch (error) {
    return Response.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
