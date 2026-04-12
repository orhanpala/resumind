'use client'
import { useState, Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { CVComponents, colorOptions } from '../components/CVTemplates'
import LoadingAnimation from '../components/LoadingAnimation'

const emptyCV = { name:'',email:'',phone:'',location:'',summary:'',experience:[],education:[],skills:[] }

async function cropPhoto(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const OUT=300, canvas=document.createElement('canvas')
      canvas.width=OUT; canvas.height=OUT
      const ctx=canvas.getContext('2d')
      const side=Math.min(img.width,img.height)
      const srcX=(img.width-side)/2
      const srcY=Math.max(0,(img.height-side)/2-img.height*0.08)
      ctx.beginPath(); ctx.arc(OUT/2,OUT/2,OUT/2,0,Math.PI*2); ctx.clip()
      ctx.drawImage(img,srcX,srcY,side,side,0,0,OUT,OUT)
      resolve(canvas.toDataURL('image/jpeg',0.92))
    }
    img.onerror=()=>resolve(typeof src==='string'?src:'')
    img.src=typeof src==='string'?src:URL.createObjectURL(src)
  })
}

const Icon = {
  photo:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" d="M20 7h-3l-2-2H9L7 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>,
  design:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>,
  actions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  tools:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>,
  back:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>,
  dl:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  edit:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  share:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  star:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>,
  globe:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  ref:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  linkedin:<svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
}

const TABS = [
  { id:'photo',   label:'Fotoğraf', icon:Icon.photo   },
  { id:'design',  label:'Tasarım',  icon:Icon.design  },
  { id:'actions', label:'Eylemler', icon:Icon.actions },
  { id:'tools',   label:'Araçlar',  icon:Icon.tools   },
]

