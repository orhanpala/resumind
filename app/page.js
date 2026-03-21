'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'

const templates = [
  {
    id: 'Modern', name: 'Modern', desc: 'Mavi başlık',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-blue-600 p-2">
          <div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-blue-300 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-blue-600 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Klasik', name: 'Klasik', desc: 'Siyah başlık',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-900 p-2">
          <div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-gray-400 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-gray-800 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Minimal', name: 'Minimal', desc: 'Sade beyaz',
    preview: (
      <div className="w-full h-full bg-white rounded-lg p-2">
        <div className="h-3 bg-gray-800 rounded w-2/3 mb-1"></div>
        <div className="h-1 bg-gray-300 rounded w-1/2 mb-3"></div>
        <div className="h-1 bg-gray-100 rounded w-full mb-1"></div>
        <div className="h-1 bg-gray-100 rounded w-5/6"></div>
      </div>
    )
  },
  {
    id: 'Kreatif', name: 'Kreatif', desc: 'Mor tonlar',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2">
          <div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-purple-200 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-purple-500 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Teknoloji', name: 'Teknoloji', desc: 'Koyu tema',
    preview: (
      <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        <div className="border-b border-green-500 p-2">
          <div className="h-2 bg-green-400 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-green-800 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-green-500 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-gray-700 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Elegant', name: 'Elegant', desc: 'Gold detaylar',
    preview: (
      <div className="w-full h-full bg-amber-50 rounded-lg overflow-hidden">
        <div className="border-b-2 border-amber-600 p-2">
          <div className="h-2 bg-amber-800 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-amber-400 rounded w-1/2"></div>
        </div>
        <div className="p-2">
          <div className="h-1 bg-amber-600 rounded w-1/3 mb-2"></div>
          <div className="h-1 bg-amber-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-amber-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Kompakt', name: 'Kompakt', desc: 'İki sütunlu',
    preview: (
      <div className="w-full h-full bg-white rounded-lg overflow-hidden flex">
        <div className="bg-slate-700 w-1/3 p-1">
          <div className="w-5 h-5 bg-slate-400 rounded-full mx-auto mb-1"></div>
          <div className="h-1 bg-slate-400 rounded w-full mb-1"></div>
          <div className="h-1 bg-slate-500 rounded w-4/5"></div>
        </div>
        <div className="flex-1 p-1">
          <div className="h-1 bg-slate-700 rounded w-3/4 mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-1 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  },
  {
    id: 'Akademik', name: 'Akademik', desc: 'Resmi format',
    preview: (
      <div className="w-full h-full bg-white rounded-lg p-2">
        <div className="text-center mb-2">
          <div className="h-2 bg-gray-800 rounded w-1/2 mx-auto mb-1"></div>
          <div className="h-px bg-gray-800 w-full"></div>
        </div>
        <div className="h-1 bg-gray-700 rounded w-1/3 mb-1"></div>
        <div className="h-1 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-1 bg-gray-200 rounded w-5/6"></div>
      </div>
    )
  }
]

useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
       <h1 onClick={() => router.push('/')} className="text-white text-xl font-bold cursor-pointer hover:text-blue-400 transition-all">Resumind</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/login')} className="text-gray-400 hover:text-white text-sm transition-all">
            Giriş Yap
          </button>
          <button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all">
            Ücretsiz Başla
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-block bg-blue-600 bg-opacity-20 text-blue-400 text-sm px-4 py-1 rounded-full mb-6 border border-blue-600 border-opacity-30">
          ✨ Yapay Zeka Destekli CV Oluşturucu
        </div>
        <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-6">
          Hayalindeki işe<br />
          <span className="text-blue-500">saniyeler içinde</span> başvur
        </h1>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Yapay zeka CV'ni otomatik oluşturur, düzenler ve 8 profesyonel şablona uyarlar. Bilgilerini yaz veya mevcut CV'ni yükle, gerisini biz halledelim.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-2xl transition-all text-lg"
          >
            Hemen Dene — Ücretsiz
          </button>
          <p className="text-gray-500 text-sm">Kredi kartı gerekmez</p>
        </div>

        {/* İstatistikler */}
        <div className="flex items-center justify-center gap-12 mt-16 flex-wrap">
          {[
            { number: '8', label: 'Profesyonel Şablon' },
            { number: 'PDF', label: 've Word Desteği' },
            { number: 'AI', label: 'Destekli İçerik' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-white text-3xl font-bold">{stat.number}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Şablon Önizlemeleri */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-white text-3xl font-bold text-center mb-4">8 Profesyonel Şablon</h2>
        <p className="text-gray-400 text-center mb-12">Her sektöre uygun tasarımlar</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => router.push('/login')}
              className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-3 cursor-pointer transition-all group"
            >
              <div className="w-full h-28 bg-gray-800 rounded-xl mb-3 overflow-hidden group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                {template.preview}
              </div>
              <h3 className="text-white font-medium text-sm">{template.name}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{template.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Özellikler */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-white text-3xl font-bold text-center mb-4">Neden Resumind?</h2>
        <p className="text-gray-400 text-center mb-12">Diğer CV araçlarından farkımız</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '⚡', title: 'Saniyeler İçinde', desc: 'Bilgilerini yaz, yapay zeka profesyonel CV\'ni anında oluştursun' },
            { icon: '📄', title: 'PDF & Word Yükle', desc: 'Mevcut CV\'ni yükle, yapay zeka istediğin şablona dönüştürsün' },
            { icon: '🤖', title: 'Akıllı Doldurma', desc: 'Az bilgi verdiysen yapay zeka eksikleri tamamlar, CV\'ni dolgun gösterir' },
            { icon: '🎨', title: '8 Profesyonel Şablon', desc: 'Modern\'den Akademik\'e, her sektöre uygun tasarımlar' },
            { icon: '📥', title: 'PDF İndir', desc: 'Oluşturduğun CV\'yi tek tıkla PDF olarak indir, hemen kullan' },
            { icon: '🔒', title: 'Güvenli', desc: 'Bilgilerin şifreli ve güvende, sadece sen erişebilirsin' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Nasıl Çalışır */}
      <div className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-800">
        <h2 className="text-white text-3xl font-bold text-center mb-4">Nasıl Çalışır?</h2>
        <p className="text-gray-400 text-center mb-12">3 adımda profesyonel CV</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Şablon Seç', desc: 'Beğendiğin CV şablonunu seç' },
            { step: '2', title: 'Bilgileri Gir', desc: 'CV bilgilerini yaz veya mevcut CV\'ni yükle' },
            { step: '3', title: 'İndir', desc: 'Yapay zekanın oluşturduğu CV\'yi PDF olarak indir' }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-blue-600 rounded-3xl p-12 text-center">
          <h2 className="text-white text-3xl font-bold mb-4">Hemen başla, ücretsiz dene</h2>
          <p className="text-blue-100 mb-8">Yapay zeka ile dakikalar içinde profesyonel CV'ni oluştur</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all text-lg"
          >
            Ücretsiz CV Oluştur
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-6 text-center">
        <p className="text-gray-500 text-sm">© 2026 Resumind. Tüm hakları saklıdır.   Geliştirici Orhan Pala</p>
      </footer>

    </div>
  )
}