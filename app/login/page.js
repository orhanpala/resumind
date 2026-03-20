'use client'
import { useState } from 'react'
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

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://resumind.com.tr/dashboard'
        }
      })
      if (error) setError(error.message)
      else setSuccess(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message === 'Email not confirmed') {
          setError('Email adresinizi doğrulamadınız. Lütfen emailinizi kontrol edin.')
        } else {
          setError('Email veya şifre hatalı.')
        }
      }
      else router.push('/dashboard')
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
            <span className="text-white font-medium">{email}</span> adresine doğrulama linki gönderdik. Linke tıklayarak hesabınızı aktif edin.
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
        <h1 className="text-white text-3xl font-bold mb-2">Resumind</h1>
        <p className="text-gray-400 mb-8">Yapay zeka ile CV oluştur</p>

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
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all"
        >
          {loading ? 'Yükleniyor...' : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
        </button>
      </div>
    </div>
  )
}