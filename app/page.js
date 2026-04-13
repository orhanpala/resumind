'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './lib/supabase'

/* ─── Template mini-previews ─────────────────────────────── */
const TEMPLATES = [
  { id:'Modern',    color:'#2563EB', gradient:'from-blue-600 to-blue-400',   label:'Modern'    },
  { id:'Elegant',   color:'#d97706', gradient:'from-amber-600 to-amber-400', label:'Elegant'   },
  { id:'Teknoloji', color:'#16a34a', gradient:'from-green-600 to-green-800', label:'Teknoloji' ,dark:true},
  { id:'Kreatif',   color:'#9333ea', gradient:'from-purple-600 to-pink-500', label:'Kreatif'   },
  { id:'Sidebar',   color:'#0f766e', gradient:'from-teal-700 to-slate-800',  label:'Sidebar'   },
  { id:'Minimal',   color:'#374151', gradient:'from-gray-700 to-gray-500',   label:'Minimal'   },
]

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    ),
    title: 'Yapay Zeka ile Üret',
    desc: "Kısa notlar yaz, AI profesyonel bir CV'ye dönüştürsün. Eksikleri tamamlar, dili güçlendirir.",
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
      </svg>
    ),
    title: "CV'ni Yükle, Dönüştür",
    desc: "PDF veya Word dosyasını yükle. AI okur, yapılandırır ve istediğin şablona uyarlar.",
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"/>
      </svg>
    ),
    title: '12 Profesyonel Şablon',
    desc: 'Yazılımcıdan akademisyene, yaratıcıdan yöneticiye — her profile özel tasarımlar.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.499z"/>
      </svg>
    ),
    title: 'Tasarım Kontrolü',
    desc: 'Yazı tipi, yoğunluk, başlık stili, renk ve bölüm sırası — her detay senin elinde.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/>
      </svg>
    ),
    title: 'Paylaş & İndir',
    desc: "CV'ni tek tıkla PDF olarak indir ya da benzersiz link ile herkesle paylaş.",
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
      </svg>
    ),
    title: 'AI Araç Paketi',
    desc: 'CV puanlama, LinkedIn özeti, referans mektubu ve dil çevirisi — hepsi dahil.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
  },
]

const STEPS = [
  { n:'01', title:'Yöntemini Seç',      desc:"Mevcut CV'ni yükle veya kısa notlar yaz."      },
  { n:'02', title:'AI Oluştursun',      desc:"Yapay zeka saniyeler içinde CV'ni hazırlar."    },
  { n:'03', title:'Tasarımı Ayarla',    desc:'Şablon, renk, font ve bölüm sırasını özelleştir.' },
  { n:'04', title:'İndir & Paylaş',     desc:'PDF indir veya link ile paylaş, işe başvur.'   },
]

/* ─── Mini CV card preview ────────────────────────────────── */
function TemplateCard({ t }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer group`}
      style={{background: t.dark ? '#111827' : '#fff'}}>
      {/* header strip */}
      <div className={`bg-gradient-to-r ${t.gradient} px-4 py-3`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${t.dark?'bg-green-400/20':'bg-white/20'} flex items-center justify-center`}>
            <div className={`w-4 h-4 rounded-full ${t.dark?'bg-green-400':'bg-white/60'}`}/>
          </div>
          <div>
            <div className={`h-2 ${t.dark?'bg-green-400':'bg-white/80'} rounded w-20 mb-1`}/>
            <div className={`h-1.5 ${t.dark?'bg-green-700':'bg-white/40'} rounded w-14`}/>
          </div>
        </div>
      </div>
      {/* body */}
      <div className="px-4 py-3 space-y-2">
        <div className={`h-1.5 ${t.dark?'bg-gray-700':'bg-gray-200'} rounded w-1/3`}/>
        <div className={`h-1 ${t.dark?'bg-gray-800':'bg-gray-100'} rounded w-full`}/>
        <div className={`h-1 ${t.dark?'bg-gray-800':'bg-gray-100'} rounded w-5/6`}/>
        <div className={`h-1 ${t.dark?'bg-gray-800':'bg-gray-100'} rounded w-4/6`}/>
        <div className="pt-1">
          <div className={`h-1.5 ${t.dark?'bg-gray-700':'bg-gray-200'} rounded w-1/4 mb-1.5`}/>
          <div className="flex gap-1 flex-wrap">
            {[12,16,10].map((w,i)=>(
              <div key={i} style={{width:`${w*4}px`}} className={`h-4 ${t.dark?'bg-green-900 border border-green-800':'bg-gray-100'} rounded-md`}/>
            ))}
          </div>
        </div>
      </div>
      {/* overlay on hover */}
      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-all bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
          Şablonu Seç
        </span>
      </div>
      {/* label */}
      <div className="absolute bottom-2 right-2">
        <span className="text-[10px] font-medium text-gray-500 bg-gray-900/80 px-2 py-0.5 rounded-full">{t.label}</span>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════ */
