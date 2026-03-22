import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAIL = 'palaorhan3s0@gmail.com'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Yetkisiz' }, { status: 401 })

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)

    if (!user || user.email !== ADMIN_EMAIL) {
      return Response.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

    return Response.json({ success: true, users })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}