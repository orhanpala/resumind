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
  const [referenceLetter, setReferenceLetter] = useState(null)
  const [generatingReference, setGeneratingReference] = useState(false)
  const [showReferenceForm, setShowReferenceForm] = useState(false)
  const [referenceInfo, setReferenceInfo] = useState({
    refName: '', refPosition: '', refCompany: '', relationship: ''
  })
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
      if (data.success) {
        setCvData(data.translatedCV)
        setPreviewData(data.translatedCV)
        setCurrentLang(lang)
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
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
    } catch (error) {
      alert('Bir hata oluştu')
    }
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
    } catch (error) {
      alert('Bir hata oluştu')
    }
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
      if (data.success) {
        setReferenceLetter(data.letter)
        setShowReferenceForm(false)
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setGeneratingReference(false)
  }

  const handleEditSave = () => {
    const newData = JSON.parse(JSON.stringify(editData))
    setCvData(newData)
    setPreviewData(newData)
    setEditMode(false)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex h-screen">
        <div className="w-full md:w-1/2 bg-gray-950 overflow-y-auto p-8 border-r border-gray-800">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-2">← Geri</button>
          <h1 className="text-white text-2xl font-bold mb-1">CV Oluştur</h1>
          <p className="text-gray-400 text-sm mb-6">Yapay zeka CV'ni saniyeler içinde hazırlasın</p>
          <div className="mb-4">
            <p className="text-gray-300 text-sm font-medium mb-3">Şablon</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(CVComponents).map((t) => (
                <button key={t} onClick={() => setTemplate(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${template === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-gray-300 text-sm font-medium mb-3">Renk</p>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button key={c.id} onClick={() => setColor(c.id)} title={c.label} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c.id ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>
          {!mode && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button onClick={() => setMode('upload')} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 text-left transition-all">
                <div className="text-2xl mb-2">📄</div>
                <h3 className="text-white font-medium mb-1 text-sm">CV Yükle</h3>
                <p className="text-gray-400 text-xs">PDF veya Word dosyası yükle</p>
              </button>
              <button onClick={() => setMode('text')} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 text-left transition-all">
                <div className="text-2xl mb-2">✏️</div>
                <h3 className="text-white font-medium mb-1 text-sm">Bilgileri Yaz</h3>
                <p className="text-gray-400 text-xs">Kaba taslak yaz, AI tamamlasın</p>
              </button>
            </div>
          )}
          {mode && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-300 text-sm font-medium">{mode === 'upload' ? 'CV dosyasını yükle' : 'Bilgilerini yaz'}</p>
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
                <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder="Örnek: Adım Ahmet, yazılım geliştirici olarak 3 yıl çalıştım..." className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 h-72 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3" />
              )}
             {loading ? (
                <div className="mt-3 bg-gray-900 border border-gray-800 rounded-2xl">
                  <LoadingAnimation text="CV oluşturuluyor, lütfen bekleyin..." />
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!cvText}
                  className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
                >
                  ✨ CV Oluştur
                </button>
              )}
            </div>
          )}
          {cvData && (
            <div className="mt-4">
              <div className="flex gap-3 mb-2">
                <button onClick={() => { setCvData(null); setPreviewData(emptyCV); setMode(null); setScoreData(null); setLinkedinSummary(null); setReferenceLetter(null); setEditMode(false) }} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm py-3 rounded-xl">Yeniden Oluştur</button>
                <button onClick={handleDownloadPDF} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-3 rounded-xl">📄 PDF İndir</button>
              </div>
              <button onClick={() => { const copy = JSON.parse(JSON.stringify(cvData)); setEditData(copy); setEditMode(prev => !prev) }} className="w-full mb-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-3 rounded-xl transition-all">
                ✏️ CV'yi Düzenle
              </button>
              {editMode && editData && (
                <div className="bg-gray-900 border border-yellow-700 rounded-2xl p-5 mb-2">
                  <p className="text-white font-medium text-sm mb-3">CV Bilgilerini Düzenle</p>
                  <input type="text" placeholder="Ad Soyad" value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
                  <input type="text" placeholder="Email" value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
                  <input type="text" placeholder="Telefon" value={editData.phone || ''} onChange={(e) => setEditData({...editData, phone: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
                  <input type="text" placeholder="Şehir" value={editData.location || ''} onChange={(e) => setEditData({...editData, location: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
                  <textarea placeholder="Hakkımda" value={editData.summary || ''} onChange={(e) => setEditData({...editData, summary: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-yellow-500 text-sm h-20 resize-none" />
                  <p className="text-gray-400 text-xs mb-2">Beceriler (virgülle ayır)</p>
                  <input type="text" placeholder="Python, React, Node.js" value={editData.skills?.join(', ') || ''} onChange={(e) => setEditData({...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-3 outline-none focus:ring-2 focus:ring-yellow-500 text-sm" />
                  {editData.experience?.map((exp, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-3 mb-2">
                      <p className="text-yellow-400 text-xs mb-2">Deneyim {i + 1}</p>
                      <input type="text" placeholder="Pozisyon" value={exp.position || ''} onChange={(e) => { const newExp = [...editData.experience]; newExp[i] = {...newExp[i], position: e.target.value}; setEditData({...editData, experience: newExp}) }} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mb-1 outline-none text-xs" />
                      <input type="text" placeholder="Şirket" value={exp.company || ''} onChange={(e) => { const newExp = [...editData.experience]; newExp[i] = {...newExp[i], company: e.target.value}; setEditData({...editData, experience: newExp}) }} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mb-1 outline-none text-xs" />
                      <input type="text" placeholder="Süre" value={exp.duration || ''} onChange={(e) => { const newExp = [...editData.experience]; newExp[i] = {...newExp[i], duration: e.target.value}; setEditData({...editData, experience: newExp}) }} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 outline-none text-xs" />
                    </div>
                  ))}
                  {editData.education?.map((edu, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-3 mb-2">
                      <p className="text-yellow-400 text-xs mb-2">Eğitim {i + 1}</p>
                      <input type="text" placeholder="Okul" value={edu.school || ''} onChange={(e) => { const newEdu = [...editData.education]; newEdu[i] = {...newEdu[i], school: e.target.value}; setEditData({...editData, education: newEdu}) }} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mb-1 outline-none text-xs" />
                      <input type="text" placeholder="Bölüm" value={edu.degree || ''} onChange={(e) => { const newEdu = [...editData.education]; newEdu[i] = {...newEdu[i], degree: e.target.value}; setEditData({...editData, education: newEdu}) }} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 mb-1 outline-none text-xs" />
                      <input type="text" placeholder="Yıl" value={edu.year || ''} onChange={(e) => { const newEdu = [...editData.education]; newEdu[i] = {...newEdu[i], year: e.target.value}; setEditData({...editData, education: newEdu}) }} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 outline-none text-xs" />
                    </div>
                  ))}
                  <button onClick={handleEditSave} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-3 rounded-xl mt-2 transition-all">✅ Değişiklikleri Kaydet</button>
                </div>
              )}
              <button onClick={handleScoreCV} disabled={scoring} className="w-full mb-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-3 rounded-xl transition-all">
                {scoring ? '🔍 Puanlanıyor...' : '⭐ CV\'yi Puanla'}
              </button>
              <div className="flex gap-2 mb-2">
                <button onClick={() => handleTranslate('en')} disabled={translating || currentLang === 'en'} className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-3 rounded-xl transition-all">
                  {translating ? '🌍 Çevriliyor...' : '🇬🇧 İngilizce'}
                </button>
                <button onClick={() => handleTranslate('tr')} disabled={translating || currentLang === 'tr'} className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white text-sm py-3 rounded-xl transition-all">
                  {translating ? '🌍 Çevriliyor...' : '🇹🇷 Türkçe'}
                </button>
              </div>
              <button onClick={handleLinkedinSummary} disabled={generatingLinkedin} className="w-full mb-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm py-3 rounded-xl transition-all">
                {generatingLinkedin ? '⏳ Oluşturuluyor...' : '💼 LinkedIn Özeti Oluştur'}
              </button>
              <button onClick={() => setShowReferenceForm(!showReferenceForm)} className="w-full mb-2 bg-orange-600 hover:bg-orange-700 text-white text-sm py-3 rounded-xl transition-all">
                📝 Referans Mektubu Oluştur
              </button>
              {showReferenceForm && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-2">
                  <p className="text-white font-medium text-sm mb-3">Referans Veren Bilgileri</p>
                  <input type="text" placeholder="Referansın adı soyadı" value={referenceInfo.refName} onChange={(e) => setReferenceInfo({...referenceInfo, refName: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  <input type="text" placeholder="Referansın pozisyonu" value={referenceInfo.refPosition} onChange={(e) => setReferenceInfo({...referenceInfo, refPosition: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  <input type="text" placeholder="Referansın şirketi" value={referenceInfo.refCompany} onChange={(e) => setReferenceInfo({...referenceInfo, refCompany: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-2 outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  <input type="text" placeholder="İlişki (Eski müdürüm, İş arkadaşım vb.)" value={referenceInfo.relationship} onChange={(e) => setReferenceInfo({...referenceInfo, relationship: e.target.value})} className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 mb-3 outline-none focus:ring-2 focus:ring-orange-500 text-sm" />
                  <button onClick={handleReferenceLetter} disabled={generatingReference || !referenceInfo.refName} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm py-3 rounded-xl transition-all">
                    {generatingReference ? '⏳ Oluşturuluyor...' : '📝 Mektubu Oluştur'}
                  </button>
                </div>
              )}
              <div className="md:hidden rounded-xl overflow-auto mt-4">
                <CVComponent cvData={cvData} color={color} />
              </div>
              {scoreData && (
                <div className="mt-4 bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">CV Puanı</h3>
                    <div className="flex items-center gap-2">
                      <div className={`text-3xl font-bold ${scoreData.toplam_puan >= 80 ? 'text-green-400' : scoreData.toplam_puan >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{scoreData.toplam_puan}</div>
                      <span className="text-gray-400 text-sm">/100</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {scoreData.kategoriler && Object.entries(scoreData.kategoriler).map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300 text-xs capitalize">{key}</span>
                          <span className="text-gray-400 text-xs">{val.puan}/100</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${val.puan >= 80 ? 'bg-green-500' : val.puan >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${val.puan}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mb-3">
                    <p className="text-green-400 text-xs font-medium mb-1">💪 Güçlü Yönler</p>
                    {scoreData.güçlü_yönler && scoreData.güçlü_yönler.map((item, i) => <p key={i} className="text-gray-400 text-xs">• {item}</p>)}
                  </div>
                  <div className="mb-3">
                    <p className="text-yellow-400 text-xs font-medium mb-1">🔧 İyileştirme Önerileri</p>
                    {scoreData.iyileştirme_önerileri && scoreData.iyileştirme_önerileri.map((item, i) => <p key={i} className="text-gray-400 text-xs">• {item}</p>)}
                  </div>
                  <p className="text-gray-500 text-xs italic">{scoreData.genel_yorum}</p>
                </div>
              )}
              {linkedinSummary && (
                <div className="mt-4 bg-gray-900 border border-blue-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">💼 LinkedIn Profil Özeti</h3>
                    <button onClick={() => navigator.clipboard.writeText(linkedinSummary)} className="text-blue-400 hover:text-blue-300 text-xs border border-blue-800 px-2 py-1 rounded-lg">Kopyala</button>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{linkedinSummary}</p>
                </div>
              )}
              {referenceLetter && (
                <div className="mt-4 bg-gray-900 border border-orange-800 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">📝 Referans Mektubu</h3>
                    <button onClick={() => navigator.clipboard.writeText(referenceLetter)} className="text-orange-400 hover:text-orange-300 text-xs border border-orange-800 px-2 py-1 rounded-lg">Kopyala</button>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{referenceLetter}</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="hidden md:flex w-1/2 bg-gray-900 p-8 flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm font-medium">Canlı Önizleme</p>
            <span className="text-xs bg-blue-600 bg-opacity-20 text-blue-400 px-2 py-1 rounded-full border border-blue-600 border-opacity-30">{template}</span>
          </div>
          <div className="flex-1 overflow-auto rounded-xl">
            <CVComponent cvData={cvData || previewData} color={color} />
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