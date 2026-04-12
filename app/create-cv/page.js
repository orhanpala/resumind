'use client'
import { useState, Suspense } from 'react'
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
    img.onerror=()=>resolve(src)
    img.src=typeof src==='string'?src:URL.createObjectURL(src)
  })
}

/* ── İkon SVG'leri ─────────────────────────────────────────── */
const Icon = {
  photo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" d="M20 7h-3l-2-2H9L7 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>,
  design: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path strokeLinecap="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-1.5c0-.83-.67-1.5-1.5-1.5H11c-2.76 0-5-2.24-5-5s2.24-5 5-5h6c2.76 0 5 2.24 5 5v2.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12c0-5.52-4.48-10-10-10z"/></svg>,
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4-4m0 0l-4 4m4-4v12"/></svg>,
  actions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  tools: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>,
  linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  ref: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
}

/* Kategori tanımları */
const TABS = [
  { id:'photo',   label:'Fotoğraf', icon: Icon.photo   },
  { id:'design',  label:'Tasarım',  icon: Icon.design  },
  { id:'upload',  label:'Yükle',    icon: Icon.upload  },
  { id:'actions', label:'Eylemler', icon: Icon.actions },
  { id:'tools',   label:'Araçlar',  icon: Icon.tools   },
]

function CreateCVContent() {
  const searchParams = useSearchParams()
  const [template, setTemplate] = useState(searchParams.get('template') || 'Modern')
  const [color, setColor] = useState('blue')
  const [activeTab, setActiveTab] = useState('upload')
  const [mode, setMode] = useState(null)
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData] = useState(null)
  const [previewData, setPreviewData] = useState(emptyCV)
  const [cvPhoto, setCvPhoto] = useState(null)
  const [photoLoading, setPhotoLoading] = useState(false)
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
  const [referenceInfo, setReferenceInfo] = useState({refName:'',refPosition:'',refCompany:'',relationship:''})
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
      if (cvData) { const u={...cvData,photo:cropped}; setCvData(u); setPreviewData(u) }
    } catch { alert('Fotoğraf işlenemedi.') }
    setPhotoLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData(); fd.append('file', file)
    try {
      const res = await fetch('/api/parse-cv', { method:'POST', body:fd })
      const data = await res.json()
      if (data.isScanned) {
        // Taranmış PDF — metin girişine yönlendir
        alert(data.error)
        setMode('text')
        return
      }
      if (!data.success) return alert('Dosya okunamadı: ' + data.error)
      setCvText(data.text)
      setPendingHasPhoto(data.hasPhoto||false)
      setPendingPhotoBase64(data.photoBase64||null)
      setShowImproveDialog(true)
    } catch { alert('Bir hata oluştu') }
  }

  const handleImproveChoice = async (improve) => {
    setShowImproveDialog(false)
    if (pendingPhotoBase64) {
      try { setCvPhoto(await cropPhoto(pendingPhotoBase64)) } catch {}
    }
    await generateCV(improve)
  }

  const generateCV = async (improveContent=true) => {
    if (!cvText) return
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/generate-cv', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'authorization':`Bearer ${session?.access_token||''}` },
        body: JSON.stringify({ cvContent:cvText, template, isRawText:mode==='text', improveContent })
      })
      const data = await res.json()
      if (data.success) {
        const photo = cvPhoto||(pendingPhotoBase64?await cropPhoto(pendingPhotoBase64).catch(()=>null):undefined)
        const newCV = {...data.cvData, photo:photo||undefined}
        setCvData(newCV); setPreviewData(newCV)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await supabase.from('cvs').insert({ user_id:user.id, template, cv_data:newCV })
        setShowMobilePreview(true)
        setActiveTab('actions') // CV oluşunca aksiyon tabına geç
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
      const res = await fetch('/api/translate-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData,targetLanguage:lang==='en'?'İngilizce':'Türkçe'})})
      const data = await res.json()
      if (data.success) { const t={...data.translatedCV,photo:cvPhoto||undefined}; setCvData(t); setPreviewData(t); setCurrentLang(lang) }
      else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setTranslating(false)
  }

  const handleScoreCV = async () => {
    if (!cvData) return; setScoring(true)
    try {
      const res = await fetch('/api/score-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData})})
      const data = await res.json()
      if (data.success) setScoreData(data.scoreData); else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setScoring(false)
  }

  const handleLinkedin = async () => {
    if (!cvData) return; setGeneratingLinkedin(true)
    try {
      const res = await fetch('/api/linkedin-summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData})})
      const data = await res.json()
      if (data.success) setLinkedinSummary(data.summary); else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingLinkedin(false)
  }

  const handleReference = async () => {
    if (!cvData||!referenceInfo.refName) return; setGeneratingReference(true)
    try {
      const res = await fetch('/api/reference-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData,referenceInfo})})
      const data = await res.json()
      if (data.success) { setReferenceLetter(data.letter); setShowReferenceForm(false) } else alert('Hata: '+data.error)
    } catch { alert('Bir hata oluştu') }
    setGeneratingReference(false)
  }

  const handleShare = async () => {
    if (!cvData) return; setSharing(true)
    try {
      const shareId = Math.random().toString(36).substring(2,10)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data:ex } = await supabase.from('cvs').select('id').eq('user_id',user.id).eq('template',template).order('created_at',{ascending:false}).limit(1).single()
        if (ex) await supabase.from('cvs').update({share_id:shareId,is_shared:true}).eq('id',ex.id)
        setShareLink(`${window.location.origin}/cv/${shareId}`)
      }
    } catch { alert('Hata oluştu') }
    setSharing(false)
  }

  const handleEditSave = () => {
    const n = {...JSON.parse(JSON.stringify(editData)),photo:cvPhoto||undefined}
    setCvData(n); setPreviewData(n); setEditMode(false)
  }

  const resetAll = () => {
    setCvData(null); setPreviewData(emptyCV); setMode(null)
    setScoreData(null); setLinkedinSummary(null); setReferenceLetter(null)
    setEditMode(false); setCvText(''); setShowMobilePreview(false)
    setShowImproveDialog(false); setPendingPhotoBase64(null); setPendingHasPhoto(false)
    setActiveTab('upload')
  }

  /* ── Panel içerikleri ─────────────────────────────────────── */
  const panels = {

    /* Fotoğraf */
    photo: (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 flex items-center justify-center">
            {photoLoading
              ? <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              : cvPhoto
                ? <img src={cvPhoto} alt="Profil" className="w-full h-full object-cover" />
                : <svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={1.5} className="w-10 h-10"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            }
          </div>
          <label className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 text-white text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all">
            {cvPhoto ? '📷 Değiştir' : '📷 Fotoğraf Yükle'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          {cvPhoto && <button onClick={()=>{setCvPhoto(null);if(cvData){const u={...cvData};delete u.photo;setCvData(u);setPreviewData(u)}}} className="text-red-400 text-xs hover:text-red-300">× Kaldır</button>}
        </div>
        <p className="text-gray-600 text-xs text-center">Fotoğraf yüklediğinizde AI otomatik olarak yüz bölgesini kırpar ve dairesel hale getirir.</p>
      </div>
    ),

    /* Tasarım */
    design: (
      <div className="space-y-5">
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Şablon</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(CVComponents).map(t => (
              <button key={t} onClick={()=>setTemplate(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${template===t?'bg-blue-600 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Renk</p>
          <div className="flex gap-2.5">
            {colorOptions.map(c=>(
              <button key={c.id} onClick={()=>setColor(c.id)} title={c.label}
                className={`w-8 h-8 rounded-full border-2 transition-all ${color===c.id?'border-white scale-110':'border-gray-700 opacity-60 hover:opacity-100'}`}
                style={{backgroundColor:c.hex}} />
            ))}
          </div>
        </div>
      </div>
    ),

    /* Yükle */
    upload: (
      <div className="space-y-3">
        {!mode && !cvData && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>setMode('upload')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-4 text-left transition-all">
              <div className="text-xl mb-1.5">📄</div>
              <p className="text-white text-xs font-medium">CV Yükle</p>
              <p className="text-gray-600 text-xs">PDF, DOCX, TXT</p>
            </button>
            <button onClick={()=>setMode('text')}
              className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl p-4 text-left transition-all">
              <div className="text-xl mb-1.5">✏️</div>
              <p className="text-white text-xs font-medium">Manuel Yaz</p>
              <p className="text-gray-600 text-xs">AI tamamlar</p>
            </button>
          </div>
        )}
        {mode === 'upload' && !cvData && (
          <div>
            <button onClick={()=>setMode(null)} className="text-gray-500 hover:text-white text-xs mb-3">← Geri</button>
            <label className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center cursor-pointer transition-all bg-gray-900/50">
              <div className="text-2xl mb-2">📁</div>
              <p className="text-white text-sm font-medium mb-1">Dosya Seç</p>
              <p className="text-gray-600 text-xs">.pdf .docx .doc .txt</p>
              <input type="file" accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="hidden" onChange={handleFileUpload} />
            </label>
            {cvText && <div className="mt-2 bg-green-900/20 border border-green-800 rounded-lg px-3 py-2"><p className="text-green-400 text-xs">✅ Dosya okundu</p></div>}
          </div>
        )}
        {mode === 'text' && !cvData && (
          <div>
            <button onClick={()=>setMode(null)} className="text-gray-500 hover:text-white text-xs mb-2">← Geri</button>
            <textarea value={cvText} onChange={e=>setCvText(e.target.value)}
              placeholder="Adım..., yazılım geliştirici olarak 3 yıl çalıştım..."
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-3 py-2.5 h-40 outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm mb-2" />
            {loading
              ? <div className="bg-gray-900 border border-gray-800 rounded-xl"><LoadingAnimation text="Oluşturuluyor..." /></div>
              : <button onClick={()=>generateCV(true)} disabled={!cvText}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm py-2.5 rounded-xl">✨ CV Oluştur</button>
            }
          </div>
        )}
        {mode && cvData && (
          <div className="bg-green-900/20 border border-green-800 rounded-xl px-3 py-2.5">
            <p className="text-green-400 text-xs mb-1">✅ CV oluşturuldu</p>
            <button onClick={resetAll} className="text-xs text-gray-500 hover:text-white">Yeniden oluştur →</button>
          </div>
        )}
        {loading && mode==='upload' && <div className="bg-gray-900 border border-gray-800 rounded-xl"><LoadingAnimation text="CV oluşturuluyor..." /></div>}
      </div>
    ),

    /* Eylemler */
    actions: (
      <div className="space-y-2">
        {!cvData && <p className="text-gray-600 text-xs text-center py-4">Önce bir CV oluşturun</p>}
        {cvData && (
          <>
            <button onClick={handleDownloadPDF}
              className="w-full flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.download}<span>PDF İndir</span>
            </button>
            <button onClick={()=>{const c=JSON.parse(JSON.stringify(cvData));setEditData(c);setEditMode(v=>!v)}}
              className="w-full flex items-center gap-2.5 bg-yellow-600/90 hover:bg-yellow-600 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.edit}<span>{editMode?'Düzenlemeyi Kapat':'CV\'yi Düzenle'}</span>
            </button>
            <button onClick={handleShare} disabled={sharing}
              className="w-full flex items-center gap-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.share}<span>{sharing?'Oluşturuluyor...':'CV\'yi Paylaş'}</span>
            </button>
            {shareLink && (
              <div className="bg-gray-900 border border-green-800 rounded-xl p-3">
                <p className="text-green-400 text-xs mb-1.5">✅ Link hazır!</p>
                <div className="flex gap-1.5">
                  <input value={shareLink} readOnly className="flex-1 bg-gray-800 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none min-w-0" />
                  <button onClick={()=>{navigator.clipboard.writeText(shareLink);alert('Kopyalandı!')}} className="bg-green-600 text-white text-xs px-2.5 py-1.5 rounded-lg shrink-0">Kopyala</button>
                </div>
              </div>
            )}
            <button onClick={resetAll}
              className="w-full flex items-center gap-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.refresh}<span>Yeniden Oluştur</span>
            </button>

            {/* Düzenleme formu */}
            {editMode && editData && (
              <div className="bg-gray-900 border border-yellow-700/50 rounded-xl p-3 mt-2">
                <p className="text-yellow-400 text-xs font-medium mb-2">CV Bilgilerini Düzenle</p>
                <div className="space-y-1.5">
                  {[['name','Ad Soyad'],['email','Email'],['phone','Telefon'],['location','Şehir']].map(([k,l])=>(
                    <input key={k} type="text" placeholder={l} value={editData[k]||''}
                      onChange={e=>setEditData({...editData,[k]:e.target.value})}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 outline-none text-xs border border-gray-700 focus:border-yellow-600" />
                  ))}
                  <textarea placeholder="Hakkımda" value={editData.summary||''}
                    onChange={e=>setEditData({...editData,summary:e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 outline-none text-xs h-16 resize-none border border-gray-700 focus:border-yellow-600" />
                  <input type="text" placeholder="Beceriler (virgülle)" value={editData.skills?.join(', ')||''}
                    onChange={e=>setEditData({...editData,skills:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 outline-none text-xs border border-gray-700 focus:border-yellow-600" />
                </div>
                <button onClick={handleEditSave} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2 rounded-lg mt-2">✅ Kaydet</button>
              </div>
            )}
          </>
        )}
      </div>
    ),

    /* Araçlar */
    tools: (
      <div className="space-y-3">
        {!cvData && <p className="text-gray-600 text-xs text-center py-4">Önce bir CV oluşturun</p>}
        {cvData && (
          <>
            {/* Puan */}
            <button onClick={handleScoreCV} disabled={scoring}
              className="w-full flex items-center gap-2.5 bg-purple-700/80 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.star}<span>{scoring?'Puanlanıyor...':'CV\'yi Puanla'}</span>
            </button>
            {scoreData && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-xs font-medium">Toplam Puan</span>
                  <span className={`text-lg font-bold ${(scoreData.totalScore??scoreData.toplam_puan)>=80?'text-green-400':(scoreData.totalScore??scoreData.toplam_puan)>=60?'text-yellow-400':'text-red-400'}`}>
                    {scoreData.totalScore??scoreData.toplam_puan??'—'}/100
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${scoreData.totalScore??scoreData.toplam_puan??0}%`}} />
                </div>
                {scoreData.strengths?.length>0&&<div className="mb-1.5"><p className="text-green-400 text-xs font-medium mb-0.5">💪 Güçlü</p>{scoreData.strengths.slice(0,2).map((s,i)=><p key={i} className="text-gray-400 text-xs">• {s}</p>)}</div>}
                {scoreData.improvements?.length>0&&<div><p className="text-yellow-400 text-xs font-medium mb-0.5">🔧 İyileştir</p>{scoreData.improvements.slice(0,2).map((s,i)=><p key={i} className="text-gray-400 text-xs">• {s}</p>)}</div>}
              </div>
            )}

            {/* Çeviri */}
            <div>
              <p className="text-gray-500 text-xs mb-1.5">Dil Çevirisi</p>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={()=>handleTranslate('en')} disabled={translating||currentLang==='en'}
                  className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white text-xs py-2 rounded-lg transition-all">
                  {Icon.globe}<span>🇬🇧 İngilizce</span>
                </button>
                <button onClick={()=>handleTranslate('tr')} disabled={translating||currentLang==='tr'}
                  className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-white text-xs py-2 rounded-lg transition-all">
                  {Icon.globe}<span>🇹🇷 Türkçe</span>
                </button>
              </div>
            </div>

            {/* LinkedIn */}
            <button onClick={handleLinkedin} disabled={generatingLinkedin}
              className="w-full flex items-center gap-2.5 bg-blue-800/70 hover:bg-blue-800 disabled:opacity-50 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.linkedin}<span>{generatingLinkedin?'Oluşturuluyor...':'LinkedIn Özeti'}</span>
            </button>
            {linkedinSummary && (
              <div className="bg-gray-900 border border-blue-900 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-blue-400 text-xs font-medium">LinkedIn Özeti</p>
                  <button onClick={()=>navigator.clipboard.writeText(linkedinSummary)} className="text-blue-400 text-xs border border-blue-900 px-2 py-0.5 rounded-md">Kopyala</button>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">{linkedinSummary}</p>
              </div>
            )}

            {/* Referans */}
            <button onClick={()=>setShowReferenceForm(v=>!v)}
              className="w-full flex items-center gap-2.5 bg-orange-700/70 hover:bg-orange-700 text-white text-sm py-2.5 px-4 rounded-xl transition-all">
              {Icon.ref}<span>Referans Mektubu</span>
            </button>
            {showReferenceForm && (
              <div className="bg-gray-900 border border-orange-800/50 rounded-xl p-3">
                <div className="space-y-1.5 mb-2">
                  {[['refName','Ad Soyad'],['refPosition','Pozisyon'],['refCompany','Şirket'],['relationship','İlişki']].map(([k,p])=>(
                    <input key={k} type="text" placeholder={p} value={referenceInfo[k]}
                      onChange={e=>setReferenceInfo({...referenceInfo,[k]:e.target.value})}
                      className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 outline-none text-xs border border-gray-700 focus:border-orange-600" />
                  ))}
                </div>
                <button onClick={handleReference} disabled={generatingReference||!referenceInfo.refName}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs py-2 rounded-lg">
                  {generatingReference?'Oluşturuluyor...':'Mektubu Oluştur'}
                </button>
              </div>
            )}
            {referenceLetter && (
              <div className="bg-gray-900 border border-orange-900 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-orange-400 text-xs font-medium">Referans Mektubu</p>
                  <button onClick={()=>navigator.clipboard.writeText(referenceLetter)} className="text-orange-400 text-xs border border-orange-900 px-2 py-0.5 rounded-md">Kopyala</button>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line line-clamp-6">{referenceLetter}</p>
              </div>
            )}
          </>
        )}
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">

      {/* Geliştirme Modalı */}
      {showImproveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-3xl mb-3 text-center">🤖</div>
            <h2 className="text-white text-lg font-bold text-center mb-2">CV'yi Geliştirelim mi?</h2>
            <p className="text-gray-400 text-sm text-center mb-4 leading-relaxed">
              Yapay zeka içeriği profesyonel hale getirsin mi?
            </p>
            {pendingPhotoBase64 && <div className="bg-green-900/20 border border-green-800 rounded-xl px-3 py-2 mb-4"><p className="text-green-400 text-xs">✅ Belgeden fotoğraf çıkarıldı, CV'ye eklenecek.</p></div>}
            {pendingHasPhoto && !pendingPhotoBase64 && <div className="bg-blue-900/20 border border-blue-800 rounded-xl px-3 py-2 mb-4"><p className="text-blue-300 text-xs">📸 PDF'de fotoğraf tespit edildi. Fotoğraf sekmesinden manuel yükleyebilirsiniz.</p></div>}
            <div className="space-y-2">
              <button onClick={()=>handleImproveChoice(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all">✨ Evet, Geliştir</button>
              <button onClick={()=>handleImproveChoice(false)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl transition-all text-sm">📋 Hayır, Olduğu Gibi Al</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">

        {/* ══ ICON BAR + PANEL ══ */}
        <div className="flex flex-row lg:flex-row w-full lg:w-auto lg:flex-shrink-0">

          {/* Dikey icon bar — desktop */}
          <div className="hidden lg:flex flex-col items-center gap-1 py-4 px-2 bg-gray-900/80 border-r border-gray-800 w-16">
            {/* Geri butonu */}
            <button onClick={()=>router.push('/dashboard')}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-gray-800 transition-all mb-2"
              title="Geri">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <div className="w-8 h-px bg-gray-800 mb-2" />
            {TABS.map(tab => (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} title={tab.label}
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeTab===tab.id?'bg-blue-600 text-white shadow-lg shadow-blue-600/30':'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                {tab.icon}
              </button>
            ))}
            {/* CV oluşturuldu badge */}
            {cvData && (
              <div className="mt-auto mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto" title="CV hazır" />
              </div>
            )}
          </div>

          {/* Panel */}
          <div className="lg:w-72 xl:w-80 bg-gray-950 border-r border-gray-800 lg:overflow-y-auto lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">

            {/* Mobile: sub-header + tab bar */}
            <div className="lg:hidden sticky top-0 z-10 bg-gray-950 border-b border-gray-800">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-800/50">
                <button onClick={()=>router.push('/dashboard')} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs bg-gray-800 px-2.5 py-1.5 rounded-lg transition-all">← Geri</button>
                <span className="text-white text-sm font-semibold">CV Oluştur</span>
                {cvData && <span className="ml-auto w-2 h-2 bg-green-500 rounded-full" />}
              </div>
              <div className="flex overflow-x-auto gap-0.5 px-3 py-2 scrollbar-none">
                {TABS.map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab===tab.id?'bg-blue-600 text-white':'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                    {tab.icon}<span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop: panel başlık */}
            <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
              <p className="text-white text-sm font-semibold">{TABS.find(t=>t.id===activeTab)?.label}</p>
              {cvData && activeTab!=='actions' && (
                <button onClick={()=>setActiveTab('actions')} className="text-blue-400 text-xs hover:text-blue-300">Eylemler →</button>
              )}
            </div>

            {/* Panel içeriği */}
            <div className="px-4 py-4">
              {panels[activeTab]}
            </div>
          </div>
        </div>

        {/* ══ SAĞ: Önizleme ══ */}
        <div className="flex-1 bg-gray-900 flex flex-col">

          {/* Mobile CV toggle */}
          {cvData && (
            <button onClick={()=>setShowMobilePreview(v=>!v)}
              className="lg:hidden flex items-center justify-center gap-2 bg-gray-800 border-b border-gray-700 text-gray-300 text-sm py-2.5 transition-all">
              {showMobilePreview ? '🙈 Önizlemeyi Gizle' : "👁 CV Önizleme"}
            </button>
          )}

          {/* Mobile önizleme */}
          {showMobilePreview && cvData && (
            <div className="lg:hidden p-3 border-b border-gray-800">
              <CVComponent cvData={cvData} color={color} />
            </div>
          )}

          {/* Desktop önizleme */}
          <div className="hidden lg:flex flex-col flex-1 h-[calc(100vh-64px)] sticky top-16">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 shrink-0">
              <p className="text-gray-400 text-sm font-medium">Canlı Önizleme</p>
              <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-600/30">{template}</span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <CVComponent cvData={cvData||previewData} color={color} />
            </div>
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
