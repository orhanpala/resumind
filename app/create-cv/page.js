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

async function cropPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const OUT = 300
        const canvas = document.createElement('canvas')
        canvas.width = OUT; canvas.height = OUT
        const ctx = canvas.getContext('2d')
        const side = Math.min(img.width, img.height)
        const srcX = (img.width - side) / 2
        const srcY = Math.max(0, (img.height - side) / 2 - img.height * 0.08)
        ctx.beginPath(); ctx.arc(OUT/2, OUT/2, OUT/2, 0, Math.PI*2); ctx.clip()
        ctx.drawImage(img, srcX, srcY, side, side, 0, 0, OUT, OUT)
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function cropPhotoFromBase64(base64) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const OUT = 300
      const canvas = document.createElement('canvas')
      canvas.width = OUT; canvas.height = OUT
      const ctx = canvas.getContext('2d')
      const side = Math.min(img.width, img.height)
      const srcX = (img.width - side) / 2
      const srcY = Math.max(0, (img.height - side) / 2 - img.height * 0.08)
      ctx.beginPath(); ctx.arc(OUT/2, OUT/2, OUT/2, 0, Math.PI*2); ctx.clip()
      ctx.drawImage(img, srcX, srcY, side, side, 0, 0, OUT, OUT)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = () => resolve(base64)
    img.src = base64
  })
}

