'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'palaorhan30@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [cvs, setCvs] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }
      setUser(user)

      const { data: cvsData } = await supabase
        .from('cvs')
        .select('*')
        .order('created_at', { ascending: false })
      if (cvsData) setCvs(cvsData)

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin', {
        headers: { authorization: `Bearer ${session.access_token}` }
      })
      const data = await res.json()
      if (data.success) setUsers(data.users)

      setLoading(false)
    }
    init()
  }, [])

  const handleDeleteCV = async (id) => {
    await supabase.from('cvs').delete().eq('id', id)
    setCvs(cvs.filter(cv => cv.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Yükleniyor...</p>
    </div>
  )

  const templateStats = cvs.reduce((acc, cv) => {
    acc[cv.template] = (acc[cv.template] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Admin Paneli</h1>
            <p className="text-gray-500 text-sm mt-1">Resumind yönetim merkezi</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl"
          >
            ← Dashboard
          </button>
        </div>

        <div className="flex gap-2 mb-8">
          {['stats', 'users', 'cvs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {tab === 'stats' ? '📊 İstatistikler' : tab === 'users' ? '👥 Kullanıcılar' : '📄 CV\'ler'}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Toplam Kullanıcı</p>
                <p className="text-white text-4xl font-bold">{users.length}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Toplam CV</p>
                <p className="text-white text-4xl font-bold">{cvs.length}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Bu Ay CV</p>
                <p className="text-white text-4xl font-bold">
                  {cvs.filter(cv => new Date(cv.created_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-1">Bugün CV</p>
                <p className="text-white text-4xl font-bold">
                  {cvs.filter(cv => new Date(cv.created_at).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Şablon Kullanım İstatistikleri</h3>
              <div className="space-y-3">
                {Object.entries(templateStats).sort((a, b) => b[1] - a[1]).map(([template, count]) => (
                  <div key={template} className="flex items-center gap-3">
                    <p className="text-gray-300 text-sm w-24">{template}</p>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(count / cvs.length) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm w-8 text-right">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Toplam {users.length} kullanıcı</p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Email</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Kayıt Tarihi</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Son Giriş</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800 transition-all">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{u.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">{new Date(u.created_at).toLocaleDateString('tr-TR')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('tr-TR') : '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.email_confirmed_at ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-yellow-600 bg-opacity-20 text-yellow-400'}`}>
                          {u.email_confirmed_at ? 'Doğrulandı' : 'Bekliyor'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cvs' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Toplam {cvs.length} CV</p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm px-6 py-4">İsim</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Şablon</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Tarih</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {cvs.map((cv) => (
                    <tr key={cv.id} className="border-b border-gray-800 hover:bg-gray-800 transition-all">
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{cv.cv_data.name}</p>
                        <p className="text-gray-500 text-xs">{cv.cv_data.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-600 bg-opacity-20 text-blue-400 text-xs px-2 py-1 rounded-full">{cv.template}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">{new Date(cv.created_at).toLocaleDateString('tr-TR')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteCV(cv.id)}
                          className="text-red-400 hover:text-red-300 text-sm transition-all"
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}