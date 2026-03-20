'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUser(user)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-white text-2xl font-bold">Resumind</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-sm">{user.email}</p>
            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        <div className="text-center py-12">
          <h2 className="text-white text-4xl font-bold mb-4">CV şablonunu seç</h2>
          <p className="text-gray-400 text-lg mb-12">Beğendiğin şablonu seç, yapay zeka CV'ni oluştursun</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Modern', 'Klasik', 'Minimal'].map((template) => (
              <div
                key={template}
                onClick={() => router.push(`/create-cv?template=${template}`)}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-8 cursor-pointer transition-all group"
              >
                <div className="w-full h-48 bg-gray-800 rounded-xl mb-4 flex items-center justify-center group-hover:bg-gray-700 transition-all">
                  <p className="text-gray-500 text-sm">Önizleme</p>
                </div>
                <h3 className="text-white font-medium text-lg">{template}</h3>
                <p className="text-gray-400 text-sm mt-1">Profesyonel {template.toLowerCase()} tasarım</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}