'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const ADMIN_EMAIL = 'palaorhan30@gmail.com'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [profiles, setProfiles] = useState([])
  const [cvs, setCvs] = useState([])
  const [sharedCvs, setSharedCvs] = useState([])
  const [allBlogPosts, setAllBlogPosts] = useState([])
  const [pendingPosts, setPendingPosts] = useState([])
  const [frozenUsers, setFrozenUsers] = useState([])
  const [settings, setSettings] = useState({})
  const [announcements, setAnnouncements] = useState([])
  const [templateSettings, setTemplateSettings] = useState([])
  const [visitorStats, setVisitorStats] = useState({})
  const [activityLogs, setActivityLogs] = useState([])
  const [activeTab, setActiveTab] = useState('stats')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', type: 'info' })
  const [emailForm, setEmailForm] = useState({ subject: '', message: '', target: 'all' })
  const [sendingEmail, setSendingEmail] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) { router.push('/'); return }
      setUser(user)

      const [cvsRes, postsRes, settingsRes, announcementsRes, templatesRes, logsRes, visitorRes, profilesRes, sharedRes, allPostsRes, frozenRes] = await Promise.all([
        supabase.from('cvs').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*'),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('template_settings').select('*').order('template_id'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('visitor_logs').select('page, created_at'),
        supabase.from('profiles').select('*'),
        supabase.from('cvs').select('*').eq('is_shared', true).order('created_at', { ascending: false }),
        supabase.from('blog_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('is_frozen', true),
      ])

      if (cvsRes.data) setCvs(cvsRes.data)
      if (postsRes.data) setPendingPosts(postsRes.data)
      if (settingsRes.data) { const s = {}; settingsRes.data.forEach(item => s[item.key] = item.value); setSettings(s) }
      if (announcementsRes.data) setAnnouncements(announcementsRes.data)
      if (templatesRes.data) setTemplateSettings(templatesRes.data)
      if (logsRes.data) setActivityLogs(logsRes.data)
      if (visitorRes.data) { const stats = {}; visitorRes.data.forEach(v => { stats[v.page] = (stats[v.page] || 0) + 1 }); setVisitorStats(stats) }
      if (profilesRes.data) setProfiles(profilesRes.data)
      if (sharedRes.data) setSharedCvs(sharedRes.data)
      if (allPostsRes.data) setAllBlogPosts(allPostsRes.data)
      if (frozenRes.data) setFrozenUsers(frozenRes.data)

      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session:', session?.access_token ? 'var' : 'yok')
      console.log('User email:', session?.user?.email)
      const res = await fetch('/api/admin', { headers: { authorization: `Bearer ${session?.access_token}` } })
      const adminData = await res.json()
      console.log('Admin response:', adminData)
      if (adminData.success) setUsers(adminData.users)

      const data = await res.json()
      if (data.success) setUsers(data.users)

      setLoading(false)
    }
    init()
  }, [])

  const handleDeleteCV = async (id) => {
    await supabase.from('cvs').delete().eq('id', id)
    setCvs(cvs.filter(cv => cv.id !== id))
    setSharedCvs(sharedCvs.filter(cv => cv.id !== id))
  }

  const handleToggleShareCV = async (id, isShared) => {
    await supabase.from('cvs').update({ is_shared: !isShared }).eq('id', id)
    setSharedCvs(sharedCvs.map(cv => cv.id === id ? { ...cv, is_shared: !isShared } : cv))
  }

  const handleApproveBlog = async (id) => {
    await supabase.from('blog_posts').update({ status: 'approved' }).eq('id', id)
    setPendingPosts(pendingPosts.filter(p => p.id !== id))
    setAllBlogPosts(allBlogPosts.map(p => p.id === id ? { ...p, status: 'approved' } : p))
  }

  const handleRejectBlog = async (id) => {
    await supabase.from('blog_posts').update({ status: 'rejected' }).eq('id', id)
    setPendingPosts(pendingPosts.filter(p => p.id !== id))
    setAllBlogPosts(allBlogPosts.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
  }

  const handleDeleteBlog = async (id) => {
    await supabase.from('blog_posts').delete().eq('id', id)
    setAllBlogPosts(allBlogPosts.filter(p => p.id !== id))
    setPendingPosts(pendingPosts.filter(p => p.id !== id))
  }

  const handleUpdateBlog = async (id, updates) => {
    await supabase.from('blog_posts').update(updates).eq('id', id)
    setAllBlogPosts(allBlogPosts.map(p => p.id === id ? { ...p, ...updates } : p))
    setEditingPost(null)
  }

  const handleUpdateSetting = async (key, value) => {
    await supabase.from('site_settings').update({ value }).eq('key', key)
    setSettings({ ...settings, [key]: value })
  }

  const handleAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return
    const { data } = await supabase.from('announcements').insert(newAnnouncement).select()
    if (data) { setAnnouncements([data[0], ...announcements]); setNewAnnouncement({ title: '', message: '', type: 'info' }) }
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
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { alert('Oturum bulunamadı, lütfen tekrar giriş yapın'); return }
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (data.success) { setUsers(users.filter(u => u.id !== userId)); alert('Kullanıcı silindi!') }
      else alert('Hata: ' + data.error)
    } catch (error) { alert('Bir hata oluştu: ' + error.message) }
  }

  const handleUnfreezeUser = async (profileId) => {
    await supabase.from('profiles').update({ is_frozen: false, frozen_at: null }).eq('id', profileId)
    setFrozenUsers(frozenUsers.filter(u => u.id !== profileId))
    alert('Hesap aktif edildi!')
  }

  const handleToggleTemplate = async (templateId, field, value) => {
    await supabase.from('template_settings').update({ [field]: !value }).eq('template_id', templateId)
    setTemplateSettings(templateSettings.map(t => t.template_id === templateId ? { ...t, [field]: !value } : t))
  }

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.message) return
    setSendingEmail(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify(emailForm)
      })
      const data = await res.json()
      if (data.success) { alert(`✅ Email gönderildi! ${data.successCount}/${data.total} başarılı`); setEmailForm({ subject: '', message: '', target: 'all' }) }
      else alert('Hata: ' + data.error)
    } catch (error) { alert('Bir hata oluştu') }
    setSendingEmail(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>

  const templateStats = cvs.reduce((acc, cv) => { acc[cv.template] = (acc[cv.template] || 0) + 1; return acc }, {})
  const dailyCvs = cvs.filter(cv => new Date(cv.created_at).toDateString() === new Date().toDateString()).length
  const weeklyCvs = cvs.filter(cv => new Date(cv.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  const monthlyCvs = cvs.filter(cv => new Date(cv.created_at).getMonth() === new Date().getMonth()).length
  const totalVisitors = Object.values(visitorStats).reduce((a, b) => a + b, 0)

  const tabs = [
    { id: 'analytics', label: '📈 Google Analytics' },
    { id: 'stats', label: '📊 İstatistikler' },
    { id: 'visitors', label: `👁️ Ziyaretçiler (${totalVisitors})` },
    { id: 'users', label: `👥 Kullanıcılar (${users.length})` },
    { id: 'frozen', label: `🧊 Dondurulmuş (${frozenUsers.length})` },
    { id: 'cvs', label: `📄 CV'ler (${cvs.length})` },
    { id: 'shared-cvs', label: `🔗 Paylaşılan CV'ler (${sharedCvs.length})` },
    { id: 'blog', label: `✍️ Blog ${pendingPosts.length > 0 ? `(${pendingPosts.length})` : ''}` },
    { id: 'all-blog', label: `📝 Tüm Bloglar (${allBlogPosts.length})` },
    { id: 'templates', label: '🎨 Şablonlar' },
    { id: 'email', label: '📧 Email Gönder' },
    { id: 'announcements', label: '📢 Duyurular' },
    { id: 'logs', label: '📋 Aktivite Logları' },
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
        {/* GOOGLE ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-bold">Google Analytics</h2>
              <button
                onClick={async () => {
                  setLoadingAnalytics(true)
                  try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const res = await fetch('/api/analytics', { headers: { authorization: `Bearer ${session.access_token}` } })
                    const data = await res.json()
                    if (data.success) setAnalyticsData(data.data)
                    else alert('Hata: ' + data.error)
                  } catch (e) { alert('Bir hata oluştu') }
                  setLoadingAnalytics(false)
                }}
                disabled={loadingAnalytics}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-xl"
              >
                {loadingAnalytics ? '⏳ Yükleniyor...' : '🔄 Verileri Çek'}
              </button>
            </div>

            {!analyticsData ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">📈</p>
                <p className="text-gray-400 mb-4">Google Analytics verilerini görmek için butona tıklayın</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Özet Kartlar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Aktif Kullanıcı (30 gün)</p>
                    <p className="text-blue-400 text-3xl font-bold">{analyticsData.activeUsers}</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Toplam Sayfa Görüntüleme</p>
                    <p className="text-green-400 text-3xl font-bold">{analyticsData.dailyStats.reduce((a, b) => a + parseInt(b.pageViews), 0)}</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Toplam Oturum</p>
                    <p className="text-purple-400 text-3xl font-bold">{analyticsData.dailyStats.reduce((a, b) => a + parseInt(b.sessions), 0)}</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <p className="text-gray-400 text-xs mb-1">Ülke Sayısı</p>
                    <p className="text-yellow-400 text-3xl font-bold">{analyticsData.countries.length}</p>
                  </div>
                </div>

                {/* Günlük İstatistikler */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <h3 className="text-white font-semibold mb-4">Son 30 Gün - Günlük Ziyaretler</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analyticsData.dailyStats.slice(-14).reverse().map((day, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <p className="text-gray-400 text-xs w-24">{day.date.replace(/(\d{4})(\d{2})(\d{2})/, '$3/$2/$1')}</p>
                        <div className="flex-1 bg-gray-800 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((parseInt(day.pageViews) / Math.max(...analyticsData.dailyStats.map(d => parseInt(d.pageViews)))) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-gray-400 text-xs w-16 text-right">{day.pageViews} görüntüleme</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* En Çok Ziyaret Edilen Sayfalar */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">En Çok Ziyaret Edilen Sayfalar</h3>
                    <div className="space-y-3">
                      {analyticsData.topPages.map((page, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <p className="text-gray-400 text-xs w-32 truncate">{page.page}</p>
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(parseInt(page.views) / parseInt(analyticsData.topPages[0]?.views || 1)) * 100}%` }}></div>
                          </div>
                          <p className="text-gray-400 text-xs w-10 text-right">{page.views}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cihaz Türleri */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">Cihaz Türleri</h3>
                    <div className="space-y-3">
                      {analyticsData.devices.map((device, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <p className="text-gray-400 text-sm w-24">
                            {device.device === 'mobile' ? '📱 Mobil' : device.device === 'desktop' ? '💻 Masaüstü' : '📟 Tablet'}
                          </p>
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(parseInt(device.sessions) / analyticsData.devices.reduce((a, b) => a + parseInt(b.sessions), 0)) * 100}%` }}></div>
                          </div>
                          <p className="text-gray-400 text-xs w-10 text-right">{device.sessions}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ülkeler */}
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-white font-semibold mb-4">Ülkeler</h3>
                    <div className="space-y-3">
                      {analyticsData.countries.map((country, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <p className="text-gray-400 text-sm w-32 truncate">{country.country}</p>
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(parseInt(country.sessions) / parseInt(analyticsData.countries[0]?.sessions || 1)) * 100}%` }}></div>
                          </div>
                          <p className="text-gray-400 text-xs w-10 text-right">{country.sessions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Toplam Kullanıcı', value: users.length, color: 'text-blue-400' },
                { label: 'Toplam CV', value: cvs.length, color: 'text-green-400' },
                { label: 'Paylaşılan CV', value: sharedCvs.length, color: 'text-cyan-400' },
                { label: 'Toplam Ziyaret', value: totalVisitors, color: 'text-purple-400' },
                { label: 'Bu Ay CV', value: monthlyCvs, color: 'text-yellow-400' },
                { label: 'Bu Hafta CV', value: weeklyCvs, color: 'text-orange-400' },
                { label: 'Bugün CV', value: dailyCvs, color: 'text-red-400' },
                { label: 'Dondurulmuş Hesap', value: frozenUsers.length, color: 'text-blue-300' },
                { label: 'Bekleyen Blog', value: pendingPosts.length, color: 'text-pink-400' },
                { label: 'Toplam Blog', value: allBlogPosts.length, color: 'text-indigo-400' },
                { label: 'Aktif Duyuru', value: announcements.filter(a => a.active).length, color: 'text-teal-400' },
                { label: 'Bakım Modu', value: settings.maintenance_mode === 'true' ? 'Açık' : 'Kapalı', color: settings.maintenance_mode === 'true' ? 'text-red-400' : 'text-green-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Şablon Kullanım İstatistikleri</h3>
                <div className="space-y-3">
                  {Object.entries(templateStats).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([template, count]) => (
                    <div key={template} className="flex items-center gap-3">
                      <p className="text-gray-300 text-sm w-28 truncate">{template}</p>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(count / cvs.length) * 100}%` }}></div>
                      </div>
                      <p className="text-gray-400 text-sm w-8 text-right">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4">Son 7 Gün CV Oluşturma</h3>
                <div className="space-y-2">
                  {Array.from({ length: 7 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - i)
                    const count = cvs.filter(cv => new Date(cv.created_at).toDateString() === date.toDateString()).length
                    return { date: date.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }), count }
                  }).reverse().map((day, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <p className="text-gray-300 text-sm w-20">{day.date}</p>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${Math.max((day.count / Math.max(...Array.from({ length: 7 }, (_, j) => { const d = new Date(); d.setDate(d.getDate() - j); return cvs.filter(cv => new Date(cv.created_at).toDateString() === d.toDateString()).length }))) * 100, 0)}%` }}></div>
                      </div>
                      <p className="text-gray-400 text-sm w-6 text-right">{day.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ZİYARETÇİ */}
        {activeTab === 'visitors' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-xs mb-1">Toplam Ziyaret</p>
                <p className="text-cyan-400 text-3xl font-bold">{totalVisitors}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-gray-400 text-xs mb-1">Ziyaret Edilen Sayfa</p>
                <p className="text-blue-400 text-3xl font-bold">{Object.keys(visitorStats).length}</p>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Sayfa Bazlı Ziyaretler</h3>
              {Object.keys(visitorStats).length === 0 ? <p className="text-gray-500 text-center py-8">Henüz ziyaretçi verisi yok</p> : (
                <div className="space-y-3">
                  {Object.entries(visitorStats).sort((a, b) => b[1] - a[1]).map(([page, count]) => (
                    <div key={page} className="flex items-center gap-3">
                      <p className="text-gray-300 text-sm w-40 truncate">{page}</p>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(count / totalVisitors) * 100}%` }}></div>
                      </div>
                      <p className="text-gray-400 text-sm w-10 text-right">{count}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* KULLANICILAR */}
        {activeTab === 'users' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Toplam {users.length} kullanıcı</p>
            <div className="space-y-3">
              {users.map((u) => {
                const profile = profiles.find(p => p.id === u.id)
                return (
                  <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{u.email?.charAt(0).toUpperCase()}</div>
                        )}
                        <div>
                          <p className="text-white font-medium text-sm">{profile?.full_name || 'İsimsiz'}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {profile?.job_title && <span className="text-xs bg-blue-600 bg-opacity-20 text-blue-400 px-2 py-0.5 rounded-full">{profile.job_title}</span>}
                            {profile?.city && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">📍{profile.city}</span>}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.email_confirmed_at ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-yellow-600 bg-opacity-20 text-yellow-400'}`}>{u.email_confirmed_at ? '✓ Doğrulandı' : 'Bekliyor'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p className="text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString('tr-TR')}</p>
                        <button onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : { ...u, profile })} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg">Detay</button>
                        {u.email !== ADMIN_EMAIL && <button onClick={() => handleDeleteUser(u.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg">Sil</button>}
                      </div>
                    </div>
                    {selectedUser?.id === u.id && (
                      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div><p className="text-gray-500 text-xs">Son Giriş</p><p className="text-white text-sm">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('tr-TR') : '-'}</p></div>
                        <div><p className="text-gray-500 text-xs">Telefon</p><p className="text-white text-sm">{profile?.phone || '-'}</p></div>
                        <div><p className="text-gray-500 text-xs">Sektör</p><p className="text-white text-sm">{profile?.sector || '-'}</p></div>
                        <div><p className="text-gray-500 text-xs">LinkedIn</p><p className="text-blue-400 text-sm truncate">{profile?.linkedin_url || '-'}</p></div>
                        <div><p className="text-gray-500 text-xs">GitHub</p><p className="text-blue-400 text-sm truncate">{profile?.github_url || '-'}</p></div>
                        <div><p className="text-gray-500 text-xs">CV Sayısı</p><p className="text-white text-sm">{cvs.filter(cv => cv.user_id === u.id).length}</p></div>
                        {profile?.bio && <div className="col-span-full"><p className="text-gray-500 text-xs">Biyografi</p><p className="text-white text-sm">{profile.bio}</p></div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* DONDURULMUŞ HESAPLAR */}
        {activeTab === 'frozen' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">{frozenUsers.length} dondurulmuş hesap</p>
            {frozenUsers.length === 0 ? (
              <div className="text-center py-20"><p className="text-5xl mb-4">🧊</p><p className="text-gray-500">Dondurulmuş hesap yok</p></div>
            ) : (
              <div className="space-y-3">
                {frozenUsers.map((profile) => {
                  const u = users.find(u => u.id === profile.id)
                  return (
                    <div key={profile.id} className="bg-gray-900 border border-blue-900 rounded-2xl p-5 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{profile.full_name || 'İsimsiz'}</p>
                        <p className="text-gray-400 text-sm">{u?.email || '-'}</p>
                        <p className="text-gray-500 text-xs mt-1">Dondurulma: {profile.frozen_at ? new Date(profile.frozen_at).toLocaleDateString('tr-TR') : '-'}</p>
                      </div>
                      <button onClick={() => handleUnfreezeUser(profile.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl">✅ Aktif Et</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* CV'LER */}
        {activeTab === 'cvs' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Toplam {cvs.length} CV</p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-sm px-6 py-4">İsim</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Şablon</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Paylaşım</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Tarih</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">İşlem</th>
                </tr></thead>
                <tbody>
                  {cvs.map((cv) => (
                    <tr key={cv.id} className="border-b border-gray-800 hover:bg-gray-800 transition-all">
                      <td className="px-6 py-4"><p className="text-white text-sm">{cv.cv_data.name}</p><p className="text-gray-500 text-xs">{cv.cv_data.email}</p></td>
                      <td className="px-6 py-4"><span className="bg-blue-600 bg-opacity-20 text-blue-400 text-xs px-2 py-1 rounded-full">{cv.template}</span></td>
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${cv.is_shared ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>{cv.is_shared ? '🔗 Paylaşıldı' : 'Gizli'}</span></td>
                      <td className="px-6 py-4"><p className="text-gray-400 text-sm">{new Date(cv.created_at).toLocaleDateString('tr-TR')}</p></td>
                      <td className="px-6 py-4"><button onClick={() => handleDeleteCV(cv.id)} className="text-red-400 hover:text-red-300 text-sm">Sil</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYLAŞILAN CV'LER */}
        {activeTab === 'shared-cvs' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Toplam {sharedCvs.length} paylaşılan CV</p>
            <div className="space-y-3">
              {sharedCvs.length === 0 ? <div className="text-center py-20"><p className="text-gray-500">Henüz paylaşılan CV yok</p></div> : sharedCvs.map((cv) => (
                <div key={cv.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{cv.cv_data.name}</p>
                    <p className="text-gray-400 text-sm">{cv.template} şablonu</p>
                    {cv.share_id && <p className="text-blue-400 text-xs mt-1 cursor-pointer" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/cv/${cv.share_id}`); alert('Link kopyalandı!') }}>🔗 Linki Kopyala</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleShareCV(cv.id, cv.is_shared)} className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm px-3 py-1.5 rounded-lg">Paylaşımı Kapat</button>
                    <button onClick={() => handleDeleteCV(cv.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-lg">Sil</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOG ONAYI */}
        {activeTab === 'blog' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Onay bekleyen {pendingPosts.length} yazı</p>
            {pendingPosts.length === 0 ? <div className="text-center py-20"><p className="text-gray-500">Onay bekleyen blog yazısı yok</p></div> : (
              <div className="space-y-4">
                {pendingPosts.map((post) => (
                  <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h3 className="text-white font-semibold text-lg">{post.title}</h3>
                    <p className="text-blue-400 text-sm">{post.category}</p>
                    <p className="text-gray-500 text-xs mt-1">{post.author_name} — {new Date(post.created_at).toLocaleDateString('tr-TR')}</p>
                    <p className="text-gray-400 text-sm my-3 leading-relaxed line-clamp-3">{post.content}</p>
                    <div className="flex gap-3">
                      <button onClick={() => handleApproveBlog(post.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-xl">✅ Onayla</button>
                      <button onClick={() => handleRejectBlog(post.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-xl">❌ Reddet</button>
                      <button onClick={() => handleDeleteBlog(post.id)} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-xl">🗑️ Sil</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TÜM BLOGLAR */}
        {activeTab === 'all-blog' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Toplam {allBlogPosts.length} blog yazısı</p>
            <div className="space-y-3">
              {allBlogPosts.map((post) => (
                <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  {editingPost?.id === post.id ? (
                    <div>
                      <input type="text" value={editingPost.title} onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 mb-2 outline-none text-sm" />
                      <textarea value={editingPost.content} onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2 mb-3 outline-none text-sm h-32 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateBlog(post.id, { title: editingPost.title, content: editingPost.content })} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">💾 Kaydet</button>
                        <button onClick={() => setEditingPost(null)} className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-2 rounded-xl">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium">{post.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'approved' ? 'bg-green-600 bg-opacity-20 text-green-400' : post.status === 'rejected' ? 'bg-red-600 bg-opacity-20 text-red-400' : 'bg-yellow-600 bg-opacity-20 text-yellow-400'}`}>{post.status === 'approved' ? '✓ Onaylı' : post.status === 'rejected' ? '✗ Reddedildi' : '⏳ Bekliyor'}</span>
                        </div>
                        <p className="text-gray-400 text-xs">{post.category} — {post.author_name} — {new Date(post.created_at).toLocaleDateString('tr-TR')}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => setEditingPost(post)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg">Düzenle</button>
                        {post.status !== 'approved' && <button onClick={() => handleApproveBlog(post.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg">Onayla</button>}
                        <button onClick={() => handleDeleteBlog(post.id)} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg">Sil</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ŞABLONLAR */}
        {activeTab === 'templates' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Tüm şablonları yönet</p>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-gray-800">
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Şablon</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Tür</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Aktif</th>
                  <th className="text-left text-gray-400 text-sm px-6 py-4">Premium</th>
                </tr></thead>
                <tbody>
                  {templateSettings.map((t) => (
                    <tr key={t.template_id} className="border-b border-gray-800 hover:bg-gray-800 transition-all">
                      <td className="px-6 py-4"><p className="text-white text-sm font-medium">{t.template_id}</p></td>
                      <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded-full ${t.is_premium ? 'bg-purple-600 bg-opacity-20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>{t.is_premium ? '⭐ Premium' : 'Ücretsiz'}</span></td>
                      <td className="px-6 py-4"><button onClick={() => handleToggleTemplate(t.template_id, 'is_active', t.is_active)} className={`px-3 py-1 rounded-lg text-xs font-medium ${t.is_active ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{t.is_active ? '✓ Aktif' : '✗ Pasif'}</button></td>
                      <td className="px-6 py-4"><button onClick={() => handleToggleTemplate(t.template_id, 'is_premium', t.is_premium)} className={`px-3 py-1 rounded-lg text-xs font-medium ${t.is_premium ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}>{t.is_premium ? '⭐ Premium' : 'Ücretsiz'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EMAIL GÖNDER */}
        {activeTab === 'email' && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Kullanıcılara Email Gönder</h3>
             <select value={emailForm.target} onChange={(e) => setEmailForm({ ...emailForm, target: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none text-sm">
                <option value="all">Tüm Kullanıcılar ({users.length} kişi)</option>
                <option value="confirmed">Doğrulanmış Kullanıcılar ({users.filter(u => u.email_confirmed_at).length} kişi)</option>
                <option value="custom">Belirli Email Adresi</option>
              </select>

              {emailForm.target === 'custom' && (
                <input
                  type="email"
                  placeholder="Email adresi girin"
                  value={emailForm.customEmail || ''}
                  onChange={(e) => setEmailForm({ ...emailForm, customEmail: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              )}
              <input type="text" placeholder="Email Konusu" value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <textarea placeholder="Email İçeriği..." value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm h-40 resize-none" />
              <button onClick={handleSendEmail} disabled={sendingEmail || !emailForm.subject || !emailForm.message} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-6 py-3 rounded-xl transition-all">
                {sendingEmail ? '📧 Gönderiliyor...' : '📧 Email Gönder'}
              </button>
            </div>
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
                      <button onClick={() => handleToggleAnnouncement(ann.id, ann.active)} className={`text-sm px-3 py-1 rounded-lg ${ann.active ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}>{ann.active ? 'Durdur' : 'Aktif Et'}</button>
                      <button onClick={() => handleDeleteAnnouncement(ann.id)} className="bg-red-600 text-white text-sm px-3 py-1 rounded-lg">Sil</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AKTİVİTE LOGLARI */}
        {activeTab === 'logs' && (
          <div>
            <p className="text-gray-400 text-sm mb-4">Son 50 aktivite</p>
            {activityLogs.length === 0 ? <div className="text-center py-20"><p className="text-gray-500">Henüz aktivite logu yok</p></div> : (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Aksiyon</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Detay</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4">Tarih</th>
                  </tr></thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800 transition-all">
                        <td className="px-6 py-4"><span className="bg-blue-600 bg-opacity-20 text-blue-400 text-xs px-2 py-1 rounded-full">{log.action}</span></td>
                        <td className="px-6 py-4"><p className="text-gray-400 text-sm">{log.details || '-'}</p></td>
                        <td className="px-6 py-4"><p className="text-gray-400 text-sm">{new Date(log.created_at).toLocaleDateString('tr-TR')}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AYARLAR */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4">Site Ayarları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-white font-medium">Bakım Modu</p><p className="text-gray-400 text-sm">Açıkken kullanıcılar siteye erişemez</p></div>
                  <button onClick={() => handleUpdateSetting('maintenance_mode', settings.maintenance_mode === 'true' ? 'false' : 'true')} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${settings.maintenance_mode === 'true' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{settings.maintenance_mode === 'true' ? '🔴 Açık' : '⚪ Kapalı'}</button>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-white font-medium mb-2">Bakım Modu Mesajı</p>
                  <div className="flex gap-3">
                    <input type="text" value={settings.maintenance_message || ''} onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })} className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <button onClick={() => handleUpdateSetting('maintenance_message', settings.maintenance_message)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">Kaydet</button>
                  </div>
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
