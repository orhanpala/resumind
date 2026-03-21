'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-8xl font-bold mb-4" style={{background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          404
        </div>
        <h1 className="text-white text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all"
          >
            Ana Sayfaya Dön
          </button>
          <button
            onClick={() => router.back()}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-all"
          >
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  )
}