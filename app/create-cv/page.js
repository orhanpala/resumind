'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { CVComponents, colorOptions } from '../components/CVTemplates'

const emptyCV = {
  name: '', email: '', phone: '', location: '', summary: '',
  experience: [], education: [], skills: []
}

function CreateCVContent() {
  const searchParams = useSearchParams()
  const initialTemplate = searchParams.get('template') || 'Modern'
  const [template, setTemplate] = useState(initialTemplate)
  const [color, setColor] = useState('blue')
  const [mode, setMode] = useState(null)
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData] = useState(null)
  const [previewData, setPreviewData] = useState(emptyCV)
  const [scoreData, setScoreData] = useState(null)
  const [scoring, setScoring] = useState(false)
  const router = useRouter()

  const CVComponent = CVComponents[template] || CVComponents.Modern

  const handleGenerate = async () => {
    if (!cvText) return
    setLoading(true)
    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvContent: cvText, template, isRawText: mode === 'text' })
      })
      const data = await response.json()
      if (data.success) {
        setCvData(data.cvData)
        setPreviewData(data.cvData)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('cvs').insert({
            user_id: user.id,
            template,
            cv_data: data.cvData
          })
        }
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setLoading(false)
  }

  const handleDownloadPDF = () => window.print()
  const handleScoreCV = async () => {
    if (!cvData) return
    setScoring(true)
    try {
      const response = await fetch('/api/score-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData })
      })
      const data = await response.json()
      if (data.success) setScoreData(data.scoreData)
      else alert('Hata: ' + data.error)
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setScoring(false)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex h-screen">

        {/* Sol Panel - Form */}
        <div className="w-full md:w-1/2 bg-gray-950 overflow-y-auto p-8 border-r border-gray-800">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2">
            ← Geri
          </button>

          <h1 className="text-white text-2xl font-bold mb-1">CV Oluştur</h1>
          <p className="text-gray-400 text-sm mb-6">Yapay zeka CV'ni saniyeler içinde hazırlasın</p>

          {/* Şablon Seç */}
          <div className="mb-4">
            <p className="text-gray-300 text-sm font-medium mb-3">Şablon</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CVComponents).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${template === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Renk Seç */}
          <div className="mb-6">
            <p className="text-gray-300 text-sm font-medium mb-3">Renk</p>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c.id ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Mod Seç */}
          {!mode && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setMode('upload')}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 text-left transition-all"
              >
                <div className="text-2xl mb-2">📄</div>
                <h3 className="text-white font-medium mb-1 text-sm">CV Yükle</h3>
                <p className="text-gray-400 text-xs">PDF veya Word dosyası yükle</p>
              </button>
              <button
                onClick={() => setMode('text')}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 text-left transition-all"
              >
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
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append('file', file)
                        try {
                          const res = await fetch('/api/parse-cv', {
                            method: 'POST',
                            body: formData
                          })
                          const data = await res.json()
                          if (data.success) setCvText(data.text)
                          else alert('Dosya okunamadı: ' + data.error)
                        } catch (err) {
                          alert('Bir hata oluştu')
                        }
                      }}
                    />
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
                  placeholder="Örnek: Adım Ahmet, yazılım geliştirici olarak 3 yıl çalıştım, Python ve React biliyorum, İstanbul Üniversitesi mezunuyum..."
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 h-72 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3"
                />
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !cvText}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
              >
                {loading ? '✨ CV Oluşturuluyor...' : '✨ CV Oluştur'}
              </button>
            </div>
          )}

          {cvData && (
            <div className="mt-4">
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => { setCvData(null); setPreviewData(emptyCV); setMode(null) }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-3 rounded-xl"
                >
                  Yeniden Oluştur
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-3 rounded-xl"
                >
                  📄 PDF İndir
                </button>
                {scoreData && (
            <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">CV Puanı</h3>
                <div className="flex items-center gap-2">
                  <div className={`text-3xl font-bold ${scoreData.toplam_puan >= 80 ? 'text-green-400' : scoreData.toplam_puan >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {scoreData.toplam_puan}
                  </div>
                  <span className="text-gray-400 text-sm">/100</span>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {Object.entries(scoreData.kategoriler).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300 text-xs capitalize">{key}</span>
                      <span className="text-gray-400 text-xs">{val.puan}/100</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${val.puan >= 80 ? 'bg-green-500' : val.puan >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${val.puan}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-3">
                <p className="text-green-400 text-xs font-medium mb-1">💪 Güçlü Yönler</p>
                {scoreData.güçlü_yönler.map((item, i) => (
                  <p key={i} className="text-gray-400 text-xs">• {item}</p>
                ))}
              </div>
              <div className="mb-3">
                <p className="text-yellow-400 text-xs font-medium mb-1">🔧 İyileştirme Önerileri</p>
                {scoreData.iyileştirme_önerileri.map((item, i) => (
                  <p key={i} className="text-gray-400 text-xs">• {item}</p>
                ))}
              </div>
              <p className="text-gray-500 text-xs italic">{scoreData.genel_yorum}</p>
            </div>
          )}
                <button
                onClick={handleScoreCV}
                disabled={scoring}
                className="w-full mt-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-3 rounded-xl transition-all"
              >
                {scoring ? '🔍 Puanlanıyor...' : '⭐ CV\'yi Puanla'}
              </button>
              </div>
              {/* Mobilde CV önizleme */}
              <div className="md:hidden rounded-xl overflow-auto">
                <CVComponent cvData={cvData} color={color} />
              </div>
            </div>
          )}
        </div>

        {/* Sağ Panel - Canlı Önizleme */}
        <div className="hidden md:flex w-1/2 bg-gray-900 p-8 flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm font-medium">Canlı Önizleme</p>
            <span className="text-xs bg-blue-600 bg-opacity-20 text-blue-400 px-2 py-1 rounded-full border border-blue-600 border-opacity-30">{template}</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl">
            <CVComponent cvData={previewData} color={color} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default function CreateCV() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>}>
      <CreateCVContent />
    </Suspense>
  )
}