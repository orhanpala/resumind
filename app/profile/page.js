'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState(null)
 const [profile, setProfile] = useState({ full_name: '', bio: '', linkedin_url: '', avatar_url: '', email_notifications: true, phone: '', birth_date: '', city: '', country: 'Türkiye', job_title: '', sector: '', github_url: '' })
  const [cvStats, setCvStats] = useState({ total: 0, favoriteTemplate: '', lastCV: null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) setProfile(profileData)

      const { data: cvsData } = await supabase.from('cvs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (cvsData && cvsData.length > 0) {
        const templateCounts = cvsData.reduce((acc, cv) => { acc[cv.template] = (acc[cv.template] || 0) + 1; return acc }, {})
        const favoriteTemplate = Object.entries(templateCounts).sort((a, b) => b[1] - a[1])[0][0]
        setCvStats({ total: cvsData.length, favoriteTemplate, lastCV: cvsData[0] })
      }

      setLoading(false)
    }
    init()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
     full_name: profile.full_name,
      bio: profile.bio,
      linkedin_url: profile.linkedin_url,
      email_notifications: profile.email_notifications,
      phone: profile.phone,
      birth_date: profile.birth_date || null,
      city: profile.city,
      country: profile.country,
      job_title: profile.job_title,
      sector: profile.sector,
      github_url: profile.github_url,

      updated_at: new Date().toISOString()
    })
    if (!error) setMessage({ type: 'success', text: 'Profil kaydedildi!' })
    else setMessage({ type: 'error', text: 'Hata oluştu!' })
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
      setProfile({ ...profile, avatar_url: data.publicUrl })
      setMessage({ type: 'success', text: 'Fotoğraf yüklendi!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Fotoğraf yüklenemedi!' })
    }
    setUploadingPhoto(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Şifreler eşleşmiyor!' }); return
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Şifre en az 6 karakter olmalı!' }); return
    }
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
    if (!error) { setMessage({ type: 'success', text: 'Şifre değiştirildi!' }); setPasswordForm({ newPassword: '', confirmPassword: '' }) }
    else setMessage({ type: 'error', text: 'Hata: ' + error.message })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) return
    if (!confirm('Tüm CV\'leriniz ve verileriniz silinecek. Devam etmek istiyor musunuz?')) return
    await supabase.from('cvs').delete().eq('user_id', user.id)
    await supabase.from('profiles').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/')
  }
  const calculateCompletion = () => {
    const fields = [
      profile.full_name,
      profile.bio,
      profile.linkedin_url,
      profile.github_url,
      profile.phone,
      profile.birth_date,
      profile.city,
      profile.job_title,
      profile.sector,
      profile.avatar_url,
    ]
    const filled = fields.filter(f => f && f.toString().trim() !== '').length
    return Math.round((filled / fields.length) * 100)
  }

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Başlık */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profil" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-500">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1.5 cursor-pointer hover:bg-gray-700 transition-all border border-gray-700">
              {uploadingPhoto ? '⏳' : '📷'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">{profile.full_name || 'İsimsiz Kullanıcı'}</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-gray-500 text-xs mt-1">Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Mesaj */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-900 bg-opacity-30 border border-green-700 text-green-400' : 'bg-red-900 bg-opacity-30 border border-red-700 text-red-400'}`}>
            {message.text}
          </div>
        )}
          {/* Profil Tamamlanma */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white font-medium text-sm">Profil Tamamlanma</p>
            <p className={`text-sm font-bold ${calculateCompletion() === 100 ? 'text-green-400' : calculateCompletion() >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              %{calculateCompletion()}
            </p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${calculateCompletion() === 100 ? 'bg-green-500' : calculateCompletion() >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${calculateCompletion()}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            {calculateCompletion() === 100 ? '🎉 Profiliniz tamamen doldurulmuş!' : `Profilinizi tamamlamak için ${10 - Math.round(calculateCompletion() / 10)} alan daha doldurun`}
          </p>
        </div>

        {/* CV İstatistikleri */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-blue-400 text-3xl font-bold">{cvStats.total}</p>
            <p className="text-gray-400 text-xs mt-1">Toplam CV</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-purple-400 text-lg font-bold truncate">{cvStats.favoriteTemplate || '-'}</p>
            <p className="text-gray-400 text-xs mt-1">Favori Şablon</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
            <p className="text-green-400 text-sm font-bold">{cvStats.lastCV ? new Date(cvStats.lastCV.created_at).toLocaleDateString('tr-TR') : '-'}</p>
            <p className="text-gray-400 text-xs mt-1">Son CV</p>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-2 mb-6">
          {[{ id: 'profile', label: '👤 Profil' }, { id: 'settings', label: '⚙️ Ayarlar' }, { id: 'danger', label: '🗑️ Hesap' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* PROFİL SEKMESİ */}
        {activeTab === 'profile' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">Profil Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Ad Soyad</label>
                <input type="text" placeholder="Adınız Soyadınız" value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Hakkımda</label>
                <textarea placeholder="Kendiniz hakkında kısa bir biyografi yazın..." value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm h-24 resize-none" />
              </div>
             <div>
                <label className="text-gray-400 text-sm mb-1 block">Telefon Numarası</label>
                <input type="tel" placeholder="+90 555 555 55 55" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Doğum Tarihi</label>
                <input type="date" value={profile.birth_date || ''} onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Şehir</label>
                  <input type="text" placeholder="İstanbul" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Ülke</label>
                  <input type="text" placeholder="Türkiye" value={profile.country || ''} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Meslek</label>
                  <input type="text" placeholder="Yazılım Geliştirici" value={profile.job_title || ''} onChange={(e) => setProfile({ ...profile, job_title: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-1 block">Sektör</label>
                  <select value={profile.sector || ''} onChange={(e) => setProfile({ ...profile, sector: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="">Seçin</option>
                    <option value="Teknoloji">Teknoloji</option>
                    <option value="Finans">Finans</option>
                    <option value="Sağlık">Sağlık</option>
                    <option value="Eğitim">Eğitim</option>
                    <option value="Hukuk">Hukuk</option>
                    <option value="Pazarlama">Pazarlama</option>
                    <option value="Mühendislik">Mühendislik</option>
                    <option value="Tasarım">Tasarım</option>
                    <option value="Diğer">Diğer</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">LinkedIn Profil URL</label>
                <input type="url" placeholder="https://linkedin.com/in/kullaniciadi" value={profile.linkedin_url || ''} onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">GitHub URL</label>
                <input type="url" placeholder="https://github.com/kullaniciadi" value={profile.github_url || ''} onChange={(e) => setProfile({ ...profile, github_url: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all">
                {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* AYARLAR SEKMESİ */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-5">Şifre Değiştir</h2>
              <div className="space-y-3">
                <input type="password" placeholder="Yeni şifre" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <input type="password" placeholder="Yeni şifre (tekrar)" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                <button onClick={handleChangePassword} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all">
                  🔒 Şifreyi Değiştir
                </button>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-5">Bildirim Ayarları</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Email Bildirimleri</p>
                  <p className="text-gray-400 text-sm">Güncellemeler ve haberler için email al</p>
                </div>
                <button onClick={() => setProfile({ ...profile, email_notifications: !profile.email_notifications })} className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${profile.email_notifications ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                  {profile.email_notifications ? '✓ Açık' : 'Kapalı'}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* HESAP SEKMESİ */}
        {activeTab === 'danger' && (
          <div className="space-y-4">

            {/* Son Giriş Bilgileri */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Son Giriş Bilgileri</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white text-sm">{user.email}</p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <p className="text-gray-400 text-sm">Son Giriş</p>
                  <p className="text-white text-sm">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('tr-TR') : '-'}</p>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <p className="text-gray-400 text-sm">Kayıt Tarihi</p>
                  <p className="text-white text-sm">{new Date(user.created_at).toLocaleString('tr-TR')}</p>
                </div>
                <div className="flex items-center justify-between py-2">
                  <p className="text-gray-400 text-sm">Email Doğrulama</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${user.email_confirmed_at ? 'bg-green-600 bg-opacity-20 text-green-400' : 'bg-yellow-600 bg-opacity-20 text-yellow-400'}`}>
                    {user.email_confirmed_at ? '✓ Doğrulandı' : 'Bekliyor'}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Değiştirme */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-2">Email Değiştir</h2>
              <p className="text-gray-400 text-sm mb-4">Yeni email adresinize doğrulama linki gönderilecektir.</p>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="Yeni email adresi"
                  id="newEmail"
                  className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={async () => {
                    const newEmail = document.getElementById('newEmail').value
                    if (!newEmail) return
                    const { error } = await supabase.auth.updateUser({ email: newEmail })
                    if (!error) setMessage({ type: 'success', text: 'Doğrulama emaili gönderildi!' })
                    else setMessage({ type: 'error', text: 'Hata: ' + error.message })
                    setTimeout(() => setMessage(null), 3000)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
                >
                  Değiştir
                </button>
              </div>
            </div>

            {/* Tüm CV'leri Sil */}
            <div className="bg-gray-900 border border-orange-900 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-2">Tüm CV'leri Sil</h2>
              <p className="text-gray-400 text-sm mb-4">Hesabınız silinmez, sadece tüm CV'leriniz kalıcı olarak silinir.</p>
              <button
                onClick={async () => {
                  if (!confirm('Tüm CV\'leriniz silinecek. Emin misiniz?')) return
                  await supabase.from('cvs').delete().eq('user_id', user.id)
                  setCvStats({ total: 0, favoriteTemplate: '', lastCV: null })
                  setMessage({ type: 'success', text: 'Tüm CV\'ler silindi!' })
                  setTimeout(() => setMessage(null), 3000)
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                🗑️ Tüm CV'leri Sil
              </button>
            </div>

            {/* Hesabı Dondur */}
            <div className="bg-gray-900 border border-yellow-900 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-2">Hesabı Geçici Dondur</h2>
              <p className="text-gray-400 text-sm mb-4">Hesabınız dondurulduğunda giriş yapamazsınız. İstediğinizde tekrar aktif edebilirsiniz.</p>
              <button
                onClick={async () => {
                  if (!confirm('Hesabınızı dondurmak istediğinize emin misiniz?')) return
                  await supabase.from('profiles').update({ is_frozen: true, frozen_at: new Date().toISOString() }).eq('id', user.id)
                  await supabase.auth.signOut()
                  router.push('/')
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium px-6 py-3 rounded-xl transition-all"
              >
                🧊 Hesabımı Dondur
              </button>
            </div>

            {/* Hesabı Sil */}
            <div className="bg-gray-900 border border-red-900 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-2">Hesabı Sil</h2>
              <p className="text-gray-400 text-sm mb-4">Hesabınızı sildiğinizde tüm CV'leriniz ve verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.</p>
              <button onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition-all">
                🗑️ Hesabımı Sil
              </button>
            </div>

          </div>
        )}


      </div>
    </div>
  )
}