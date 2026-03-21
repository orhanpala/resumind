'use client'
import { useEffect, useState } from 'react'

const ADMIN_EMAIL = 'palaorhan30@gmail.com'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const templates = [
  {
    id: 'Modern', name: 'Modern', desc: 'Mavi başlık, temiz çizgiler',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-blue-600 p-2">
          <div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-blue-300 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-blue-600 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-1 bg-blue-600 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Klasik', name: 'Klasik', desc: 'Siyah başlık, resmi görünüm',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-900 p-2">
          <div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-gray-400 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-gray-800 rounded w-1/3 mb-1 mt-1"></div>
          <div className="h-px bg-gray-300 w-full mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-1 bg-gray-800 rounded w-1/3 mb-1"></div>
          <div className="h-px bg-gray-300 w-full mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Minimal', name: 'Minimal', desc: 'Sade, beyaz ağırlıklı',
    preview: (
      <div className="w-full h-full bg-white rounded-lg p-2">
        <div className="h-3 bg-gray-800 rounded w-2/3 mb-1"></div>
        <div className="h-1 bg-gray-300 rounded w-1/2 mb-3"></div>
        <div className="h-1 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-1 bg-gray-100 rounded w-full mb-1"></div>
        <div className="h-1 bg-gray-100 rounded w-5/6 mb-3"></div>
        <div className="h-1 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-1 bg-gray-100 rounded w-full mb-1"></div>
        <div className="h-1 bg-gray-100 rounded w-4/6"></div>
      </div>
    )
  },
  {
    id: 'Kreatif', name: 'Kreatif', desc: 'Mor tonlar, yaratıcı tasarım',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2">
          <div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-purple-200 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-purple-500 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="flex gap-1 mb-2">
            <div className="h-3 bg-purple-100 rounded-full w-8"></div>
            <div className="h-3 bg-purple-100 rounded-full w-10"></div>
            <div className="h-3 bg-purple-100 rounded-full w-6"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'Teknoloji', name: 'Teknoloji', desc: 'Koyu tema, yazılımcı stili',
    preview: (
      <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        <div className="border-b border-green-500 p-2">
          <div className="h-2 bg-green-400 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-green-800 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-green-500 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-700 rounded w-5/6 mb-2"></div>
          <div className="flex gap-1">
            <div className="h-3 bg-green-900 border border-green-700 rounded w-8"></div>
            <div className="h-3 bg-green-900 border border-green-700 rounded w-10"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'Elegant', name: 'Elegant', desc: 'Gold detaylar, şık tasarım',
    preview: (
      <div className="w-full h-full bg-amber-50 rounded-lg overflow-hidden">
        <div className="border-b-2 border-amber-600 p-2">
          <div className="h-2 bg-amber-800 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-amber-400 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-amber-600 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-amber-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-amber-200 rounded w-5/6 mb-2"></div>
          <div className="h-1 bg-amber-600 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-amber-200 rounded w-full mb-1"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Kompakt', name: 'Kompakt', desc: 'İki sütunlu, bilgi yoğun',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden flex">
        <div className="bg-slate-700 w-1/3 p-1">
          <div className="w-6 h-6 bg-slate-400 rounded-full mx-auto mb-1"></div>
          <div className="h-1 bg-slate-400 rounded w-full mb-1"></div>
          <div className="h-1 bg-slate-500 rounded w-4/5 mb-2"></div>
          <div className="h-1 bg-slate-400 rounded w-full mb-1"></div>
          <div className="h-1 bg-slate-500 rounded w-3/4"></div>
        </div>
        <div className="flex-1 p-1">
          <div className="h-1 bg-slate-700 rounded w-3/4 mb-1"></div>
          <div className="h-px bg-slate-200 w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-1 bg-slate-700 rounded w-3/4 mb-1"></div>
          <div className="h-px bg-slate-200 w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Akademik', name: 'Akademik', desc: 'Resmi, akademik format',
    preview: (
      <div className="w-full h-full bg-white rounded-lg p-2">
        <div className="text-center mb-2">
          <div className="h-2 bg-gray-800 rounded w-1/2 mx-auto mb-1"></div>
          <div className="h-1 bg-gray-400 rounded w-2/3 mx-auto mb-1"></div>
          <div className="h-px bg-gray-800 w-full"></div>
        </div>
        <div className="h-1 bg-gray-700 rounded w-1/3 mb-1"></div>
        <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div>
        <div className="h-1 bg-gray-700 rounded w-1/3 mb-1"></div>
        <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
      </div>
    )
  }
  ,{
    id: 'Timeline', name: 'Timeline', desc: 'Kronolojik zaman çizgisi',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-900 p-2 flex items-center gap-2">
          <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
          <div className="h-2 bg-white bg-opacity-80 rounded w-2/3"></div>
        </div>
        <div className="p-2">
          <div className="relative pl-4">
            <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-orange-200"></div>
            <div className="h-1 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div>
            <div className="h-1 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'Sidebar', name: 'Sidebar', desc: 'Koyu panel, modern',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden flex">
        <div className="bg-slate-800 w-2/5 p-1">
          <div className="w-5 h-5 bg-teal-500 rounded-full mx-auto mb-1"></div>
          <div className="h-1 bg-slate-400 rounded w-full mb-1"></div>
          <div className="h-1 bg-teal-500 rounded w-3/4 mb-2"></div>
          <div className="h-1 bg-slate-600 rounded w-full mb-1"></div>
          <div className="h-1 bg-slate-600 rounded w-4/5"></div>
        </div>
        <div className="flex-1 p-1">
          <div className="h-1 bg-teal-500 rounded w-1/2 mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-1 bg-teal-500 rounded w-1/2 mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Bant', name: 'Bant', desc: 'Renkli üst şerit',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-400"></div>
        <div className="p-2 flex items-center gap-2 border-b border-gray-100">
          <div className="w-5 h-5 bg-rose-100 rounded-full border border-rose-200"></div>
          <div>
            <div className="h-2 bg-gray-800 rounded w-20 mb-0.5"></div>
            <div className="h-1 bg-rose-400 rounded w-12"></div>
          </div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-rose-400 rounded w-1/4 mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Kartlı', name: 'Kartlı', desc: 'Kart bazlı düzen',
    preview: (
      <div className="w-full h-full bg-gray-100 rounded-lg p-1">
        <div className="bg-white rounded p-1 mb-1 flex items-center gap-1">
          <div className="w-5 h-5 bg-indigo-600 rounded"></div>
          <div>
            <div className="h-1.5 bg-gray-800 rounded w-16 mb-0.5"></div>
            <div className="h-1 bg-indigo-400 rounded w-10"></div>
          </div>
        </div>
        <div className="bg-white rounded p-1 mb-1">
          <div className="h-1 bg-indigo-400 rounded w-1/3 mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-0.5"></div>
          <div className="h-1 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-white rounded p-1">
            <div className="h-1 bg-indigo-400 rounded w-2/3 mb-1"></div>
            <div className="h-1 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="bg-white rounded p-1">
            <div className="h-1 bg-indigo-400 rounded w-2/3 mb-1"></div>
            <div className="h-1 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [pastCVs, setPastCVs] = useState([])
  const [activeTab, setActiveTab] = useState('templates')
  const router = useRouter()

useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteCV = async (id) => {
    await supabase.from('cvs').delete().eq('id', id)
    setPastCVs(pastCVs.filter(cv => cv.id !== id))
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Yükleniyor...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-6 py-8">

      <div className="flex items-center gap-4">
  <p className="text-gray-400 text-sm">{user.email}</p>
  {user.email === ADMIN_EMAIL && (
    <button
      onClick={() => router.push('/admin')}
      className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
    >
      ⚙️ Admin
    </button>
  )}
  <button
    onClick={handleLogout}
    className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
  >
    Çıkış Yap
  </button>
</div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Şablonlar
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Geçmiş CV'ler {pastCVs.length > 0 && <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{pastCVs.length}</span>}
          </button>
        </div>

        {activeTab === 'templates' && (
          <div>
            <div className="mb-8">
              <h2 className="text-white text-3xl font-bold mb-2">CV şablonunu seç</h2>
              <p className="text-gray-400">Beğendiğin şablonu seç, yapay zeka CV'ni oluştursun</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => router.push(`/create-cv?template=${template.id}`)}
                  className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-4 cursor-pointer transition-all group"
                >
                  <div className="w-full h-36 bg-gray-800 rounded-xl mb-3 overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                    {template.preview}
                  </div>
                  <h3 className="text-white font-medium">{template.name}</h3>
                  <p className="text-gray-500 text-xs mt-1">{template.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="mb-8">
              <h2 className="text-white text-3xl font-bold mb-2">Geçmiş CV'ler</h2>
              <p className="text-gray-400">Daha önce oluşturduğun CV'ler</p>
            </div>
            {pastCVs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-4">Henüz CV oluşturmadın</p>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                >
                  İlk CV'ni Oluştur
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastCVs.map((cv) => (
                  <div key={cv.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{cv.cv_data.name}</h3>
                        <p className="text-blue-400 text-sm">{cv.template} şablonu</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCV(cv.id)}
                        className="text-gray-600 hover:text-red-400 text-sm transition-all"
                      >
                        🗑
                      </button>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{cv.cv_data.summary}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600 text-xs">
                        {new Date(cv.created_at).toLocaleDateString('tr-TR')}
                      </p>
                      <button
                        onClick={() => router.push(`/create-cv?template=${cv.template}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
                      >
                        Tekrar Oluştur
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}