export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleCTA = () => router.push(user ? '/dashboard' : '/login')

  return (
    /* pt-16 = navbar yüksekliği — duplicate nav KALDIRILDI */
    <main className="min-h-screen bg-[#050810] text-white pt-16 overflow-x-hidden">

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 text-center">

        {/* Arka plan ışığı */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"/>
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-purple-600/8 rounded-full blur-3xl"/>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-600/8 rounded-full blur-3xl"/>
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',backgroundSize:'60px 60px'}}/>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs sm:text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"/>
            Yapay Zeka Destekli CV Oluşturucu
          </div>

          {/* Başlık */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
            Hayalindeki işe<br/>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              saniyeler içinde
            </span>{' '}başvur
          </h1>

          {/* Alt yazı */}
          <p className="text-gray-400 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            CV'ni yükle ya da kısa notlar yaz — yapay zeka{' '}
            <span className="text-white font-medium">profesyonel bir CV</span> oluştursun.
            12 şablon, sınırsız özelleştirme, anında PDF.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <button
              onClick={handleCTA}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all text-base shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0">
              Ücretsiz Başla →
            </button>
            <button
              onClick={() => document.getElementById('templates')?.scrollIntoView({behavior:'smooth'})}
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-8 py-4 rounded-2xl transition-all text-base">
              Şablonları Gör
            </button>
          </div>

          {/* İstatistikler */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {[
              { val:'12',       label:'CV Şablonu'        },
              { val:'%100',     label:'Ücretsiz'          },
              { val:'AI',       label:'Destekli İçerik'   },
              { val:'PDF',      label:'Anında İndir'      },
            ].map((s,i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-white">{s.val}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll arrow */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
          </svg>
        </div>
      </section>

      {/* ── ŞABLONLAR ──────────────────────────────────────── */}
      <section id="templates" className="max-w-6xl mx-auto px-4 py-20 sm:py-28">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">12 Şablon</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Her profile özel tasarım</h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            Yazılımcıdan akademisyene, yaratıcıdan yöneticiye — sektörüne uygun şablonu seç.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10">
          {TEMPLATES.map(t => (
            <div key={t.id} onClick={handleCTA}>
              <TemplateCard t={t}/>
            </div>
          ))}
        </div>

        {/* Tasarım sistemi tanıtımı */}
        <div className="bg-white/3 border border-white/8 rounded-3xl p-6 sm:p-8">
          <p className="text-gray-400 text-xs sm:text-sm font-medium uppercase tracking-widest mb-4 text-center">Tasarım Kontrol Paneli</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              '🔤 Yazı Tipi',
              '📏 Satır Yoğunluğu',
              '🎨 Başlık Stili',
              '💡 Renk Yoğunluğu',
              '─ Öğe Ayırıcısı',
              '↕ Bölüm Sırası (D&D)',
              '📷 Fotoğraf Editörü',
              '🎭 5 Filtre Preseti',
            ].map((item, i) => (
              <span key={i} className="bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm px-3 py-1.5 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖZELLİKLER ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">Neden Resumind?</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Bir araçtan fazlası</h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto">
            CV oluşturmanın ötesinde — AI araç paketi ile iş başvurunu uçtan uca yönet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className={`${f.bg} border rounded-2xl p-5 sm:p-6 hover:border-opacity-60 transition-all hover:-translate-y-0.5`}>
              <div className={`${f.color} mb-4`}>{f.icon}</div>
              <h3 className="text-white font-semibold text-base sm:text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Nasıl Çalışır?</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">4 adımda profesyonel CV</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative">
          {/* Connecting line — desktop only */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"/>

          {STEPS.map((s, i) => (
            <div key={i} className="relative bg-white/3 border border-white/8 rounded-2xl p-5 sm:p-6 text-center hover:border-white/15 transition-all">
              <div className="w-12 h-12 bg-blue-600/15 border border-blue-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-sm">{s.n}</span>
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI ARAÇLAR BANNER ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-gradient-to-r from-blue-600/15 via-purple-600/10 to-cyan-600/15 border border-white/8 rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">AI Araç Paketi</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">CV'den fazlası</h3>
              <p className="text-gray-400 text-sm sm:text-base max-w-md">CV puanlama, LinkedIn özeti üretimi, referans mektubu ve dil çevirisi — tamamı tek platformda.</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:gap-2 justify-center shrink-0">
              {['⭐ CV Puanlama', '💼 LinkedIn Özeti', '📝 Referans Mektubu', '🌍 Dil Çevirisi'].map((item,i) => (
                <span key={i} className="bg-white/10 border border-white/10 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-20 sm:py-28 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600/15 rounded-full blur-3xl scale-75"/>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Özgeçmişin seni<br/>temsil etsin
            </h2>
            <p className="text-gray-400 text-base sm:text-lg mb-10 max-w-md mx-auto">
              Dakikalar içinde profesyonel bir CV oluştur. Kredi kartı gerekmez.
            </p>
            <button
              onClick={handleCTA}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-2xl transition-all text-base sm:text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0">
              Hemen Ücretsiz Başla →
            </button>
            <p className="text-gray-600 text-sm mt-4">Kayıt süresi: ~30 saniye</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-gray-800/60 px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">Resumind</span>
            <span className="text-gray-600 text-sm">— Yapay Zeka Destekli CV</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/pricing')} className="text-gray-500 hover:text-white text-sm transition-all">Ücretlendirme</button>
            <button onClick={() => router.push('/blog')} className="text-gray-500 hover:text-white text-sm transition-all">Blog</button>
            <button onClick={() => router.push('/contact')} className="text-gray-500 hover:text-white text-sm transition-all">İletişim</button>
          </div>
          <p className="text-gray-600 text-xs">© 2025 Resumind. Tüm hakları saklıdır.</p>
        </div>
      </footer>

    </main>
  )
}
