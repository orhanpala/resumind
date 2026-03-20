'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleReset = async () => {
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://resumind.com.tr/update-password'
    })

    if (error) setError('Bir hata oluştu, lütfen tekrar deneyin.')
    else setSuccess(true)

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-white text-2xl font-bold mb-2">Email Gönderildi!</h2>
          <p className="text-gray-400 mb-6">
            <span className="text-white font-medium">{email}</span> adresine şifre sıfırlama linki gönderdik.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-2">Şifremi Unuttum</h1>
        <p className="text-gray-400 mb-8">Email adresinizi girin, şifre sıfırlama linki gönderelim.</p>

        <input
          type="email"
          placeholder="Email adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleReset}
          disabled={loading || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mb-4"
        >
          {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
        </button>

        <button
          onClick={() => router.push('/login')}
          className="w-full text-gray-400 hover:text-white text-sm transition-all"
        >
          ← Giriş sayfasına dön
        </button>
      </div>
    </div>
  )
}