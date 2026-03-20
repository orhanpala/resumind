'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    if (!password || !confirmPassword) return
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) setError('Bir hata oluştu, lütfen tekrar deneyin.')
    else setSuccess(true)

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-white text-2xl font-bold mb-2">Şifre Güncellendi!</h2>
          <p className="text-gray-400 mb-6">Yeni şifrenizle giriş yapabilirsiniz.</p>
          <button
            onClick={() => router.push('/login')}
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
        <h1 className="text-white text-2xl font-bold mb-2">Yeni Şifre Belirle</h1>
        <p className="text-gray-400 mb-8">Yeni şifrenizi girin.</p>

        <input
          type="password"
          placeholder="Yeni şifre (en az 6 karakter)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Yeni şifre tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <button
          onClick={handleUpdate}
          disabled={loading || !password || !confirmPassword}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
        >
          {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
        </button>
      </div>
    </div>
  )
}