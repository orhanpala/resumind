'use client'
import { useState } from 'react'

const faqs = [
  { soru: 'Resumind ücretsiz mi?', cevap: 'Evet, temel özellikler ücretsiz kullanılabilir. İleri özellikler için premium plan mevcuttur.' },
  { soru: 'Hangi dosya formatlarını destekliyorsunuz?', cevap: 'PDF ve Word (.docx) formatlarını destekliyoruz. Oluşturulan CV\'leri PDF olarak indirebilirsiniz.' },
  { soru: 'CV\'mi kaç şablonla oluşturabilirim?', cevap: '12 farklı profesyonel şablon ve 5 renk seçeneği ile 60 farklı kombinasyon oluşturabilirsiniz.' },
  { soru: 'Verilerим güvende mi?', cevap: 'Evet, tüm verileriniz şifreli olarak saklanır ve sadece siz erişebilirsiniz.' },
  { soru: 'CV\'mi İngilizceye çevirebilir miyim?', cevap: 'Evet, yapay zeka ile CV\'nizi otomatik olarak İngilizceye çevirebilirsiniz.' },
  { soru: 'LinkedIn özeti oluşturabilir miyim?', cevap: 'Evet, CV bilgilerinizden otomatik olarak profesyonel bir LinkedIn profil özeti oluşturabilirsiniz.' },
]

export default function IletisimPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [form, setForm] = useState({ isim: '', email: '', mesaj: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    if (!form.isim || !form.email || !form.mesaj) return
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20">

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-white text-4xl font-bold mb-4">İletişim</h1>
        <p className="text-gray-400 text-lg">Sorularınız için buradayız. Size en kısa sürede dönüş yapacağız.</p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

          {/* İletişim Formu */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">Bize Yazın</h2>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-white text-xl font-bold mb-2">Mesajınız Alındı!</h3>
                <p className="text-gray-400">En kısa sürede size dönüş yapacağız.</p>
                <button onClick={() => { setSent(false); setForm({ isim: '', email: '', mesaj: '' }) }} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
                  Yeni mesaj gönder
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Adınız Soyadınız"
                  value={form.isim}
                  onChange={(e) => setForm({ ...form, isim: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email adresiniz"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <textarea
                  placeholder="Mesajınız..."
                  value={form.mesaj}
                  onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm h-32 resize-none"
                />
                <button
                  onClick={handleSubmit}
                  disabled={!form.isim || !form.email || !form.mesaj}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Gönder
                </button>
              </div>
            )}
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-4">
              <h2 className="text-white text-2xl font-bold mb-6">İletişim Bilgileri</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Email</p>
                    <p className="text-white text-sm">destek@resumind.com.tr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Website</p>
                    <p className="text-white text-sm">www.resumind.com.tr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest">Yanıt Süresi</p>
                    <p className="text-white text-sm">24 saat içinde</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sosyal Medya */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h3 className="text-white font-bold mb-4">Sosyal Medya</h3>
              <div className="flex gap-3">
                {[
                  { name: 'Twitter', icon: '𝕏', color: 'bg-gray-800 hover:bg-gray-700' },
                  { name: 'LinkedIn', icon: 'in', color: 'bg-blue-800 hover:bg-blue-700' },
                  { name: 'Instagram', icon: '📸', color: 'bg-pink-800 hover:bg-pink-700' },
                ].map((social) => (
                  <button key={social.name} className={`${social.color} text-white text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-2`}>
                    <span>{social.icon}</span>
                    <span>{social.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SSS */}
        <div>
          <h2 className="text-white text-2xl font-bold mb-8 text-center">Sıkça Sorulan Sorular</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <p className="text-white font-medium text-sm">{faq.soru}</p>
                  <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 border-t border-gray-800">
                    <p className="text-gray-400 text-sm leading-relaxed pt-3">{faq.cevap}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}