function CreateCVContent() {
  const searchParams = useSearchParams()
  const [template, setTemplate] = useState(searchParams.get('template') || 'Modern')
  const [color, setColor] = useState('blue')
  const [mode, setMode] = useState(null)
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData] = useState(null)
  const [previewData, setPreviewData] = useState(emptyCV)
  const [cvPhoto, setCvPhoto] = useState(null)
  const [photoLoading, setPhotoLoading] = useState(false)

  // Geliştirme sorusu
  const [showImproveDialog, setShowImproveDialog] = useState(false)
  const [pendingPhotoBase64, setPendingPhotoBase64] = useState(null)
  const [pendingHasPhoto, setPendingHasPhoto] = useState(false)

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
  const [referenceInfo, setReferenceInfo] = useState({ refName:'',refPosition:'',refCompany:'',relationship:'' })
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const router = useRouter()

  const CVComponent = CVComponents[template] || CVComponents.Modern

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return alert('Lütfen bir resim dosyası seçin.')
    setPhotoLoading(true)
    try {
      const cropped = await cropPhoto(file)
      setCvPhoto(cropped)
      if (cvData) { const u = {...cvData, photo: cropped}; setCvData(u); setPreviewData(u) }
    } catch { alert('Fotoğraf işlenemedi.') }
    setPhotoLoading(false)
  }

  // Dosya yüklendikten sonra geliştirme sorusunu göster
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await fetch('/api/parse-cv', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.success) return alert('Dosya okunamadı: ' + data.error)

      setCvText(data.text)
      setPendingHasPhoto(data.hasPhoto || false)
      setPendingPhotoBase64(data.photoBase64 || null)
      setShowImproveDialog(true)   // ← Geliştirme sorusunu göster
    } catch { alert('Bir hata oluştu') }
  }

  // Geliştirme sorusu cevaplandı
  const handleImproveChoice = async (improve) => {
    setShowImproveDialog(false)

    // DOCX'tan çıkarılan fotoğrafı uygula
    if (pendingPhotoBase64) {
      try {
        const cropped = await cropPhotoFromBase64(pendingPhotoBase64)
        setCvPhoto(cropped)
      } catch { setCvPhoto(pendingPhotoBase64) }
    } else if (pendingHasPhoto && !cvPhoto) {
      // PDF'de foto var ama çıkaramadık — kullanıcıya bildir (aşağıda gösterilecek)
    }

    await generateCV(improve)
  }

  const generateCV = async (improveContent = true) => {
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
        body: JSON.stringify({ cvContent: cvText, template, isRawText: mode === 'text', improveContent })
      })
      const data = await response.json()
      if (data.success) {
        const photo = cvPhoto || (pendingPhotoBase64 ? await cropPhotoFromBase64(pendingPhotoBase64).catch(() => null) : undefined)
        const newCV = { ...data.cvData, photo: photo || undefined }
        setCvData(newCV); setPreviewData(newCV)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await supabase.from('cvs').insert({ user_id: user.id, template, cv_data: newCV })
        setShowMobilePreview(true)
      } else alert('Hata: ' + data.error)
    } catch { alert('Bir hata oluştu') }
    setLoading(false)
  }

  const handleTextGenerate = () => generateCV(true)

  const handleDownloadPDF = () => {
    const el = document.getElementById('cv-preview')
    if (!el) return alert('CV önizlemesi bulunamadı.')
    const styles = Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules).map(r=>r.cssText).join('\n') } catch { return '' } }).join('\n')
    const win = window.open('','_blank','width=900,height=700')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${previewData.name||'CV'} - Resumind</title>
      <style>${styles}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{margin:0;padding:0;background:white;}@page{margin:0;size:A4;}@media print{body{margin:0;padding:0;}}</style>
      </head><body>${el.outerHTML}<script>window.onload=function(){setTimeout(function(){window.print();window.close();},600)}<\/script></body></html>`)
    win.document.close()
  }

  const handleTranslate = async (lang) => {
    if (!cvData) return; setTranslating(true)
    try {
      const res = await fetch('/api/translate-cv', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cvData, targetLanguage: lang==='en'?'İngilizce':'Türkçe' }) })
      const data = await res.json()
      if (data.success) { const t={...data.translatedCV,photo:cvPhoto||undefined}; setCvData(t); setPreviewData(t); setCurrentLang(lang) }
      else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setTranslating(false)
  }

  const handleScoreCV = async () => {
    if (!cvData) return; setScoring(true)
    try {
      const res = await fetch('/api/score-cv', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cvData }) })
      const data = await res.json()
      if (data.success) setScoreData(data.scoreData)
      else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setScoring(false)
  }

  const handleLinkedinSummary = async () => {
    if (!cvData) return; setGeneratingLinkedin(true)
    try {
      const res = await fetch('/api/linkedin-summary', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cvData }) })
      const data = await res.json()
      if (data.success) setLinkedinSummary(data.summary); else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingLinkedin(false)
  }

  const handleReferenceLetter = async () => {
    if (!cvData || !referenceInfo.refName) return; setGeneratingReference(true)
    try {
      const res = await fetch('/api/reference-letter', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cvData, referenceInfo }) })
      const data = await res.json()
      if (data.success) { setReferenceLetter(data.letter); setShowReferenceForm(false) } else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingReference(false)
  }

  const handleEditSave = () => {
    const n = {...JSON.parse(JSON.stringify(editData)), photo: cvPhoto||undefined}
    setCvData(n); setPreviewData(n); setEditMode(false)
  }

  const handleShare = async () => {
    if (!cvData) return; setSharing(true)
    try {
      const shareId = Math.random().toString(36).substring(2,10)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: ex } = await supabase.from('cvs').select('id').eq('user_id',user.id).eq('template',template).order('created_at',{ascending:false}).limit(1).single()
        if (ex) await supabase.from('cvs').update({ share_id: shareId, is_shared: true }).eq('id', ex.id)
        setShareLink(`${window.location.origin}/cv/${shareId}`)
      }
    } catch { alert('Hata oluştu') }
    setSharing(false)
  }

  const resetAll = () => {
    setCvData(null); setPreviewData(emptyCV); setMode(null)
    setScoreData(null); setLinkedinSummary(null); setReferenceLetter(null)
    setEditMode(false); setCvText(''); setShowMobilePreview(false)
    setShowImproveDialog(false); setPendingPhotoBase64(null); setPendingHasPhoto(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">

      {/* ══ Geliştirme Sorusu Modalı ══ */}
      {showImproveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-3 text-center">🤖</div>
            <h2 className="text-white text-lg font-bold text-center mb-2">CV'yi Geliştirelim mi?</h2>
            <p className="text-gray-400 text-sm text-center mb-5 leading-relaxed">
              Yapay zeka CV içeriğini profesyonel hale getirsin mi?<br />
              <span className="text-gray-500 text-xs">Yoksa bilgileri olduğu gibi alsın.</span>
            </p>

            {pendingHasPhoto && !pendingPhotoBase64 && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-xl px-4 py-3 mb-4">
                <p className="text-blue-300 text-xs">
                  📸 PDF'inizde fotoğraf tespit edildi. Fotoğrafı ayrıca yüklemenizi öneririz.
                </p>
              </div>
            )}
            {pendingPhotoBase64 && (
              <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 mb-4">
                <p className="text-green-300 text-xs">
                  ✅ Belgeden fotoğraf çıkarıldı ve CV'ye eklenecek.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => handleImproveChoice(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                ✨ Evet, Yapay Zeka ile Geliştir
              </button>
              <button
                onClick={() => handleImproveChoice(false)}
                className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl transition-all text-sm"
              >
                📋 Hayır, Bilgileri Olduğu Gibi Al
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">

        {/* ══ SOL PANEL ══ */}
        <div className="w-full lg:w-[480px] xl:w-[520px] bg-gray-950 lg:overflow-y-auto lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 flex-shrink-0">

          {/* Sub-header */}
          <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800/60 px-4 sm:px-6 py-3 flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-all bg-gray-800/70 hover:bg-gray-800 px-3 py-1.5 rounded-lg">
              ← Geri
            </button>
            <div className="h-4 w-px bg-gray-700" />
            <div>
              <span className="text-white text-sm font-semibold">CV Oluştur</span>
              <span className="text-gray-500 text-xs ml-2">Yapay zeka ile</span>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-5 space-y-5">

            {/* Fotoğraf */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                Profil Fotoğrafı
                <span className="text-blue-400 font-normal normal-case ml-1">— AI ile otomatik kırpar</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
                  {photoLoading
                    ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    : cvPhoto
                      ? <img src={cvPhoto} alt="Profil" className="w-full h-full object-cover" />
                      : <span className="text-gray-500 text-xl">👤</span>
                  }
                </div>
                <div className="flex-1">
                  <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 text-white text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all w-full justify-center">
                    {cvPhoto ? '📷 Değiştir' : '📷 Fotoğraf Yükle'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  {cvPhoto && (
                    <button onClick={() => { setCvPhoto(null); if(cvData){const u={...cvData};delete u.photo;setCvData(u);setPreviewData(u)} }}
                      className="text-red-400 text-xs mt-1 hover:text-red-300 w-full text-center">
                      × Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Şablon */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Şablon</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(CVComponents).map(t => (
                  <button key={t} onClick={() => setTemplate(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${template===t?'bg-blue-600 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Renk */}
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Renk</p>
              <div className="flex gap-2">
                {colorOptions.map(c => (
                  <button key={c.id} onClick={() => setColor(c.id)} title={c.label}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${color===c.id?'border-white scale-110':'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
            </div>

            {/* Mod seçimi */}
            {!mode && !cvData && (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMode('upload')}
                  className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 text-left transition-all">
                  <div className="text-2xl mb-2">📄</div>
                  <h3 className="text-white font-medium text-sm mb-0.5">CV Yükle</h3>
                  <p className="text-gray-500 text-xs">PDF veya Word dosyası</p>
                </button>
                <button onClick={() => setMode('text')}
                  className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-4 text-left transition-all">
                  <div className="text-2xl mb-2">✏️</div>
                  <h3 className="text-white font-medium text-sm mb-0.5">Bilgileri Yaz</h3>
                  <p className="text-gray-500 text-xs">Kaba taslak yaz, AI tamamlasın</p>
                </button>
              </div>
            )}

            {mode && !cvData && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-300 text-sm font-medium">{mode==='upload'?'CV dosyasını yükle':'Bilgilerini yaz'}</p>
                  <button onClick={() => setMode(null)} className="text-gray-500 hover:text-white text-xs">← Geri</button>
                </div>

                {mode === 'upload' && (
                  <div className="mb-3">
                    <label className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-900">
                      <div className="text-3xl mb-2">📁</div>
                      <p className="text-white text-sm font-medium mb-1">PDF veya Word dosyası seç</p>
                      <p className="text-gray-500 text-xs">.pdf, .doc, .docx desteklenir</p>
                      <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                    </label>
                    {cvText && !showImproveDialog && (
                      <div className="mt-3 bg-green-900/30 border border-green-700 rounded-xl px-4 py-3">
                        <p className="text-green-400 text-sm">✅ Dosya okundu! CV oluşturuluyor...</p>
                      </div>
                    )}
                  </div>
                )}

                {mode === 'text' && (
                  <>
                    <textarea value={cvText} onChange={(e) => setCvText(e.target.value)}
                      placeholder="Örnek: Adım Ahmet, yazılım geliştirici olarak 3 yıl çalıştım..."
                      className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 h-48 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3" />
                    {loading
                      ? <div className="bg-gray-900 border border-gray-800 rounded-2xl"><LoadingAnimation text="CV oluşturuluyor..." /></div>
                      : <button onClick={handleTextGenerate} disabled={!cvText}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all text-sm">
                          ✨ CV Oluştur
                        </button>
                    }
                  </>
                )}

                {loading && mode === 'upload' && (
                  <div className="bg-gray-900 border border-gray-800 rounded-2xl mt-2">
                    <LoadingAnimation text="CV oluşturuluyor, lütfen bekleyin..." />
                  </div>
                )}
              </div>
            )}

            {/* CV oluşturuldu */}
            {cvData && (
              <div className="space-y-2 pb-10">
                <button onClick={() => setShowMobilePreview(v=>!v)}
                  className="w-full lg:hidden bg-gray-800 hover:bg-gray-700 text-white text-sm py-2.5 rounded-xl">
                  {showMobilePreview ? '🙈 Önizlemeyi Gizle' : "👁 CV'yi Gör"}
                </button>
                {showMobilePreview && (
                  <div className="lg:hidden rounded-xl overflow-hidden border border-gray-800">
                    <CVComponent cvData={cvData} color={color} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={resetAll} className="bg-gray-800 hover:bg-gray-700 text-white text-sm py-2.5 rounded-xl">🔄 Yeniden</button>
                  <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 rounded-xl font-medium">📄 PDF İndir</button>
                </div>

                <button onClick={() => { const c=JSON.parse(JSON.stringify(cvData)); setEditData(c); setEditMode(v=>!v) }}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2.5 rounded-xl">✏️ CV'yi Düzenle</button>

                <button onClick={handleShare} disabled={sharing}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl">
                  {sharing?'🔗 Oluşturuluyor...':'🔗 CV\'yi Paylaş'}
                </button>

                {shareLink && (
                  <div className="bg-gray-900 border border-green-700 rounded-xl p-3">
                    <p className="text-green-400 text-xs mb-2">✅ Paylaşım linki oluşturuldu!</p>
                    <div className="flex gap-2">
                      <input type="text" value={shareLink} readOnly className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none min-w-0" />
                      <button onClick={() => { navigator.clipboard.writeText(shareLink); alert('Link kopyalandı!') }}
                        className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shrink-0">Kopyala</button>
                    </div>
                  </div>
                )}

                {editMode && editData && (
                  <div className="bg-gray-900 border border-yellow-700 rounded-xl p-4">
                    <p className="text-white font-medium text-sm mb-3">CV Bilgilerini Düzenle</p>
                    <div className="space-y-2">
                      {[['name','Ad Soyad'],['email','Email'],['phone','Telefon'],['location','Şehir']].map(([k,l])=>(
                        <input key={k} type="text" placeholder={l} value={editData[k]||''}
                          onChange={(e)=>setEditData({...editData,[k]:e.target.value})}
                          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500 text-sm" />
                      ))}
                      <textarea placeholder="Hakkımda" value={editData.summary||''}
                        onChange={(e)=>setEditData({...editData,summary:e.target.value})}
                        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500 text-sm h-20 resize-none" />
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Beceriler (virgülle ayır)</p>
                        <input type="text" placeholder="Python, React, Node.js" value={editData.skills?.join(', ')||''}
                          onChange={(e)=>setEditData({...editData,skills:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500 text-sm" />
                      </div>
                      {editData.experience?.map((exp,i)=>(
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-yellow-400 text-xs mb-2">Deneyim {i+1}</p>
                          {[['position','Pozisyon'],['company','Şirket'],['duration','Süre']].map(([f,p])=>(
                            <input key={f} type="text" placeholder={p} value={exp[f]||''}
                              onChange={(e)=>{const n=[...editData.experience];n[i]={...n[i],[f]:e.target.value};setEditData({...editData,experience:n})}}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-1.5 mb-1 outline-none text-xs" />
                          ))}
                        </div>
                      ))}
                      {editData.education?.map((edu,i)=>(
                        <div key={i} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-yellow-400 text-xs mb-2">Eğitim {i+1}</p>
                          {[['school','Okul'],['degree','Bölüm'],['year','Yıl']].map(([f,p])=>(
                            <input key={f} type="text" placeholder={p} value={edu[f]||''}
                              onChange={(e)=>{const n=[...editData.education];n[i]={...n[i],[f]:e.target.value};setEditData({...editData,education:n})}}
                              className="w-full bg-gray-700 text-white rounded-lg px-3 py-1.5 mb-1 outline-none text-xs" />
                          ))}
                        </div>
                      ))}
                    </div>
                    <button onClick={handleEditSave} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2.5 rounded-xl mt-3">✅ Kaydet</button>
                  </div>
                )}

                <div className="pt-1">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Araçlar</p>
                  <div className="space-y-2">
                    <button onClick={handleScoreCV} disabled={scoring}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl">
                      {scoring?'🔍 Puanlanıyor...':'⭐ CV\'yi Puanla'}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={()=>handleTranslate('en')} disabled={translating||currentLang==='en'}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs py-2.5 rounded-xl">
                        {translating?'🌍...':'🇬🇧 İngilizce'}
                      </button>
                      <button onClick={()=>handleTranslate('tr')} disabled={translating||currentLang==='tr'}
                        className="bg-gray-600 hover:bg-gray-700 disabled:opacity-40 text-white text-xs py-2.5 rounded-xl">
                        {translating?'🌍...':'🇹🇷 Türkçe'}
                      </button>
                    </div>
                    <button onClick={handleLinkedinSummary} disabled={generatingLinkedin}
                      className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl">
                      {generatingLinkedin?'⏳ Oluşturuluyor...':'💼 LinkedIn Özeti'}
                    </button>
                    <button onClick={()=>setShowReferenceForm(v=>!v)}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2.5 rounded-xl">
                      📝 Referans Mektubu
                    </button>
                  </div>
                </div>

                {showReferenceForm && (
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                    <p className="text-white font-medium text-sm mb-3">Referans Veren Bilgileri</p>
                    <div className="space-y-2">
                      {[['refName','Ad Soyad'],['refPosition','Pozisyon'],['refCompany','Şirket'],['relationship','İlişki']].map(([k,p])=>(
                        <input key={k} type="text" placeholder={p} value={referenceInfo[k]}
                          onChange={(e)=>setReferenceInfo({...referenceInfo,[k]:e.target.value})}
                          className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500 text-sm" />
                      ))}
                    </div>
                    <button onClick={handleReferenceLetter} disabled={generatingReference||!referenceInfo.refName}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-sm py-2.5 rounded-xl mt-3">
                      {generatingReference?'⏳ Oluşturuluyor...':'📝 Mektubu Oluştur'}
                    </button>
                  </div>
                )}

                {scoreData && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold text-sm">CV Puanı</h3>
                      <div className={`text-xl font-bold ${(scoreData.totalScore??scoreData.toplam_puan)>=80?'text-green-400':(scoreData.totalScore??scoreData.toplam_puan)>=60?'text-yellow-400':'text-red-400'}`}>
                        {scoreData.totalScore??scoreData.toplam_puan??'—'}<span className="text-gray-500 text-xs font-normal">/100</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[['İçerik',scoreData.contentScore],['Profesyonellik',scoreData.professionalScore],['Beceriler',scoreData.skillsScore],['Deneyim',scoreData.experienceScore]].filter(([,v])=>v!==undefined).map(([l,val])=>(
                        <div key={l} className="bg-gray-800 rounded-lg p-2">
                          <p className="text-gray-400 text-xs mb-1">{l}</p>
                          <div className="w-full bg-gray-700 rounded-full h-1 mb-1">
                            <div className={`h-1 rounded-full ${val>=20?'bg-green-500':val>=13?'bg-yellow-500':'bg-red-500'}`} style={{width:`${(val/25)*100}%`}} />
                          </div>
                          <p className="text-white text-xs">{val}/25</p>
                        </div>
                      ))}
                    </div>
                    {scoreData.strengths?.length>0&&<div className="mb-2"><p className="text-green-400 text-xs font-medium mb-1">💪 Güçlü Yönler</p>{scoreData.strengths.map((s,i)=><p key={i} className="text-gray-400 text-xs">• {s}</p>)}</div>}
                    {scoreData.improvements?.length>0&&<div className="mb-2"><p className="text-yellow-400 text-xs font-medium mb-1">🔧 İyileştirme</p>{scoreData.improvements.map((s,i)=><p key={i} className="text-gray-400 text-xs">• {s}</p>)}</div>}
                    {scoreData.summary&&<p className="text-gray-500 text-xs italic">{scoreData.summary}</p>}
                  </div>
                )}

                {linkedinSummary && (
                  <div className="bg-gray-900 border border-blue-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-sm">💼 LinkedIn Özeti</h3>
                      <button onClick={()=>navigator.clipboard.writeText(linkedinSummary)} className="text-blue-400 text-xs border border-blue-800 px-2 py-1 rounded-lg">Kopyala</button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{linkedinSummary}</p>
                  </div>
                )}

                {referenceLetter && (
                  <div className="bg-gray-900 border border-orange-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-sm">📝 Referans Mektubu</h3>
                      <button onClick={()=>navigator.clipboard.writeText(referenceLetter)} className="text-orange-400 text-xs border border-orange-800 px-2 py-1 rounded-lg">Kopyala</button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{referenceLetter}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ══ SAĞ PANEL ══ */}
        <div className="hidden lg:flex flex-1 bg-gray-900 border-l border-gray-800 flex-col h-[calc(100vh-64px)] sticky top-16">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 shrink-0">
            <p className="text-gray-400 text-sm font-medium">Canlı Önizleme</p>
            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30">{template}</span>
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
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16"><p className="text-white">Yükleniyor...</p></div>}>
      <CreateCVContent />
    </Suspense>
  )
}
