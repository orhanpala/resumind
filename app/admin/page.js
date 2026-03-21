'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'palaorhan30@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [cvs, setCvs] = useState([])
  const [pendingPosts, setPendingPosts] = useState([])
  const [settings, setSettings] = useState({})
  const [announcements, setAnnouncements] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [loading, setLoading] = useState(true)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' })
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }
      setUser(user)

      const { data: cvsData } = await supabase.from('cvs').select('*').order('created_at', { ascending: false })
      if (cvsData) setCvs(cvsData)

      const { data: postsData } = await supabase.from('blog_posts').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      if (postsData) setPendingPosts(postsData)

      const { data: settingsData } = await supabase.from('site_settings').select('*')
      if (settingsData) {
        const s = {}
        settingsData.forEach(item => s[item.key] = item.value)
        setSettings(s)
      }

      const { data: announcementsData } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
      if (announcementsData) setAnnouncements(announcementsData)

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/admin', { headers: { authorization: `Bearer ${session.access_token}` } })
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

  const handleApproveBlog = async (id) => {
    await supabase.from('blog_posts').update({ status: 'approved' }).eq('id', id)
    setPendingPosts(pendingPosts.filter(p => p.id !== id))
  }

  const handleRejectBlog = async (id) => {
    await supabase.from('blog_posts').update({ status: 'rejected' }).eq('id', id)
    setPendingPosts(pendingPosts.filter(p => p.id !== id))
  }

  const handleUpdateSetting = async (key, value) => {
    await supabase.from('site_settings').update({ value }).eq('key', key)
    setSettings({ ...settings, [key]: value })
  }

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return
    const { data } = await supabase.from('announcements').insert(newAnnouncement).select()
    if (data) {
      setAnnouncements([data[0], ...announcements])
      setNewAnnouncement({ title: '', message: '', type: 'info' })
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  const handleToggleAnnouncement = async (id, active) => {
    await supabase.from('announcements').update({ active: !active }).eq('id', id)
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, active: !active } : a))
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ userId })
    })
    setUsers(users.filter(u => u.id !== userId))
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>

  const templateStats = cvs.reduce((acc, cv) => { acc[cv.template] = (acc[cv.template] || 0) + 1; return acc }, {})
  const dailyCvs = cvs.filter(cv => new Date(cv.created_at).toDateString() === new Date().toDateString()).length
  const weeklyCvs = cvs.filter(cv => new Date(cv.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  const monthlyCvs = cvs.filter(cv => new Date(cv.created_at).getMonth() === new Date().getMonth()).length

  const tabs = [
    { id: 'stats', label: '📊 İstatistikler' },
    { id: 'users', label: `👥 Kullanıcılar (${users.length})` },
    { id: 'cvs', label: `📄 CV'ler (${cvs.length})` },
    { id: 'blog', label: `✍️ Blog ${pendingPosts.length > 0 ? `(${pendingPosts.length})` : ''}` },
    { id: 'announcements', label: '📢 Duyurular' },
    { id: 'settings', label: '⚙️ Ayarlar' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold">Admin Paneli</h1>
            <p className="text-gray-500 text-sm mt-1">Resumind yönetim merkezi</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* İSTATİSTİKLER */}
        {activeTab === 'stats' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Toplam Kullanıcı', value: users.length, color: 'text-blue-400' },
                { label: 'Toplam CV', value: cvs.length, color: 'text-green-400' },
                { label: 'Bu Ay CV', value: monthlyCvs, color: 'text-purple-400' },
                { label: 'Bu Hafta CV', value: weeklyCvs, color: 'text-yellow-400' },
                { label: 'Bugün CV', value: dailyCvs, color: 'text-red-400' },
                { label: 'Bekleyen Blog', value: pendingPosts.length, color: 'text-orange-400' },
                { label: 'Aktif Duyuru', value: announcements.filter(a => a.active).length, color: 'text-cyan-400' },
                { label: 'Bakım Modu', value: settings.maintenance_mode === 'true' ? 'Açık' : 'Kapalı', color: settings.maintenance_mode === 'true' ? 'text-red-400' : 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Şablon Kullanım İstatistikleri</h3>
              <div className="space-y-3">
                {Object.entries(templateStats).sort((a, b) => b[1] - a[1]).map(([template, count]) => (
                  <div key={template} className="flex items-center gap-3">
                    <p className="text-gray-300 text-sm w-28">{template}</p>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(count / cvs.length) * 100}%` }}></div>
                    </div>
                    <p className="text-gray-400 text-sm w-8 text-right">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KULLANICILAR */}
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
                    <th className="text-left text-gray-400 text-sm px-6 py-4">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800 transition-all">
                      <td className="px-6 py-4"><p className="text-white font-medium text-sm">{u.email}</p></td>
                      <td className="px-6 py-4"><p className="text-gray-400 text-sm">{new Date(u.created_at).toLocaleDateString('tr-TR')}</p></td>
                      <td className="px-6 py-4"><p className="text-gray-400 text-sm">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('tr-TR') : '-'}</p></td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.email_confirmed_at ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-yellow-600 bg-opacity-20 text-yellow-400'}`}>
                          {u.email_confirmed_at ? 'Doğrulandı' : 'Bekliyor'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.email !== ADMIN_EMAIL && (
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-300 text-sm transition-all">Sil</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CV'LER */}
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
                        <p className="text-white font-medium text-sm">{cv.cv_data.name}</p>
                        <p className="text-gray-500 text-xs">{cv.cv_data.email}</p>
                      </td>
                      <td className="px-6 py-4"><span className="bg-blue-600 bg-opacity-20 text-blue-400 text-xs px-2 py-1 rounded-full">{cv.template}</span></td>
                      <td className="px-6 py-4"><p className="text-gray-400 text-sm">{new Date(cv.created_at).toLocaleDateString('tr-TR')}</p></td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteCV(cv.id)} className="text-red-400 hover:text-red-300 text-sm transition-all">Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BLOG */}
        {activeTab === 'blog' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Onay bekleyen {pendingPosts.length} yazı</p>
            {pendingPosts.length === 0 ? (
              <div className="text-center py-20"><p className="text-gray-500">Onay bekleyen blog yazısı yok</p></div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="mb-3">
                      <h3 className="text-white font-semibold text-lg">{post.title}</h3>
                      <p className="text-blue-400 text-sm">{post.category}</p>
                      <p className="text-gray-500 text-xs mt-1">{post.author_name} — {new Date(post.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">{post.content}</p>
                    <div className="flex gap-3">
                      <button onClick={() => handleApproveBlog(post.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl">✅ Onayla</button>
                      <button onClick={() => handleRejectBlog(post.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl">❌ Reddet</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DUYURULAR */}
        {activeTab === 'announcements' && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4">Yeni Duyuru Ekle</h3>
              <input type="text" placeholder="Başlık" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <textarea placeholder="Mesaj" value={newAnnouncement.message} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none" />
              <div className="flex gap-3 items-center">
                <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })} className="bg-gray-800 text-white rounded-xl px-4 py-3 outline-none text-sm">
                  <option value="info">ℹ️ Bilgi</option>
                  <option value="success">✅ Başarı</option>
                  <option value="warning">⚠️ Uyarı</option>
                  <option value="error">❌ Hata</option>
                </select>
                <button onClick={handleAddAnnouncement} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-3 rounded-xl">Ekle</button>
              </div>
            </div>
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className={`bg-gray-900 border rounded-2xl p-5 ${ann.active ? 'border-blue-800' : 'border-gray-800 opacity-60'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium">{ann.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{ann.message}</p>
                      <p className="text-gray-500 text-xs mt-2">{new Date(ann.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleAnnouncement(ann.id, ann.active)} className={`text-sm px-3 py-1 rounded-lg ${ann.active ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}>
                        {ann.active ? 'Durdur' : 'Aktif Et'}
                      </button>
                      <button onClick={() => handleDeleteAnnouncement(ann.id)} className="bg-red-600 text-white text-sm px-3 py-1 rounded-lg">Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AYARLAR */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Site Ayarları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Bakım Modu</p>
                    <p className="text-gray-400 text-sm">Açıkken kullanıcılar siteye erişemez</p>
                  </div>
                  <button
                    onClick={() => handleUpdateSetting('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')}
                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${settings.maintenance_mode === 'true' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                  >
                    {settings.maintenance_mode === 'true' ? '🔴 Açık' : '⚪ Kapalı'}
                  </button>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-white font-medium mb-2">Site Adı</p>
                  <div className="flex gap-3">
                    <input type="text" value={settings.site_name || ''} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <button onClick={() => handleUpdateSetting('site_name', settings.site_name)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">Kaydet</button>
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-white font-medium mb-2">Ücretsiz CV Limiti</p>
                  <div className="flex gap-3">
                    <input type="number" value={settings.max_free_cvs || ''} onChange={(e) => setSettings({ ...settings, max_free_cvs: e.target.value })} className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <button onClick={() => handleUpdateSetting('max_free_cvs', settings.max_free_cvs)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">Kaydet</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}