function CreateCVContent() {
  const searchParams = useSearchParams()
  const isEdit = searchParams.get('edit') === '1'
  const fileInputRef = useRef(null)

  const [template, setTemplate]         = useState(searchParams.get('template') || 'Modern')
  const [color, setColor]               = useState('blue')
  const [activeTab, setActiveTab]       = useState('photo')

  // Başlangıç ekranı: null=göster, 'upload'=dosya, 'text'=manuel
  const [startMode, setStartMode]       = useState(isEdit ? 'done' : null)

  const [cvText, setCvText]             = useState('')
  const [loading, setLoading]           = useState(false)
  const [cvData, setCvData]             = useState(null)
  const [previewData, setPreviewData]   = useState(emptyCV)
  const [cvPhoto, setCvPhoto]           = useState(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [showImproveDialog, setShowImproveDialog]   = useState(false)
  const [pendingPhotoBase64, setPendingPhotoBase64] = useState(null)
  const [pendingHasPhoto, setPendingHasPhoto]       = useState(false)
  const [scoreData, setScoreData]                   = useState(null)
  const [scoring, setScoring]                       = useState(false)
  const [translating, setTranslating]               = useState(false)
  const [currentLang, setCurrentLang]               = useState('tr')
  const [linkedinSummary, setLinkedinSummary]       = useState(null)
  const [generatingLinkedin, setGeneratingLinkedin] = useState(false)
  const [editMode, setEditMode]   = useState(false)
  const [editData, setEditData]   = useState(null)
  const [shareLink, setShareLink] = useState(null)
  const [sharing, setSharing]     = useState(false)
  const [referenceLetter, setReferenceLetter]         = useState(null)
  const [generatingReference, setGeneratingReference] = useState(false)
  const [showReferenceForm, setShowReferenceForm]     = useState(false)
  const [referenceInfo, setReferenceInfo] = useState({ refName:'',refPosition:'',refCompany:'',relationship:'' })
  const [showMobilePreview, setShowMobilePreview]     = useState(false)
  const router = useRouter()

  const CVComponent = CVComponents[template] || CVComponents.Modern

  /* ── Düzenleme modu: sessionStorage'dan yükle ── */
  useEffect(() => {
    if (!isEdit) return
    try {
      const raw = sessionStorage.getItem('editCV')
      if (!raw) return
      const { cvData: stored, template: tpl } = JSON.parse(raw)
      if (stored) {
        setCvData(stored); setPreviewData(stored)
        if (stored.photo) setCvPhoto(stored.photo)
        setEditData(JSON.parse(JSON.stringify(stored))); setEditMode(true)
      }
      if (tpl) setTemplate(tpl)
      sessionStorage.removeItem('editCV')
      setActiveTab('actions')
    } catch {}
  }, [isEdit])

  /* ── Belge yükle seçilince dosya dialogunu aç ── */
  const handleChooseUpload = () => {
    setStartMode('upload')
    setTimeout(() => fileInputRef.current?.click(), 50)
  }

  const handleChooseText = () => setStartMode('text')

  /* ── Fotoğraf yükle ── */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return alert('Lütfen bir resim dosyası seçin.')
    setPhotoLoading(true)
    try {
      const cropped = await cropPhoto(file)
      setCvPhoto(cropped)
      if (cvData) { const u={...cvData,photo:cropped}; setCvData(u); setPreviewData(u) }
    } catch { alert('Fotoğraf işlenemedi.') }
    setPhotoLoading(false)
  }

  /* ── Dosya parse ── */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) { setStartMode(null); return }
    const fd = new FormData(); fd.append('file', file)
    try {
      const res  = await fetch('/api/parse-cv', { method:'POST', body:fd })
      const data = await res.json()
      if (data.isScanned) { alert(data.error); setStartMode('text'); return }
      if (!data.success)  { alert('Dosya okunamadı: ' + data.error); setStartMode(null); return }
      setCvText(data.text)
      setPendingHasPhoto(data.hasPhoto || false)
      setPendingPhotoBase64(data.photoBase64 || null)
      setShowImproveDialog(true)
    } catch { alert('Bir hata oluştu'); setStartMode(null) }
  }

  const handleImproveChoice = async (improve) => {
    setShowImproveDialog(false)
    if (pendingPhotoBase64) { try { setCvPhoto(await cropPhoto(pendingPhotoBase64)) } catch {} }
    await generateCV(improve)
  }

  const generateCV = async (improveContent=true) => {
    if (!cvText) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res  = await fetch('/api/generate-cv', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'authorization':`Bearer ${session?.access_token||''}` },
        body: JSON.stringify({ cvContent:cvText, template, isRawText:startMode==='text', improveContent }),
      })
      const data = await res.json()
      if (data.success) {
        const photo = cvPhoto || (pendingPhotoBase64 ? await cropPhoto(pendingPhotoBase64).catch(()=>null) : undefined)
        const newCV = { ...data.cvData, photo:photo||undefined }
        setCvData(newCV); setPreviewData(newCV); setStartMode('done')
        const { data:{ user } } = await supabase.auth.getUser()
        if (user) await supabase.from('cvs').insert({ user_id:user.id, template, cv_data:newCV })
        setShowMobilePreview(true); setActiveTab('actions')
      } else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setLoading(false)
  }

  const handleDownloadPDF = () => {
    const el = document.getElementById('cv-preview')
    if (!el) return alert('Önce CV oluşturun.')
    const styles = Array.from(document.styleSheets).map(s=>{try{return Array.from(s.cssRules).map(r=>r.cssText).join('\n')}catch{return ''}}).join('\n')
    const win = window.open('','_blank','width=900,height=700')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${previewData.name||'CV'} - Resumind</title>
      <style>${styles}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{margin:0;padding:0;background:white;}@page{margin:0;size:A4;}</style>
      </head><body>${el.outerHTML}<script>window.onload=function(){setTimeout(function(){window.print();window.close();},600)}<\/script></body></html>`)
    win.document.close()
  }

  const handleTranslate = async (lang) => {
    if (!cvData) return; setTranslating(true)
    try {
      const res  = await fetch('/api/translate-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData,targetLanguage:lang==='en'?'İngilizce':'Türkçe'})})
      const data = await res.json()
      if (data.success) { const t={...data.translatedCV,photo:cvPhoto||undefined}; setCvData(t); setPreviewData(t); setCurrentLang(lang) }
      else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setTranslating(false)
  }

  const handleScoreCV = async () => {
    if (!cvData) return; setScoring(true)
    try {
      const res  = await fetch('/api/score-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData})})
      const data = await res.json()
      if (data.success) setScoreData(data.scoreData); else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setScoring(false)
  }

  const handleLinkedin = async () => {
    if (!cvData) return; setGeneratingLinkedin(true)
    try {
      const res  = await fetch('/api/linkedin-summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData})})
      const data = await res.json()
      if (data.success) setLinkedinSummary(data.summary); else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingLinkedin(false)
  }

  const handleReference = async () => {
    if (!cvData||!referenceInfo.refName) return; setGeneratingReference(true)
    try {
      const res  = await fetch('/api/reference-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData,referenceInfo})})
      const data = await res.json()
      if (data.success) { setReferenceLetter(data.letter); setShowReferenceForm(false) } else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingReference(false)
  }

  const handleShare = async () => {
    if (!cvData) return; setSharing(true)
    try {
      const shareId = Math.random().toString(36).substring(2,10)
      const { data:{ user } } = await supabase.auth.getUser()
      if (user) {
        const { data:ex } = await supabase.from('cvs').select('id').eq('user_id',user.id).eq('template',template).order('created_at',{ascending:false}).limit(1).single()
        if (ex) await supabase.from('cvs').update({share_id:shareId,is_shared:true}).eq('id',ex.id)
        setShareLink(`${window.location.origin}/cv/${shareId}`)
      }
    } catch { alert('Hata oluştu') }
    setSharing(false)
  }

  const handleEditSave = () => {
    const n = { ...JSON.parse(JSON.stringify(editData)), photo:cvPhoto||undefined }
    setCvData(n); setPreviewData(n); setEditMode(false)
  }

  const resetAll = () => {
    setCvData(null); setPreviewData(emptyCV)
    setScoreData(null); setLinkedinSummary(null); setReferenceLetter(null)
    setEditMode(false); setCvText(''); setShowMobilePreview(false)
    setShowImproveDialog(false); setPendingPhotoBase64(null); setPendingHasPhoto(false)
    setStartMode(null); setActiveTab('photo')
  }

  /* ══════════════════════════ PANEL İÇERİKLERİ ══════════════════════════ */
  const panels = {
    photo: (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
            {photoLoading
              ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
              : cvPhoto
                ? <img src={cvPhoto} alt="Profil" className="w-full h-full object-cover"/>
                : <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={1.5} className="w-10 h-10"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            }
          </div>
          <label className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 text-white text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all">
            {cvPhoto ? '📷 Değiştir' : '📷 Fotoğraf Yükle'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
          </label>
          {cvPhoto && <button onClick={()=>{ setCvPhoto(null); if(cvData){const u={...cvData};delete u.photo;setCvData(u);setPreviewData(u)} }} className="text-red-400 text-xs hover:text-red-300">× Kaldır</button>}
        </div>
        <p className="text-gray-600 text-xs text-center leading-relaxed">AI yüz bölgesini otomatik olarak kırpar ve dairesel hale getirir.</p>
      </div>
    ),

    design: (
      <div className="space-y-5">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Şablon</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(CVComponents).map(t => (
              <button key={t} onClick={()=>setTemplate(t)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${template===t?'bg-blue-600 text-white':'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Renk</p>
          <div className="flex gap-3">
            {colorOptions.map(c => (
              <button key={c.id} onClick={()=>setColor(c.id)} title={c.label}
                className={`w-8 h-8 rounded-full border-2 transition-all ${color===c.id?'border-white scale-110 shadow-lg':'border-gray-700 opacity-60 hover:opacity-90 hover:scale-105'}`}
                style={{backgroundColor:c.hex}}/>
            ))}
          </div>
        </div>
      </div>
    ),

    actions: (
      <div className="space-y-2">
        {!cvData ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm mb-1">Henüz CV oluşturulmadı</p>
            <button onClick={resetAll} className="text-blue-400 text-xs hover:text-blue-300">← Başa dön</button>
          </div>
        ) : (
          <>
            <button onClick={handleDownloadPDF}
              className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 px-4 rounded-xl transition-all font-medium">
              {Icon.dl} PDF İndir
            </button>
            <button onClick={()=>{ const c=JSON.parse(JSON.stringify(cvData)); setEditData(c); setEditMode(v=>!v) }}
              className={`w-full flex items-center gap-3 text-white text-sm py-2.5 px-4 rounded-xl transition-all ${editMode?'bg-yellow-700':'bg-yellow-600/90 hover:bg-yellow-600'}`}>
              {Icon.edit} {editMode?'Düzenlemeyi Kapat':'CV\'yi Düzenle'}
            </button>
            <button onClick={handleShare} disabled={sharing}
              className="w-full flex items-center gap-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.share} {sharing?'Oluşturuluyor...':'CV\'yi Paylaş'}
            </button>
            {shareLink && (
              <div className="bg-gray-800/60 border border-green-800/50 rounded-xl p-3">
                <p className="text-green-400 text-xs mb-2">✅ Paylaşım linki hazır!</p>
                <div className="flex gap-1.5">
                  <input value={shareLink} readOnly className="flex-1 bg-gray-800 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none min-w-0"/>
                  <button onClick={()=>{ navigator.clipboard.writeText(shareLink); alert('Kopyalandı!') }} className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg shrink-0">Kopyala</button>
                </div>
              </div>
            )}
            <button onClick={resetAll}
              className="w-full flex items-center gap-3 bg-gray-800/80 hover:bg-gray-800 text-gray-400 hover:text-white text-sm py-2.5 px-4 rounded-xl transition-all border border-gray-700/50">
              {Icon.refresh} Yeniden Oluştur
            </button>

            {editMode && editData && (
              <div className="mt-2 bg-gray-800/40 border border-yellow-700/40 rounded-xl p-4">
                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide mb-3">Bilgileri Düzenle</p>
                <div className="space-y-2">
                  {[['name','Ad Soyad'],['email','Email'],['phone','Telefon'],['location','Şehir']].map(([k,l])=>(
                    <input key={k} type="text" placeholder={l} value={editData[k]||''}
                      onChange={e=>setEditData({...editData,[k]:e.target.value})}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none text-xs border border-gray-700/60 focus:border-yellow-600/60 placeholder-gray-600"/>
                  ))}
                  <textarea placeholder="Hakkımda" value={editData.summary||''}
                    onChange={e=>setEditData({...editData,summary:e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none text-xs h-16 resize-none border border-gray-700/60 focus:border-yellow-600/60 placeholder-gray-600"/>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Beceriler (virgülle)</p>
                    <input type="text" placeholder="Python, React..." value={editData.skills?.join(', ')||''}
                      onChange={e=>setEditData({...editData,skills:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none text-xs border border-gray-700/60 placeholder-gray-600"/>
                  </div>
                  {editData.experience?.map((exp,i)=>(
                    <div key={i} className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-700/30">
                      <p className="text-yellow-500/80 text-xs mb-1.5">Deneyim {i+1}</p>
                      {[['position','Pozisyon'],['company','Şirket'],['duration','Süre']].map(([f,p])=>(
                        <input key={f} type="text" placeholder={p} value={exp[f]||''}
                          onChange={e=>{const n=[...editData.experience];n[i]={...n[i],[f]:e.target.value};setEditData({...editData,experience:n})}}
                          className="w-full bg-gray-800 text-white rounded-lg px-2.5 py-1.5 mb-1 outline-none text-xs border border-gray-700/40 placeholder-gray-600"/>
                      ))}
                      <textarea placeholder="Açıklama" value={exp.description||''}
                        onChange={e=>{const n=[...editData.experience];n[i]={...n[i],description:e.target.value};setEditData({...editData,experience:n})}}
                        className="w-full bg-gray-800 text-white rounded-lg px-2.5 py-1.5 outline-none text-xs h-12 resize-none border border-gray-700/40 placeholder-gray-600"/>
                    </div>
                  ))}
                  {editData.education?.map((edu,i)=>(
                    <div key={i} className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-700/30">
                      <p className="text-yellow-500/80 text-xs mb-1.5">Eğitim {i+1}</p>
                      {[['school','Okul'],['degree','Bölüm'],['year','Yıl']].map(([f,p])=>(
                        <input key={f} type="text" placeholder={p} value={edu[f]||''}
                          onChange={e=>{const n=[...editData.education];n[i]={...n[i],[f]:e.target.value};setEditData({...editData,education:n})}}
                          className="w-full bg-gray-800 text-white rounded-lg px-2.5 py-1.5 mb-1 outline-none text-xs border border-gray-700/40 placeholder-gray-600"/>
                      ))}
                    </div>
                  ))}
                </div>
                <button onClick={handleEditSave} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2.5 rounded-xl mt-3 font-medium">✅ Kaydet</button>
              </div>
            )}
          </>
        )}
      </div>
    ),

    tools: (
      <div className="space-y-3">
        {!cvData ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm mb-1">Önce CV oluşturun</p>
            <button onClick={resetAll} className="text-blue-400 text-xs hover:text-blue-300">← Başa dön</button>
          </div>
        ) : (
          <>
            <button onClick={handleScoreCV} disabled={scoring}
              className="w-full flex items-center gap-3 bg-purple-700/80 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.star} {scoring?'Puanlanıyor...':'CV\'yi Puanla'}
            </button>
            {scoreData && (
              <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-xs font-medium">Puan</span>
                  <span className={`text-xl font-bold ${(scoreData.totalScore??scoreData.toplam_puan)>=80?'text-green-400':(scoreData.totalScore??scoreData.toplam_puan)>=60?'text-yellow-400':'text-red-400'}`}>
                    {scoreData.totalScore??scoreData.toplam_puan??'—'}<span className="text-xs text-gray-600 font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${scoreData.totalScore??scoreData.toplam_puan??0}%`}}/>
                </div>
                {scoreData.strengths?.slice(0,2).map((s,i)=><p key={i} className="text-gray-500 text-xs">💪 {s}</p>)}
                {scoreData.improvements?.slice(0,2).map((s,i)=><p key={i} className="text-gray-500 text-xs">🔧 {s}</p>)}
              </div>
            )}
            <div>
              <p className="text-gray-600 text-xs mb-2">Dil Çevirisi</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={()=>handleTranslate('en')} disabled={translating||currentLang==='en'}
                  className="flex items-center justify-center gap-1 bg-gray-800/80 hover:bg-gray-800 disabled:opacity-40 text-gray-300 hover:text-white text-xs py-2.5 rounded-lg transition-all border border-gray-700/50">
                  {Icon.globe} 🇬🇧 İngilizce
                </button>
                <button onClick={()=>handleTranslate('tr')} disabled={translating||currentLang==='tr'}
                  className="flex items-center justify-center gap-1 bg-gray-800/80 hover:bg-gray-800 disabled:opacity-40 text-gray-300 hover:text-white text-xs py-2.5 rounded-lg transition-all border border-gray-700/50">
                  {Icon.globe} 🇹🇷 Türkçe
                </button>
              </div>
            </div>
            <button onClick={handleLinkedin} disabled={generatingLinkedin}
              className="w-full flex items-center gap-3 bg-blue-800/60 hover:bg-blue-800 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.linkedin} {generatingLinkedin?'Oluşturuluyor...':'LinkedIn Özeti'}
            </button>
            {linkedinSummary && (
              <div className="bg-gray-800/40 border border-blue-900/40 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-blue-400 text-xs font-medium">LinkedIn Özeti</p>
                  <button onClick={()=>navigator.clipboard.writeText(linkedinSummary)} className="text-blue-400 text-xs border border-blue-900/50 px-2 py-0.5 rounded-md">Kopyala</button>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-4">{linkedinSummary}</p>
              </div>
            )}
            <button onClick={()=>setShowReferenceForm(v=>!v)}
              className="w-full flex items-center gap-3 bg-orange-700/60 hover:bg-orange-700 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.ref} Referans Mektubu
            </button>
            {showReferenceForm && (
              <div className="bg-gray-800/40 border border-orange-800/40 rounded-xl p-3">
                <div className="space-y-2 mb-2">
                  {[['refName','Ad Soyad'],['refPosition','Pozisyon'],['refCompany','Şirket'],['relationship','İlişki']].map(([k,p])=>(
                    <input key={k} type="text" placeholder={p} value={referenceInfo[k]}
                      onChange={e=>setReferenceInfo({...referenceInfo,[k]:e.target.value})}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 outline-none text-xs border border-gray-700/50 placeholder-gray-600"/>
                  ))}
                </div>
                <button onClick={handleReference} disabled={generatingReference||!referenceInfo.refName}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs py-2 rounded-lg">
                  {generatingReference?'Oluşturuluyor...':'Mektubu Oluştur'}
                </button>
              </div>
            )}
            {referenceLetter && (
              <div className="bg-gray-800/40 border border-orange-900/40 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-orange-400 text-xs font-medium">Referans Mektubu</p>
                  <button onClick={()=>navigator.clipboard.writeText(referenceLetter)} className="text-orange-400 text-xs border border-orange-900/50 px-2 py-0.5 rounded-md">Kopyala</button>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line line-clamp-5">{referenceLetter}</p>
              </div>
            )}
          </>
        )}
      </div>
    ),
  }

  /* ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-950 pt-16">

      {/* ── Gizli file input (belge yükle seçiminde tetiklenir) ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* ══ BAŞLANGIÇ EKRANI ══ */}
      {startMode === null && (
        <div className="fixed inset-0 z-40 bg-gray-950 flex items-center justify-center px-4 pt-16">
          <div className="w-full max-w-lg">
            {/* Başlık */}
            <div className="text-center mb-12">
              <p className="text-blue-400 text-sm font-medium mb-3 tracking-widest uppercase">Resumind AI</p>
              <h1 className="text-white text-4xl font-bold mb-3 leading-tight">
                CV'nizi nasıl<br/>oluşturmak istersiniz?
              </h1>
              <p className="text-gray-500 text-base">Yapay zeka birkaç saniyede profesyonel CV'nizi hazırlasın</p>
            </div>

            {/* İki seçenek */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Belge Yükle */}
              <button
                onClick={handleChooseUpload}
                className="group relative bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/60 rounded-2xl p-7 text-left transition-all hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-0.5"
              >
                <div className="w-14 h-14 bg-blue-600/15 border border-blue-600/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-600/25 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={1.5} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Belge Yükle</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Mevcut CV'nizi yükleyin. AI bilgilerinizi okuyup profesyonel hale getirir.</p>
                <div className="flex gap-1.5 mt-4 flex-wrap">
                  {['PDF','DOCX','TXT'].map(f => (
                    <span key={f} className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded-md border border-gray-700/50">{f}</span>
                  ))}
                </div>
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-600/0 group-hover:bg-blue-600/10 flex items-center justify-center transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-2px] group-hover:translate-x-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>

              {/* Manuel Yaz */}
              <button
                onClick={handleChooseText}
                className="group relative bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/60 rounded-2xl p-7 text-left transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-0.5"
              >
                <div className="w-14 h-14 bg-purple-600/15 border border-purple-600/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-600/25 transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={1.5} className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Manuel Yaz</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Kısa notlar yazın, AI profesyonel bir CV'ye dönüştürsün. Hızlı ve kolay.</p>
                <div className="mt-4">
                  <span className="text-xs bg-purple-900/30 text-purple-400 px-2.5 py-0.5 rounded-md border border-purple-800/40">AI ile tamamlar</span>
                </div>
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-purple-600/0 group-hover:bg-purple-600/10 flex items-center justify-center transition-all">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={2} className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-2px] group-hover:translate-x-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            </div>

            {/* Geri linki */}
            <div className="text-center mt-8">
              <button onClick={()=>router.push('/dashboard')} className="text-gray-600 hover:text-gray-400 text-sm transition-all">
                ← Dashboard'a dön
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MANUEL YAZ EKRANI ══ */}
      {startMode === 'text' && !loading && !cvData && (
        <div className="fixed inset-0 z-40 bg-gray-950 flex items-center justify-center px-4 pt-16">
          <div className="w-full max-w-lg">
            <button onClick={()=>setStartMode(null)} className="flex items-center gap-1.5 text-gray-600 hover:text-white text-sm mb-8 transition-all">
              {Icon.back} Geri
            </button>
            <div className="mb-6">
              <h2 className="text-white text-2xl font-bold mb-2">Bilgilerinizi yazın</h2>
              <p className="text-gray-500 text-sm">Kısa notlar yeterli — AI profesyonel hale getirecek</p>
            </div>
            <textarea
              value={cvText}
              onChange={e=>setCvText(e.target.value)}
              placeholder="Örn: Adım Ahmet Yılmaz, 3 yıldır yazılım geliştirici olarak çalışıyorum. React ve Node.js kullandım. İTÜ Bilgisayar Mühendisliği mezunuyum..."
              className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500/50 text-white rounded-2xl px-5 py-4 h-52 outline-none resize-none text-sm placeholder-gray-600 mb-4 transition-all"
              autoFocus
            />
            <button
              onClick={()=>generateCV(true)}
              disabled={!cvText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl transition-all text-sm"
            >
              ✨ CV Oluştur
            </button>
          </div>
        </div>
      )}

      {/* ══ YÜKLEME EKRANı ══ */}
      {loading && (
        <div className="fixed inset-0 z-40 bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"/>
            <p className="text-white text-lg font-medium mb-2">CV oluşturuluyor...</p>
            <p className="text-gray-500 text-sm">Yapay zeka bilgilerinizi işliyor</p>
          </div>
        </div>
      )}

      {/* ══ GELIŞTIRME MODALI ══ */}
      {showImproveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-3 text-center">🤖</div>
            <h2 className="text-white text-lg font-bold text-center mb-2">CV'yi Geliştirelim mi?</h2>
            <p className="text-gray-500 text-sm text-center mb-5 leading-relaxed">Yapay zeka içeriği profesyonel hale getirsin mi?</p>
            {pendingPhotoBase64 && <div className="bg-green-900/20 border border-green-800/40 rounded-xl px-3 py-2 mb-4"><p className="text-green-400 text-xs">✅ Belgeden fotoğraf çıkarıldı.</p></div>}
            {pendingHasPhoto && !pendingPhotoBase64 && <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl px-3 py-2 mb-4"><p className="text-blue-400 text-xs">📸 PDF'de fotoğraf tespit edildi. Fotoğraf sekmesinden yükleyebilirsiniz.</p></div>}
            <div className="space-y-2">
              <button onClick={()=>handleImproveChoice(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all">✨ Evet, Geliştir</button>
              <button onClick={()=>handleImproveChoice(false)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-2.5 rounded-xl transition-all text-sm">📋 Olduğu Gibi Al</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ANA LAYOUT (CV oluşturulduktan sonra) ══ */}
      {(startMode === 'done' || isEdit) && (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">

          {/* Dikey icon bar — desktop */}
          <div className="hidden lg:flex flex-col items-center gap-1 py-4 px-2 bg-[#111827] border-r border-gray-800/80 w-16 min-h-[calc(100vh-64px)]">
            <button onClick={()=>router.push('/dashboard')}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:text-white hover:bg-gray-800 transition-all mb-3" title="Dashboard">
              {Icon.back}
            </button>
            <div className="w-6 h-px bg-gray-800 mb-2"/>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} title={tab.label}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative ${activeTab===tab.id?'bg-blue-600 text-white shadow-lg shadow-blue-600/30':'text-gray-600 hover:text-gray-300 hover:bg-gray-800/80'}`}>
                {tab.icon}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="lg:w-72 xl:w-80 bg-gray-950 border-r border-gray-800/60 lg:overflow-y-auto lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">

            {/* Mobil header + tabs */}
            <div className="lg:hidden sticky top-0 z-20 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800/60">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button onClick={()=>router.push('/dashboard')}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs bg-gray-800/80 px-2.5 py-1.5 rounded-lg transition-all border border-gray-700/40">
                  {Icon.back} Geri
                </button>
                <span className="text-white text-sm font-semibold">CV Oluştur</span>
                {cvData && <span className="ml-auto flex items-center gap-1 text-green-400 text-xs"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"/> Hazır</span>}
              </div>
              <div className="flex gap-0.5 px-3 pb-2 overflow-x-auto">
                {TABS.map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab===tab.id?'bg-blue-600 text-white':'text-gray-500 hover:text-white hover:bg-gray-800/60'}`}>
                    <span className="w-4 h-4">{tab.icon}</span>{tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop başlık */}
            <div className="hidden lg:flex items-center px-4 py-3 border-b border-gray-800/40">
              <p className="text-gray-300 text-sm font-semibold">{TABS.find(t=>t.id===activeTab)?.label}</p>
            </div>

            <div className="px-4 py-4 pb-8">{panels[activeTab]}</div>
          </div>

          {/* Sağ: Önizleme */}
          <div className="flex-1 flex flex-col bg-gray-900/50 min-h-0">
            {/* Mobil toggle */}
            <div className="lg:hidden border-b border-gray-800/60 bg-gray-900/80">
              <button onClick={()=>setShowMobilePreview(v=>!v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-400 hover:text-white text-sm transition-all">
                {showMobilePreview
                  ? '🙈 Önizlemeyi Gizle'
                  : <>👁 CV Önizleme {cvData && <span className="bg-blue-600/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-600/30 ml-1">Hazır</span>}</>
                }
              </button>
            </div>
            {showMobilePreview && <div className="lg:hidden p-3"><CVComponent cvData={cvData||previewData} color={color}/></div>}

            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 h-[calc(100vh-64px)] sticky top-16">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60 shrink-0 bg-gray-900/40">
                <p className="text-gray-400 text-sm font-medium">Canlı Önizleme</p>
                <div className="flex items-center gap-2">
                  <button onClick={resetAll} className="text-gray-600 hover:text-gray-400 text-xs transition-all">← Yeniden</button>
                  <span className="text-xs bg-blue-600/15 text-blue-400 px-2.5 py-1 rounded-full border border-blue-600/25">{template}</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <CVComponent cvData={cvData||previewData} color={color}/>
              </div>
            </div>
          </div>
        </div>
      )}
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
