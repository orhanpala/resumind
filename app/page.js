'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <h1 className="text-white text-xl font-bold">Resumind</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="text-gray-400 hover:text-white text-sm transition-all"
          >
            Giriş Yap
          </button>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
          >
            Ücretsiz Başla
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-block bg-blue-600 bg-opacity-20 text-blue-400 text-sm px-4 py-1 rounded-full mb-6 border border-blue-600 border-opacity-30">
          ✨ Yapay Zeka Destekli CV Oluşturucu
        </div>
        <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight mb-6">
          Hayalindeki işe<br />
          <span className="text-blue-500">saniyeler içinde</span> başvur
        </h1>
        <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          Yapay zeka CV'ni otomatik oluşturur, düzenler ve profesyonel şablonlara uyarlar. Sadece bilgilerini yaz, gerisini biz halledelim.
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
      </div>

      {/* Özellikler */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-white text-3xl font-bold text-center mb-4">Neden Resumind?</h2>
        <p className="text-gray-400 text-center mb-12">Diğer CV araçlarından farkımız</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Saniyeler İçinde',
              desc: 'Bilgilerini yaz, yapay zeka profesyonel CV\'ni anında oluştursun'
            },
            {
              icon: '🎨',
              title: 'Profesyonel Şablonlar',
              desc: 'Modern, Klasik ve Minimal olmak üzere 3 farklı profesyonel tasarım'
            },
            {
              icon: '📄',
              title: 'PDF İndir',
              desc: 'Oluşturduğun CV\'yi tek tıkla PDF olarak indir, hemen kullan'
            },
            {
              icon: '🤖',
              title: 'Akıllı Doldurma',
              desc: 'Az bilgi verdiysen yapay zeka eksikleri tamamlar, CV\'ni dolgun gösterir'
            },
            {
              icon: '🔄',
              title: 'Mevcut CV\'ni Dönüştür',
              desc: 'Eski CV\'ni yapıştır, yapay zeka yeniden düzenleyip güzelleştirsin'
            },
            {
              icon: '🔒',
              title: 'Güvenli',
              desc: 'Bilgilerin şifreli ve güvende, sadece sen erişebilirsin'
            }
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
      <div className="max-w-5xl mx-auto px-6 py-20 border-t border-gray-800">
        <h2 className="text-white text-3xl font-bold text-center mb-4">Nasıl Çalışır?</h2>
        <p className="text-gray-400 text-center mb-12">3 adımda profesyonel CV</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Şablon Seç', desc: 'Beğendiğin CV şablonunu seç' },
            { step: '2', title: 'Bilgileri Gir', desc: 'CV bilgilerini yaz veya mevcut CV\'ni yapıştır' },
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
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-blue-600 rounded-3xl p-12 text-center">
          <h2 className="text-white text-3xl font-bold mb-4">Hemen başla, ücretsiz dene</h2>
          <p className="text-blue-100 mb-8">Binlerce kullanıcı Resumind ile iş buldu</p>
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
        <p className="text-gray-500 text-sm">© 2025 Resumind. Tüm hakları saklıdır.</p>
      </footer>

    </div>
  )
}