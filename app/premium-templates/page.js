'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'

const premiumTemplates = [
  { id: 'elegant', name: 'Elegant', desc: 'Minimalist, kart bazlı tasarım', color: 'from-purple-600 to-pink-500' },
  { id: 'flat', name: 'Flat', desc: 'Düz, modern ve temiz', color: 'from-blue-600 to-cyan-500' },
  { id: 'stackoverflow', name: 'Stack Overflow', desc: 'Teknoloji odaklı, profesyonel', color: 'from-orange-500 to-yellow-500' },
]

function PremiumTemplatesContent() {
  const [selectedTemplate, setSelectedTemplate] = useState('elegant')
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [renderedHTML, setRenderedHTML] = useState(null)
  const [mode, setMode] = useState(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!cvText) return
    setLoading(true)
    try {
      const generateRes = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvContent: cvText, template: selectedTemplate, isRawText: mode === 'text' })
      })
      const generateData = await generateRes.json()

      if (!generateData.success) {
        alert('Hata: ' + generateData.error)
        setLoading(false)
        return
      }

      const renderRes = await fetch('/api/render-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData: generateData.cvData, theme: selectedTemplate })
      })
      const renderData = await renderRes.json()

      if (renderData.success) {
        setRenderedHTML(renderData.html)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('cvs').insert({
            user_id: user.id,
            template: selectedTemplate,
            cv_data: generateData.cvData
          })
        }
      } else {
        alert('Hata: ' + renderData.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setLoading(false)
  }

  const handlePrint = () => window.print()

  if (renderedHTML) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white text-2xl font-bold">CV Hazır! 🎉</h1>
            <div className="flex gap-3">
              <button onClick={() => setRenderedHTML(null)} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl">
                Yeniden Oluştur
              </button>
              <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">
                📄 PDF İndir
              </button>
            </div>
          </div>
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl"
            dangerouslySetInnerHTML={{ __html: renderedHTML }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm mb-8 flex items-center gap-2">
          ← Geri
        </button>

        <h1 className="text-white text-3xl font-bold mb-2">Premium Şablonlar</h1>
        <p className="text-gray-400 text-sm mb-8">JSON Resume temaları ile profesyonel CV oluştur</p>

        {/* Şablon Seç */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {premiumTemplates.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`rounded-2xl p-6 cursor-pointer transition-all border-2 ${selectedTemplate === t.id ? 'border-blue-500 bg-gray-800' : 'border-gray-800 bg-gray-900 hover:border-gray-600'}`}
            >
              <div className={`w-full h-24 rounded-xl bg-gradient-to-r ${t.color} mb-4 flex items-center justify-center`}>
                <p className="text-white font-bold text-lg">{t.name}</p>
              </div>
              <h3 className="text-white font-semibold mb-1">{t.name}</h3>
              <p className="text-gray-400 text-xs">{t.desc}</p>
              {selectedTemplate === t.id && (
                <p className="text-blue-400 text-xs mt-2">✓ Seçildi</p>
              )}
            </div>
          ))}
        </div>

        {/* Mod Seç */}
        {!mode && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => setMode('upload')} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-6 text-left transition-all">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="text-white font-medium mb-1 text-sm">CV Yükle</h3>
              <p className="text-gray-400 text-xs">PDF veya Word dosyası yükle</p>
            </button>
            <button onClick={() => setMode('text')} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-6 text-left transition-all">
              <div className="text-2xl mb-2">✏️</div>
              <h3 className="text-white font-medium mb-1 text-sm">Bilgileri Yaz</h3>
              <p className="text-gray-400 text-xs">Kaba taslak yaz, AI tamamlasın</p>
            </button>
          </div>
        )}

        {mode && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-300 text-sm font-medium">
                {mode === 'upload' ? 'CV dosyasını yükle' : 'Bilgilerini yaz'}
              </p>
              <button onClick={() => setMode(null)} className="text-gray-500 hover:text-white text-xs">Geri</button>
            </div>

            {mode === 'upload' && (
              <div className="mb-4">
                <label className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-900">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-white text-sm font-medium mb-1">PDF veya Word dosyası seç</p>
                  <p className="text-gray-500 text-xs">.pdf, .doc, .docx desteklenir</p>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append('file', file)
                    try {
                      const res = await fetch('/api/parse-cv', { method: 'POST', body: formData })
                      const data = await res.json()
                      if (data.success) setCvText(data.text)
                      else alert('Dosya okunamadı: ' + data.error)
                    } catch (err) {
                      alert('Bir hata oluştu')
                    }
                  }} />
                </label>
                {cvText && (
                  <div className="mt-3 bg-green-900 bg-opacity-30 border border-green-700 rounded-xl px-4 py-3">
                    <p className="text-green-400 text-sm">✅ Dosya okundu! CV oluşturmaya hazır.</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'text' && (
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Örnek: Adım Ahmet, yazılım geliştirici olarak 3 yıl çalıştım..."
                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 h-64 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3"
              />
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !cvText}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-4 rounded-xl transition-all text-lg"
            >
              {loading ? '✨ CV Oluşturuluyor...' : '✨ CV Oluştur'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PremiumTemplates() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>}>
      <PremiumTemplatesContent />
    </Suspense>
  )
}