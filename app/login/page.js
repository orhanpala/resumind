'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Zaten giriş yapmışsa dashboard'a at
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
  }, [])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) setError(error.message)
      else setSuccess(true)
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message === 'Email not confirmed') {
          setError('Email adresinizi doğrulamadınız. Lütfen emailinizi kontrol edin.')
        } else {
          setError('Email veya şifre hatalı.')
        }
      } else if (data.session) {
        router.replace('/dashboard')
      }
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-white text-2xl font-bold mb-2">Emailinizi Kontrol Edin</h2>
          <p className="text-gray-400 mb-6">
            <span className="text-white font-medium">{email}</span> adresine doğrulama linki gönderdik.
          </p>
          <button
            onClick={() => { setSuccess(false); setIsRegister(false) }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
        <h1 onClick={() => router.push('/')} className="text-white text-3xl font-bold mb-2 cursor-pointer hover:text-blue-400 transition-all">Resumind</h1>
        <p className="text-gray-400 mb-8">Yapay zeka ile CV oluştur</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-3 mb-6"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google ile Giriş Yap
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-800"></div>
          <p className="text-gray-500 text-sm">veya</p>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        <div className="flex mb-6 bg-gray-800 rounded-xl p-1">
          <button
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isRegister ? 'bg-white text-gray-900' : 'text-gray-400'}`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isRegister ? 'bg-white text-gray-900' : 'text-gray-400'}`}
          >
            Kayıt Ol
          </button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {!isRegister && (
          <div className="text-right mb-4">
            <button
              onClick={() => router.push('/reset-password')}
              className="text-blue-400 hover:text-blue-300 text-sm transition-all"
            >
              Şifremi unuttum
            </button>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
        >
          {loading ? 'Yükleniyor...' : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
      </div>
    </div>
  )
}
