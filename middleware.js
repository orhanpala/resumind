import { NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/create-cv', '/profile', '/premium-templates', '/admin']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const token =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/create-cv/:path*',
    '/profile/:path*',
    '/premium-templates/:path*',
    '/admin/:path*',
  ],
}
