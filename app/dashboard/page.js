'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const templates = [
  { id: 'Modern', name: 'Modern', desc: 'Mavi başlık', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="bg-blue-600 p-2"><div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div><div className="h-1 bg-blue-300 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-blue-600 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-5/6"></div></div></div>) },
  { id: 'Klasik', name: 'Klasik', desc: 'Siyah başlık', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="bg-gray-900 p-2"><div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div><div className="h-1 bg-gray-400 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-gray-800 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-5/6"></div></div></div>) },
  { id: 'Minimal', name: 'Minimal', desc: 'Sade beyaz', preview: (<div className="w-full h-full bg-white rounded-lg p-2"><div className="h-3 bg-gray-800 rounded w-2/3 mb-1"></div><div className="h-1 bg-gray-300 rounded w-1/2 mb-3"></div><div className="h-1 bg-gray-100 rounded w-full mb-1"></div><div className="h-1 bg-gray-100 rounded w-5/6"></div></div>) },
  { id: 'Kreatif', name: 'Kreatif', desc: 'Mor tonlar', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2"><div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div><div className="h-1 bg-purple-200 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-purple-500 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-5/6"></div></div></div>) },
  { id: 'Teknoloji', name: 'Teknoloji', desc: 'Koyu tema', preview: (<div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden"><div className="border-b border-green-500 p-2"><div className="h-2 bg-green-400 rounded w-3/4 mb-1"></div><div className="h-1 bg-green-800 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-green-500 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-700 rounded w-full mb-1"></div><div className="h-1 bg-gray-700 rounded w-5/6"></div></div></div>) },
  { id: 'Elegant', name: 'Elegant', desc: 'Gold detaylar', preview: (<div className="w-full h-full bg-amber-50 rounded-lg overflow-hidden"><div className="border-b-2 border-amber-600 p-2"><div className="h-2 bg-amber-800 rounded w-3/4 mb-1"></div><div className="h-1 bg-amber-400 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-amber-600 rounded w-1/3 mb-2"></div><div className="h-1 bg-amber-200 rounded w-full mb-1"></div><div className="h-1 bg-amber-200 rounded w-5/6"></div></div></div>) },
  { id: 'Kompakt', name: 'Kompakt', desc: 'İki sütunlu', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden flex"><div className="bg-slate-700 w-1/3 p-1"><div className="w-5 h-5 bg-slate-400 rounded-full mx-auto mb-1"></div><div className="h-1 bg-slate-400 rounded w-full mb-1"></div><div className="h-1 bg-slate-500 rounded w-4/5"></div></div><div className="flex-1 p-1"><div className="h-1 bg-slate-700 rounded w-3/4 mb-1"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-5/6"></div></div></div>) },
  { id: 'Akademik', name: 'Akademik', desc: 'Resmi format', preview: (<div className="w-full h-full bg-white rounded-lg p-2"><div className="text-center mb-2"><div className="h-2 bg-gray-800 rounded w-1/2 mx-auto mb-1"></div><div className="h-px bg-gray-800 w-full"></div></div><div className="h-1 bg-gray-700 rounded w-1/3 mb-1"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-5/6"></div></div>) },
]

const features = [
  { title: 'AI Özgeçmiş Oluşturucu', desc: 'Yapay zeka ile saniyeler içinde profesyonel CV', icon: '🤖' },
  { title: 'CV Puanlama', desc: 'AI ile CV\'ni değerlendir ve iyileştir', icon: '⭐' },
  { title: 'Çoklu Dil Desteği', desc: 'CV\'ni İngilizceye çevir', icon: '🌍' },
  { title: 'LinkedIn Özeti', desc: 'Profesyonel LinkedIn profil özeti oluştur', icon: '💼' },
  { title: 'Referans Mektubu', desc: 'Etkileyici referans mektupları oluştur', icon: '📝' },
  { title: 'CV Düzenleme', desc: 'Oluşturduğun CV\'yi kolayca düzenle', icon: '✏️' },
]

export default function Home() {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) router.push('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black bg-opacity-20 backdrop-blur-md border-b border-white border-opacity-10">
        <h1 onClick={() => router.push('/')} className="text-white text-xl font-bold cursor-pointer">Resumind</h1>
        
        <div className="hidden md:flex items-center gap-8">
          {/* Özellikler Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-white text-sm flex items-center gap-1 hover:text-purple-300 transition-all"
            >
              Özellikler
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-8 left-0 bg-white rounded-2xl shadow-2xl p-6 w-96 z-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-purple-600 font-bold text-xs uppercase tracking-widest mb-3">AI Özellikler</p>
                    {['AI CV Oluşturucu', 'CV Puanlama', 'Çoklu Dil'].map((item) => (
                      <p key={item} onClick={() => { router.push('/login'); setDropdownOpen(false) }} className="text-gray-600 text-sm py-1.5 hover:text-purple-600 cursor-pointer transition-all">{item}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-purple-600 font-bold text-xs uppercase tracking-widest mb-3">Araçlar</p>
                    {['LinkedIn Özeti', 'Referans Mektubu', 'CV Düzenleme'].map((item) => (
                      <p key={item} onClick={() => { router.push('/login'); setDropdownOpen(false) }} className="text-gray-600 text-sm py-1.5 hover:text-purple-600 cursor-pointer transition-all">{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-white text-sm hover:text-purple-300 transition-all">CV Şablonları</button>
          <button onClick={() => router.push('/#ucretlendirme')} className="text-white text-sm hover:text-purple-300 transition-all">Ücretlendirme</button>
          <button className="text-white text-sm hover:text-purple-300 transition-all">İletişim</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/login')} className="text-white text-sm border border-white border-opacity-30 px-4 py-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all">
            Giriş Yap
          </button>
          <button onClick={() => router.push('/login')} className="bg-green-500 hover:bg-green-400 text-white text-sm px-4 py-2 rounded-xl transition-all font-medium">
            Kayıt Ol
          </button>
        </div>
      </nav>

      {/* Dropdown kapatmak için arka plan */}
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>}

      {/* Hero */}
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20"
        style={{ background: 'linear-gradient(135deg, #6B21A8 0%, #4F46E5 50%, #2563EB 100%)' }}>
        <div className="inline-block bg-white bg-opacity-20 text-white text-sm px-4 py-1 rounded-full mb-6 border border-white border-opacity-30">
          ✨ Yapay Zeka Destekli CV Oluşturucu
        </div>
        <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-6 max-w-3xl">
          Hayalindeki işe<br />
          <span className="text-green-400">saniyeler içinde</span> başvur
        </h1>
        <p className="text-white text-opacity-80 text-xl mb-10 max-w-2xl leading-relaxed opacity-90">
          Yapay zeka CV'ni otomatik oluşturur, düzenler ve 12 profesyonel şablona uyarlar. Bilgilerini yaz veya mevcut CV'ni yükle, gerisini biz halledelim.
        </p>
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="bg-green-500 hover:bg-green-400 text-white font-bold px-10 py-4 rounded-2xl transition-all text-lg uppercase tracking-wide flex items-center gap-2"
          >
            Hemen Başla — Ücretsiz Dene →
          </button>
          <p className="text-white text-sm opacity-70">Kart bilgisi girmen gerekmez</p>
        </div>

        <div className="flex items-center justify-center gap-12 mt-16 flex-wrap">
          {[
            { number: '12', label: 'Profesyonel Şablon' },
            { number: 'PDF', label: 've Word Desteği' },
            { number: 'AI', label: 'Destekli İçerik' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-white text-3xl font-bold">{stat.number}</p>
              <p className="text-white text-sm mt-1 opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Özellikler */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-white text-3xl font-bold text-center mb-4">Neden Resumind?</h2>
        <p className="text-gray-400 text-center mb-12">Diğer CV araçlarından farkımız</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((item, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition-all">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Şablonlar */}
      <div className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-800">
        <h2 className="text-white text-3xl font-bold text-center mb-4">12 Profesyonel Şablon</h2>
        <p className="text-gray-400 text-center mb-12">Her sektöre uygun tasarımlar</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div key={template.id} onClick={() => router.push('/login')} className="bg-gray-900 border border-gray-800 hover:border-purple-500 rounded-2xl p-3 cursor-pointer transition-all group">
              <div className="w-full h-28 bg-gray-800 rounded-xl mb-3 overflow-hidden group-hover:ring-2 group-hover:ring-purple-500 transition-all">
                {template.preview}
              </div>
              <h3 className="text-white font-medium text-sm">{template.name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{template.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nasıl Çalışır */}
      <div className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-800">
        <h2 className="text-white text-3xl font-bold text-center mb-4">Nasıl Çalışır?</h2>
        <p className="text-gray-400 text-center mb-12">3 adımda profesyonel CV</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Şablon Seç', desc: 'Beğendiğin CV şablonunu seç' },
            { step: '2', title: 'Bilgileri Gir', desc: 'CV bilgilerini yaz veya mevcut CV\'ni yükle' },
            { step: '3', title: 'İndir', desc: 'Yapay zekanın oluşturduğu CV\'yi PDF olarak indir' }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4" style={{background: 'linear-gradient(135deg, #6B21A8, #2563EB)'}}>
                {item.step}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="rounded-3xl p-12 text-center" style={{background: 'linear-gradient(135deg, #6B21A8 0%, #4F46E5 50%, #2563EB 100%)'}}>
          <h2 className="text-white text-3xl font-bold mb-4">Hemen başla, ücretsiz dene</h2>
          <p className="text-white mb-8 opacity-80">Yapay zeka ile dakikalar içinde profesyonel CV'ni oluştur</p>
          <button onClick={() => router.push('/login')} className="bg-green-500 hover:bg-green-400 text-white font-bold px-8 py-4 rounded-2xl transition-all text-lg uppercase tracking-wide">
            Ücretsiz CV Oluştur →
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-6 text-center">
        <p className="text-gray-500 text-sm">© 2025 Resumind. Tüm hakları saklıdır.</p>
      </footer>

    </div>
  )
}