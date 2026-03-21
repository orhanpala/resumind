'use client'
import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
      <div className="text-center px-6">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-white text-4xl font-bold mb-4">Ücretlendirme</h1>
        <div className="bg-blue-600 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-2xl px-8 py-6 mb-8 max-w-lg mx-auto">
          <p className="text-blue-400 text-xl font-semibold">Resumind belli bir süreliğine ücretsiz kalacak! 🚀</p>
          <p className="text-gray-400 text-sm mt-2">Tüm özelliklerden ücretsiz yararlanabilirsiniz.</p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-all"
        >
          Hemen Başla — Ücretsiz
        </button>
      </div>
    </div>
  )
}