'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { CVComponents, colorOptions } from '../components/CVTemplates'
import LoadingAnimation from '../components/LoadingAnimation'

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
  const [translating, setTranslating] = useState(false)
  const [currentLang, setCurrentLang] = useState('tr')
  const [linkedinSummary, setLinkedinSummary] = useState(null)
  const [generatingLinkedin, setGeneratingLinkedin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState(null)
  const [shareLink, setShareLink] = useState(null)
  const [sharing, setSharing] = useState(false)
  const [referenceLetter, setReferenceLetter] = useState(null)
  const [generatingReference, setGeneratingReference] = useState(false)
  const [showReferenceForm, setShowReferenceForm] = useState(false)
  const [referenceInfo, setReferenceInfo] = useState({
    refName: '', refPosition: '', refCompany: '', relationship: ''
  })
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const router = useRouter()

  const CVComponent = CVComponents[template] || CVComponents.Modern

  const handleGenerate = async () => {
    if (!cvText) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${session?.access_token || ''}`
        },
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
        setShowMobilePreview(true)
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setLoading(false)
  }

  const handleDownloadPDF = () => {
    const element = document.getElementById('cv-preview')
    if (!element) return alert('CV önizlemesi bulunamadı. Önce CV oluşturun.')

    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try { return Array.from(sheet.cssRules).map(r => r.cssText).join('\n') }
        catch { return '' }
      }).join('\n')

    const win = window.open('', '_blank', 'width=900,height=700')
    win.document.write(`
      <!DOCTYPE html><html>
        <head>
          <meta charset="UTF-8">
          <title>${previewData.name || 'CV'} - Resumind</title>
          <style>
            ${styles}
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { margin: 0; padding: 0; background: white; }
            @page { margin: 0; size: A4; }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>
          ${element.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); window.close(); }, 600)
            }
          <\/script>
        </body>
      </html>`)
    win.document.close()
  }

  const handleTranslate = async (lang) => {
    if (!cvData) return
    setTranslating(true)
    try {
      const response = await fetch('/api/translate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, targetLanguage: lang === 'en' ? 'İngilizce' : 'Türkçe' })
      })
      const data = await response.json()
      if (data.success) { setCvData(data.translatedCV); setPreviewData(data.translatedCV); setCurrentLang(lang) }
      else alert('Hata: ' + data.error)
    } catch { alert('Bir hata oluştu') }
    setTranslating(false)
  }

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
    } catch { alert('Bir hata oluştu') }
    setScoring(false)
  }

  const handleLinkedinSummary = async () => {
    if (!cvData) return
    setGeneratingLinkedin(true)
    try {
      const response = await fetch('/api/linkedin-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData })
      })
      const data = await response.json()
      if (data.success) setLinkedinSummary(data.summary)
      else alert('Hata: ' + data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingLinkedin(false)
  }

  const handleReferenceLetter = async () => {
    if (!cvData || !referenceInfo.refName) return
    setGeneratingReference(true)
    try {
      const response = await fetch('/api/reference-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData, referenceInfo })
      })
      const data = await response.json()
      if (data.success) { setReferenceLetter(data.letter); setShowReferenceForm(false) }
      else alert('Hata: ' + data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingReference(false)
  }

  const handleEditSave = () => {
    const newData = JSON.parse(JSON.stringify(editData))
    setCvData(newData)
    setPreviewData(newData)
    setEditMode(false)
  }

  const handleShare = async () => {
    if (!cvData) return
    setSharing(true)
    try {
      const shareId = Math.random().toString(36).substring(2, 10)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: existingCV } = await supabase
          .from('cvs').select('id').eq('user_id', user.id).eq('template', template)
          .order('created_at', { ascending: false }).limit(1).single()
        if (existingCV) {
          await supabase.from('cvs').update({ share_id: shareId, is_shared: true }).eq('id', existingCV.id)
        }
        setShareLink(`${window.location.origin}/cv/${shareId}`)
      }
    } catch { alert('Hata oluştu') }
    setSharing(false)
  }

  const resetAll = () => {
    setCvData(null); setPreviewData(emptyCV); setMode(null)
    setScoreData(null); setLinkedinSummary(null); setReferenceLetter(null)
    setEditMode(false); setCvText(''); setShowMobilePreview(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">

        {/* ── SOL PANEL ── */}
        <div className="w-full lg:w-1/2 lg:max-w-xl bg-gray-950 px-4 sm:px-6 lg:px-8 py-6 lg:overflow-y-auto lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">

          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-all shrink-0"
            >
              ← Geri
            </button>
            <div>
              <h1 className="text-white text-xl font-bold leading-tight">CV Oluştur</h1>
              <p className="text-gray-500 text-xs">Yapay zeka CV'ni saniyeler içinde hazırlasın</p>
            </div>
          </div>

          {/* Şablon */}
          <div className="mb-4">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Şablon</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CVComponents).map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    template === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Renk */}
          <div className="mb-5">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Renk</p>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c.id ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Mod seçimi */}
          {!mode && !cvData && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setMode('upload')}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 text-left transition-all"
              >
                <div className="text-2xl mb-2">📄</div>
                <h3 className="text-white font-medium text-sm mb-0.5">CV Yükle</h3>
                <p className="text-gray-500 text-xs">PDF veya Word dosyası</p>
              </button>
              <button
                onClick={() => setMode('text')}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 text-left transition-all"
              >
                <div className="text-2xl mb-2">✏️</div>
                <h3 className="text-white font-medium text-sm mb-0.5">Bilgileri Yaz</h3>
                <p className="text-gray-500 text-xs">Kaba taslak yaz, AI tamamlasın</p>
              </button>
            </div>
          )}

          {/* Upload / Text */}
          {mode && !cvData && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-300 text-sm font-medium">
                  {mode === 'upload' ? 'CV dosyasını yükle' : 'Bilgilerini yaz'}
                </p>
                <button onClick={() => setMode(null)} className="text-gray-500 hover:text-white text-xs">← Geri</button>
              </div>

              {mode === 'upload' && (
                <div className="mb-4">
                  <label className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-900">
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
                          const res = await fetch('/api/parse-cv', { method: 'POST', body: formData })
                          const data = await res.json()
                          if (data.success) setCvText(data.text)
                          else alert('Dosya okunamadı: ' + data.error)
                        } catch { alert('Bir hata oluştu') }
                      }}
                    />
                  </label>
                  {cvText && (
                    <div className="mt-3 bg-green-900/30 border border-green-700 rounded-xl px-4 py-3">
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
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 h-48 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3"
                />
              )}

              {loading ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl">
                  <LoadingAnimation text="CV oluşturuluyor, lütfen bekleyin..." />
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!cvText}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  ✨ CV Oluştur
                </button>
              )}
            </div>
          )}

          {/* CV oluşturuldu */}
          {cvData && (
            <div className="space-y-2 pb-8">

              {/* Mobil önizleme toggle */}
              <button
                onClick={() => setShowMobilePreview(v => !v)}
                className="w-full lg:hidden bg-gray-800 hover:bg-gray-700 text-white text-sm py-2.5 rounded-xl transition-all"
              >
                {showMobilePreview ? '🙈 Önizlemeyi Gizle' : '👁 CV\'yi Gör'}
              </button>

              {showMobilePreview && (
                <div className="lg:hidden rounded-xl overflow-hidden border border-gray-800">
                  <CVComponent cvData={cvData} color={color} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button onClick={resetAll} className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-2.5 rounded-xl transition-all">
                  🔄 Yeniden
                </button>
                <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-xl transition-all font-medium">
                  📄 PDF İndir
                </button>
              </div>

              <button
                onClick={() => { const copy = JSON.parse(JSON.stringify(cvData)); setEditData(copy); setEditMode(v => !v) }}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2.5 rounded-xl transition-all"
              >
                ✏️ CV'yi Düzenle
              </button>

              <button
                onClick={handleShare}
                disabled={sharing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl transition-all"
              >
                {sharing ? '🔗 Oluşturuluyor...' : '🔗 CV\'yi Paylaş'}
              </button>

              {shareLink && (
                <div className="bg-gray-900 border border-green-700 rounded-xl p-3">
                  <p className="text-green-400 text-xs mb-2">✅ Paylaşım linki oluşturuldu!</p>
                  <div className="flex gap-2">
                    <input type="text" value={shareLink} readOnly className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none min-w-0" />
                    <button onClick={() => { navigator.clipboard.writeText(shareLink); alert('Link kopyalandı!') }} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg shrink-0">
                      Kopyala
                    </button>
                  </div>
                </div>
              )}

              {editMode && editData && (
                <div className="bg-gray-900 border border-yellow-700 rounded-xl p-4">
                  <p className="text-white font-medium text-sm mb-3">CV Bilgilerini Düzenle</p>
                  <div className="space-y-2">
                    {[
                      { key: 'name', label: 'Ad Soyad' },
                      { key: 'email', label: 'Email' },
                      { key: 'phone', label: 'Telefon' },
                      { key: 'location', label: 'Şehir' },
                    ].map(({ key, label }) => (
                      <input key={key} type="text" placeholder={label} value={editData[key] || ''}
                        onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500 text-sm" />
                    ))}
                    <textarea placeholder="Hakkımda" value={editData.summary || ''}
                      onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500 text-sm h-20 resize-none" />
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Beceriler (virgülle ayır)</p>
                      <input type="text" placeholder="Python, React, Node.js"
                        value={editData.skills?.join(', ') || ''}
                        onChange={(e) => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500 text-sm" />
                    </div>
                    {editData.experience?.map((exp, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3">
                        <p className="text-yellow-400 text-xs mb-2">Deneyim {i + 1}</p>
                        {[['position', 'Pozisyon'], ['company', 'Şirket'], ['duration', 'Süre']].map(([field, ph]) => (
                          <input key={field} type="text" placeholder={ph} value={exp[field] || ''}
                            onChange={(e) => { const n = [...editData.experience]; n[i] = { ...n[i], [field]: e.target.value }; setEditData({ ...editData, experience: n }) }}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-1.5 mb-1 outline-none text-xs" />
                        ))}
                      </div>
                    ))}
                    {editData.education?.map((edu, i) => (
                      <div key={i} className="bg-gray-800 rounded-lg p-3">
                        <p className="text-yellow-400 text-xs mb-2">Eğitim {i + 1}</p>
                        {[['school', 'Okul'], ['degree', 'Bölüm'], ['year', 'Yıl']].map(([field, ph]) => (
                          <input key={field} type="text" placeholder={ph} value={edu[field] || ''}
                            onChange={(e) => { const n = [...editData.education]; n[i] = { ...n[i], [field]: e.target.value }; setEditData({ ...editData, education: n }) }}
                            className="w-full bg-gray-700 text-white rounded-lg px-3 py-1.5 mb-1 outline-none text-xs" />
                        ))}
                      </div>
                    ))}
                  </div>
                  <button onClick={handleEditSave} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2.5 rounded-xl mt-3 transition-all">
                    ✅ Kaydet
                  </button>
                </div>
              )}

              {/* Araçlar */}
              <div className="pt-1">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Araçlar</p>
                <div className="space-y-2">
                  <button onClick={handleScoreCV} disabled={scoring}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl transition-all">
                    {scoring ? '🔍 Puanlanıyor...' : '⭐ CV\'yi Puanla'}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleTranslate('en')} disabled={translating || currentLang === 'en'}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs py-2.5 rounded-xl transition-all">
                      {translating ? '🌍...' : '🇬🇧 İngilizce'}
                    </button>
                    <button onClick={() => handleTranslate('tr')} disabled={translating || currentLang === 'tr'}
                      className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-xs py-2.5 rounded-xl transition-all">
                      {translating ? '🌍...' : '🇹🇷 Türkçe'}
                    </button>
                  </div>
                  <button onClick={handleLinkedinSummary} disabled={generatingLinkedin}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl transition-all">
                    {generatingLinkedin ? '⏳ Oluşturuluyor...' : '💼 LinkedIn Özeti'}
                  </button>
                  <button onClick={() => setShowReferenceForm(v => !v)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2.5 rounded-xl transition-all">
                    📝 Referans Mektubu
                  </button>
                </div>
              </div>

              {showReferenceForm && (
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <p className="text-white font-medium text-sm mb-3">Referans Veren Bilgileri</p>
                  <div className="space-y-2">
                    {[
                      { key: 'refName', ph: 'Referansın adı soyadı' },
                      { key: 'refPosition', ph: 'Referansın pozisyonu' },
                      { key: 'refCompany', ph: 'Referansın şirketi' },
                      { key: 'relationship', ph: 'İlişki (Eski müdürüm vb.)' },
                    ].map(({ key, ph }) => (
                      <input key={key} type="text" placeholder={ph} value={referenceInfo[key]}
                        onChange={(e) => setReferenceInfo({ ...referenceInfo, [key]: e.target.value })}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 text-sm" />
                    ))}
                  </div>
                  <button onClick={handleReferenceLetter} disabled={generatingReference || !referenceInfo.refName}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl mt-3 transition-all">
                    {generatingReference ? '⏳ Oluşturuluyor...' : '📝 Mektubu Oluştur'}
                  </button>
                </div>
              )}

              {scoreData && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold text-sm">CV Puanı</h3>
                    <div className={`text-xl font-bold ${(scoreData.totalScore ?? scoreData.toplam_puan) >= 80 ? 'text-green-400' : (scoreData.totalScore ?? scoreData.toplam_puan) >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {scoreData.totalScore ?? scoreData.toplam_puan ?? '—'}<span className="text-gray-500 text-xs font-normal">/100</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: 'İçerik', val: scoreData.contentScore },
                      { label: 'Profesyonellik', val: scoreData.professionalScore },
                      { label: 'Beceriler', val: scoreData.skillsScore },
                      { label: 'Deneyim', val: scoreData.experienceScore },
                    ].filter(x => x.val !== undefined).map(({ label, val }) => (
                      <div key={label} className="bg-gray-800 rounded-lg p-2">
                        <p className="text-gray-400 text-xs mb-1">{label}</p>
                        <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                          <div className={`h-1 rounded-full ${val >= 20 ? 'bg-green-500' : val >= 13 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(val / 25) * 100}%` }} />
                        </div>
                        <p className="text-white text-xs">{val}/25</p>
                      </div>
                    ))}
                  </div>
                  {scoreData.strengths?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-green-400 text-xs font-medium mb-1">💪 Güçlü Yönler</p>
                      {scoreData.strengths.map((item, i) => <p key={i} className="text-gray-400 text-xs">• {item}</p>)}
                    </div>
                  )}
                  {scoreData.improvements?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-yellow-400 text-xs font-medium mb-1">🔧 İyileştirme</p>
                      {scoreData.improvements.map((item, i) => <p key={i} className="text-gray-400 text-xs">• {item}</p>)}
                    </div>
                  )}
                  {scoreData.summary && <p className="text-gray-500 text-xs italic">{scoreData.summary}</p>}
                </div>
              )}

              {linkedinSummary && (
                <div className="bg-gray-900 border border-blue-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-sm">💼 LinkedIn Özeti</h3>
                    <button onClick={() => navigator.clipboard.writeText(linkedinSummary)} className="text-blue-400 text-xs border border-blue-800 px-2 py-1 rounded-lg">Kopyala</button>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{linkedinSummary}</p>
                </div>
              )}

              {referenceLetter && (
                <div className="bg-gray-900 border border-orange-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-bold text-sm">📝 Referans Mektubu</h3>
                    <button onClick={() => navigator.clipboard.writeText(referenceLetter)} className="text-orange-400 text-xs border border-orange-800 px-2 py-1 rounded-lg">Kopyala</button>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{referenceLetter}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SAĞ PANEL — sadece desktop ── */}
        <div className="hidden lg:flex flex-1 bg-gray-900 border-l border-gray-800 flex-col h-[calc(100vh-64px)] sticky top-16">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 shrink-0">
            <p className="text-gray-400 text-sm font-medium">Canlı Önizleme</p>
            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30">
              {template}
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <CVComponent cvData={cvData || previewData} color={color} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default function CreateCV() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16">
        <p className="text-white">Yükleniyor...</p>
      </div>
    }>
      <CreateCVContent />
    </Suspense>
  )
}
