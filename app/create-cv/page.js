'use client'
import { useState, Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { CVComponents, colorOptions } from '../components/CVTemplates'

const NAV_H_CLS = 'h-[calc(100vh-64px)]'

const emptyCV = { name:'',email:'',phone:'',location:'',summary:'',experience:[],education:[],skills:[] }
const defaultFilters = { brightness:100, contrast:100, saturation:100, shape:'circle', preset:'normal' }

const PRESETS = [
  { id:'normal', label:'Normal', css:'' },
  { id:'bw',     label:'S&B',   css:'grayscale(100%)' },
  { id:'sepia',  label:'Sepya', css:'sepia(80%)' },
  { id:'warm',   label:'Sıcak', css:'sepia(30%) saturate(140%)' },
  { id:'cool',   label:'Soğuk', css:'hue-rotate(20deg) saturate(90%)' },
]
const SHAPES = [
  { id:'circle',  label:'Daire',    cls:'rounded-full' },
  { id:'rounded', label:'Yuvarlak', cls:'rounded-2xl'  },
  { id:'square',  label:'Kare',     cls:'rounded-none' },
]

async function bakePhoto(src, f) {
  return new Promise(resolve => {
    const img = new Image(); img.crossOrigin='anonymous'
    img.onload = () => {
      const OUT=300, cv=document.createElement('canvas')
      cv.width=OUT; cv.height=OUT
      const ctx=cv.getContext('2d')
      let css=`brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%)`
      if(f.preset==='bw')    css+=' grayscale(100%)'
      if(f.preset==='sepia') css+=' sepia(80%)'
      if(f.preset==='warm')  css+=' sepia(30%) saturate(140%)'
      if(f.preset==='cool')  css+=' hue-rotate(20deg) saturate(90%)'
      ctx.filter=css
      if(f.shape==='circle') {ctx.beginPath();ctx.arc(OUT/2,OUT/2,OUT/2,0,Math.PI*2);ctx.clip()}
      if(f.shape==='rounded'){ctx.beginPath();ctx.roundRect(0,0,OUT,OUT,40);ctx.clip()}
      const s=Math.min(img.width,img.height)
      ctx.drawImage(img,(img.width-s)/2,Math.max(0,(img.height-s)/2-img.height*.08),s,s,0,0,OUT,OUT)
      resolve(cv.toDataURL('image/jpeg',.92))
    }
    img.onerror=()=>resolve(src); img.src=src
  })
}

/* ─── Icons ─── */
const Ic = {
  back:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>,
  photo: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3"/><path strokeLinecap="round" d="M20 7h-3l-2-2H9L7 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>,
  design:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path strokeLinecap="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>,
  bolt:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  gear:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>,
  dl:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  edit:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>,
  share: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>,
  spin:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  star:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>,
  globe: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  doc:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  li:    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  eye:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>,
}

const TABS = [
  { id:'photo',   label:'Fotoğraf', icon:Ic.photo  },
  { id:'design',  label:'Tasarım',  icon:Ic.design },
  { id:'actions', label:'Eylemler', icon:Ic.bolt   },
  { id:'tools',   label:'Araçlar',  icon:Ic.gear   },
]

function Slider({ label, value, onChange, min=0, max=200 }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-gray-400 text-xs">{label}</span>
        <span className="text-gray-500 text-xs tabular-nums">{value}%</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e=>onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500 bg-gray-700"/>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════ */
function CreateCVContent() {
  const sp=useSearchParams()
  const isEdit=sp.get('edit')==='1'
  const fileRef=useRef(null)

  const [template,setTemplate]=useState(sp.get('template')||'Modern')
  const [color,setColor]=useState('blue')
  const [activeTab,setActiveTab]=useState('photo')
  const [startMode,setStartMode]=useState(isEdit?'done':null)

  const [rawPhoto,setRawPhoto]=useState(null)
  const [cvPhoto,setCvPhoto]=useState(null)
  const [filters,setFilters]=useState(defaultFilters)
  const [photoLoading,setPhotoLoading]=useState(false)
  const [applying,setApplying]=useState(false)

  const [cvText,setCvText]=useState('')
  const [loading,setLoading]=useState(false)
  const [cvData,setCvData]=useState(null)
  const [previewData,setPreviewData]=useState(emptyCV)

  const [showImprove,setShowImprove]=useState(false)
  const [pendingPhoto64,setPendingPhoto64]=useState(null)
  const [pendingHasPhoto,setPendingHasPhoto]=useState(false)

  const [scoreData,setScoreData]=useState(null)
  const [scoring,setScoring]=useState(false)
  const [translating,setTranslating]=useState(false)
  const [currentLang,setCurrentLang]=useState('tr')
  const [linkedinTxt,setLinkedinTxt]=useState(null)
  const [genLinkedin,setGenLinkedin]=useState(false)
  const [refLetter,setRefLetter]=useState(null)
  const [genRef,setGenRef]=useState(false)
  const [showRefForm,setShowRefForm]=useState(false)
  const [refInfo,setRefInfo]=useState({refName:'',refPosition:'',refCompany:'',relationship:''})

  const [editMode,setEditMode]=useState(false)
  const [editData,setEditData]=useState(null)
  const [shareLink,setShareLink]=useState(null)
  const [sharing,setSharing]=useState(false)

  /* Mobil önizleme popup */
  const [showMobilePreview,setShowMobilePreview]=useState(false)

  const router=useRouter()
  const CVComponent=CVComponents[template]||CVComponents.Modern

  const prevCss=[
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    filters.preset==='bw'    ?'grayscale(100%)':'',
    filters.preset==='sepia' ?'sepia(80%)':'',
    filters.preset==='warm'  ?'sepia(30%) saturate(140%)':'',
    filters.preset==='cool'  ?'hue-rotate(20deg) saturate(90%)':'',
  ].filter(Boolean).join(' ')

  const shapeClass=SHAPES.find(s=>s.id===filters.shape)?.cls||'rounded-full'

  useEffect(()=>{
    if(!isEdit) return
    try{
      const raw=sessionStorage.getItem('editCV')
      if(!raw) return
      const {cvData:stored,template:tpl}=JSON.parse(raw)
      if(stored){setCvData(stored);setPreviewData(stored);if(stored.photo){setRawPhoto(stored.photo);setCvPhoto(stored.photo)}setEditData(JSON.parse(JSON.stringify(stored)));setEditMode(true)}
      if(tpl) setTemplate(tpl)
      sessionStorage.removeItem('editCV')
      setActiveTab('actions')
    }catch{}
  },[isEdit])

  const handlePhotoFile=e=>{
    const file=e.target.files[0];if(!file||!file.type.startsWith('image/')) return
    setPhotoLoading(true)
    const r=new FileReader()
    r.onload=async ev=>{
      const src=ev.target.result;setRawPhoto(src);setFilters(defaultFilters)
      const p=await bakePhoto(src,defaultFilters);setCvPhoto(p)
      if(cvData){const u={...cvData,photo:p};setCvData(u);setPreviewData(u)}
      setPhotoLoading(false)
    }
    r.readAsDataURL(file)
  }

  const applyFilters=async()=>{
    if(!rawPhoto) return;setApplying(true)
    const p=await bakePhoto(rawPhoto,filters);setCvPhoto(p)
    if(cvData){const u={...cvData,photo:p};setCvData(u);setPreviewData(u)}
    setApplying(false)
  }

  const removePhoto=()=>{
    setRawPhoto(null);setCvPhoto(null);setFilters(defaultFilters)
    if(cvData){const u={...cvData};delete u.photo;setCvData(u);setPreviewData(u)}
  }

  const handleFileUpload=async e=>{
    const file=e.target.files[0];if(!file){setStartMode(null);return}
    const fd=new FormData();fd.append('file',file)
    try{
      const res=await fetch('/api/parse-cv',{method:'POST',body:fd})
      const data=await res.json()
      if(data.isScanned){alert(data.error);setStartMode('text');return}
      if(!data.success){alert('Dosya okunamadı: '+data.error);setStartMode(null);return}
      setCvText(data.text);setPendingHasPhoto(data.hasPhoto||false);setPendingPhoto64(data.photoBase64||null);setShowImprove(true)
    }catch{alert('Bir hata oluştu');setStartMode(null)}
  }

  const handleImprove=async improve=>{
    setShowImprove(false)
    if(pendingPhoto64){setRawPhoto(pendingPhoto64);const p=await bakePhoto(pendingPhoto64,defaultFilters).catch(()=>null);if(p)setCvPhoto(p)}
    await generateCV(improve)
  }

  const generateCV=async(improveContent=true)=>{
    if(!cvText) return;setLoading(true)
    try{
      const {data:{session}}=await supabase.auth.getSession()
      const res=await fetch('/api/generate-cv',{method:'POST',headers:{'Content-Type':'application/json','authorization':`Bearer ${session?.access_token||''}`},body:JSON.stringify({cvContent:cvText,template,isRawText:startMode==='text',improveContent})})
      const data=await res.json()
      if(data.success){
        const photo=cvPhoto||(pendingPhoto64?await bakePhoto(pendingPhoto64,defaultFilters).catch(()=>null):undefined)
        const newCV={...data.cvData,photo:photo||undefined}
        setCvData(newCV);setPreviewData(newCV);setStartMode('done')
        const {data:{user}}=await supabase.auth.getUser()
        if(user) await supabase.from('cvs').insert({user_id:user.id,template,cv_data:newCV})
        setActiveTab('actions')
      } else alert('Hata: '+data.error)
    }catch{alert('Bir hata oluştu')}
    setLoading(false)
  }

  const downloadPDF=()=>{
    const el=document.getElementById('cv-preview')
    if(!el) return alert('Önce CV oluşturun.')
    const styles=Array.from(document.styleSheets).map(s=>{try{return Array.from(s.cssRules).map(r=>r.cssText).join('\n')}catch{return ''}}).join('\n')
    const win=window.open('','_blank','width=900,height=700')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${cvData?.name||'CV'} - Resumind</title><style>${styles}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{margin:0;padding:0;background:white;}@page{margin:0;size:A4;}</style></head><body>${el.outerHTML}<script>window.onload=function(){setTimeout(function(){window.print();window.close();},600)}<\/script></body></html>`)
    win.document.close()
  }

  const translate=async lang=>{
    if(!cvData) return;setTranslating(true)
    try{const res=await fetch('/api/translate-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData,targetLanguage:lang==='en'?'İngilizce':'Türkçe'})});const data=await res.json();if(data.success){const t={...data.translatedCV,photo:cvPhoto||undefined};setCvData(t);setPreviewData(t);setCurrentLang(lang)}else alert('Hata: '+data.error)}catch{alert('Hata')}
    setTranslating(false)
  }

  const scoreCV=async()=>{
    if(!cvData) return;setScoring(true)
    try{const res=await fetch('/api/score-cv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData})});const data=await res.json();if(data.success)setScoreData(data.scoreData);else alert('Hata: '+data.error)}catch{}
    setScoring(false)
  }

  const linkedin=async()=>{
    if(!cvData) return;setGenLinkedin(true)
    try{const res=await fetch('/api/linkedin-summary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData})});const data=await res.json();if(data.success)setLinkedinTxt(data.summary);else alert('Hata: '+data.error)}catch{}
    setGenLinkedin(false)
  }

  const reference=async()=>{
    if(!cvData||!refInfo.refName) return;setGenRef(true)
    try{const res=await fetch('/api/reference-letter',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cvData,referenceInfo:refInfo})});const data=await res.json();if(data.success){setRefLetter(data.letter);setShowRefForm(false)}else alert('Hata: '+data.error)}catch{}
    setGenRef(false)
  }

  const shareCV=async()=>{
    if(!cvData) return;setSharing(true)
    try{
      const shareId=Math.random().toString(36).substring(2,10)
      const {data:{user}}=await supabase.auth.getUser()
      if(user){
        const {data:ex}=await supabase.from('cvs').select('id').eq('user_id',user.id).eq('template',template).order('created_at',{ascending:false}).limit(1).single()
        if(ex) await supabase.from('cvs').update({share_id:shareId,is_shared:true}).eq('id',ex.id)
        setShareLink(`${window.location.origin}/cv/${shareId}`)
      }
    }catch{alert('Hata')}
    setSharing(false)
  }

  const saveEdit=()=>{
    const n={...JSON.parse(JSON.stringify(editData)),photo:cvPhoto||undefined}
    setCvData(n);setPreviewData(n);setEditMode(false)
  }

  const resetAll=()=>{
    setCvData(null);setPreviewData(emptyCV);setStartMode(null)
    setScoreData(null);setLinkedinTxt(null);setRefLetter(null)
    setEditMode(false);setCvText('');setActiveTab('photo')
    setShowImprove(false);setPendingPhoto64(null);setPendingHasPhoto(false)
    setShowMobilePreview(false)
  }

  /* ─── PANELLER ─── */
  const photoPanel=(
    <div className="space-y-4">
      <div className="flex justify-center py-1">
        <div className={`w-24 h-24 overflow-hidden bg-gray-800 border-2 border-gray-700 flex items-center justify-center ${shapeClass}`}>
          {photoLoading
            ?<div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
            :rawPhoto
              ?<img src={rawPhoto} className="w-full h-full object-cover" style={{filter:prevCss}} alt=""/>
              :<svg viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth={1.5} className="w-10 h-10"><path strokeLinecap="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          }
        </div>
      </div>
      <label className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 text-white text-sm px-4 py-2.5 rounded-xl cursor-pointer transition-all">
        {rawPhoto?'📷 Değiştir':'📷 Fotoğraf Yükle'}
        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoFile}/>
      </label>
      {rawPhoto&&<button onClick={removePhoto} className="w-full text-red-400 hover:text-red-300 text-xs py-1">× Kaldır</button>}
      {rawPhoto&&(
        <>
          <hr className="border-gray-800"/>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Şekil</p>
            <div className="grid grid-cols-3 gap-1.5">
              {SHAPES.map(s=>(
                <button key={s.id} onClick={()=>setFilters(f=>({...f,shape:s.id}))}
                  className={`py-2 text-xs rounded-lg border transition-all ${filters.shape===s.id?'bg-blue-600 border-blue-500 text-white':'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Filtre</p>
            <div className="grid grid-cols-5 gap-1">
              {PRESETS.map(p=>(
                <button key={p.id} onClick={()=>setFilters(f=>({...f,preset:p.id}))}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded-xl border transition-all ${filters.preset===p.id?'border-blue-500 bg-blue-600/10':'border-gray-700 bg-gray-800'}`}>
                  <div className="w-8 h-8 rounded-lg overflow-hidden"><img src={rawPhoto} className="w-full h-full object-cover" style={{filter:p.css||''}} alt=""/></div>
                  <span className={`text-xs leading-none ${filters.preset===p.id?'text-blue-400':'text-gray-600'}`}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Ayarlar</p>
            <Slider label="Parlaklık"  value={filters.brightness}  onChange={v=>setFilters(f=>({...f,brightness:v}))}/>
            <Slider label="Kontrast"   value={filters.contrast}    onChange={v=>setFilters(f=>({...f,contrast:v}))}/>
            <Slider label="Doygunluk" value={filters.saturation}  onChange={v=>setFilters(f=>({...f,saturation:v}))}/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={()=>setFilters(f=>({...f,brightness:100,contrast:100,saturation:100,preset:'normal'}))}
              className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs py-2 rounded-xl border border-gray-700">↺ Sıfırla</button>
            <button onClick={applyFilters} disabled={applying}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs py-2 rounded-xl font-medium">
              {applying?'Uygulanıyor...':'✓ Uygula'}
            </button>
          </div>
          {cvPhoto&&<p className="text-green-400 text-xs text-center">✅ CV'ye uygulandı</p>}
        </>
      )}
      {!rawPhoto&&<p className="text-gray-600 text-xs text-center pt-2 leading-relaxed">Fotoğraf yükledikten sonra şekil, filtre ve renk ayarları aktif olur.</p>}
    </div>
  )

  const designPanel=(
    <div className="space-y-5">
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Şablon</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(CVComponents).map(t=>(
            <button key={t} onClick={()=>setTemplate(t)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${template===t?'bg-blue-600 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/60'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2.5">Renk</p>
        <div className="flex gap-3">
          {colorOptions.map(c=>(
            <button key={c.id} onClick={()=>setColor(c.id)} title={c.label}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color===c.id?'border-white scale-110 shadow-lg':'border-gray-700 opacity-60 hover:opacity-100 hover:scale-105'}`}
              style={{backgroundColor:c.hex}}/>
          ))}
        </div>
      </div>
    </div>
  )

  const actionsPanel=(
    <div className="space-y-2.5">
      {!cvData
        ?<div className="text-center py-8"><p className="text-gray-600 text-sm mb-2">CV henüz oluşturulmadı</p><button onClick={resetAll} className="text-blue-400 text-xs hover:text-blue-300">← Başa dön</button></div>
        :<>
            <button onClick={downloadPDF} className="w-full flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-3 px-4 rounded-xl font-medium">{Ic.dl} PDF İndir</button>
            <button onClick={()=>{const c=JSON.parse(JSON.stringify(cvData));setEditData(c);setEditMode(v=>!v)}}
              className={`w-full flex items-center gap-3 text-white text-sm py-3 px-4 rounded-xl transition-all ${editMode?'bg-yellow-700':'bg-yellow-600/90 hover:bg-yellow-600'}`}>
              {Ic.edit} {editMode?'Düzenlemeyi Kapat':'CV\'yi Düzenle'}
            </button>
            <button onClick={shareCV} disabled={sharing} className="w-full flex items-center gap-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-3 px-4 rounded-xl">{Ic.share} {sharing?'Oluşturuluyor...':'CV\'yi Paylaş'}</button>
            {shareLink&&(
              <div className="bg-gray-800/60 border border-green-800/50 rounded-xl p-3">
                <p className="text-green-400 text-xs mb-2">✅ Link hazır!</p>
                <div className="flex gap-1.5"><input value={shareLink} readOnly className="flex-1 bg-gray-800 text-white rounded-lg px-2.5 py-1.5 text-xs outline-none min-w-0"/><button onClick={()=>{navigator.clipboard.writeText(shareLink);alert('Kopyalandı!')}} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg shrink-0">Kopyala</button></div>
              </div>
            )}
            <button onClick={resetAll} className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm py-3 px-4 rounded-xl border border-gray-700/50">{Ic.spin} Yeniden Oluştur</button>
            {editMode&&editData&&(
              <div className="mt-1 bg-gray-800/40 border border-yellow-700/40 rounded-xl p-4 space-y-2">
                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wide">Bilgileri Düzenle</p>
                {[['name','Ad Soyad'],['email','Email'],['phone','Telefon'],['location','Şehir']].map(([k,l])=>(
                  <input key={k} type="text" placeholder={l} value={editData[k]||''} onChange={e=>setEditData({...editData,[k]:e.target.value})}
                    className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none text-xs border border-gray-700/60 focus:border-yellow-600/60 placeholder-gray-600"/>
                ))}
                <textarea placeholder="Hakkımda" value={editData.summary||''} onChange={e=>setEditData({...editData,summary:e.target.value})}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none text-xs h-16 resize-none border border-gray-700/60 placeholder-gray-600"/>
                <input type="text" placeholder="Beceriler (virgülle)" value={editData.skills?.join(', ')||''} onChange={e=>setEditData({...editData,skills:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 outline-none text-xs border border-gray-700/60 placeholder-gray-600"/>
                {editData.experience?.map((exp,i)=>(
                  <div key={i} className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-700/30 space-y-1">
                    <p className="text-yellow-500/80 text-xs">Deneyim {i+1}</p>
                    {[['position','Pozisyon'],['company','Şirket'],['duration','Süre']].map(([f,p])=>(
                      <input key={f} type="text" placeholder={p} value={exp[f]||''} onChange={e=>{const n=[...editData.experience];n[i]={...n[i],[f]:e.target.value};setEditData({...editData,experience:n})}}
                        className="w-full bg-gray-800 text-white rounded-lg px-2.5 py-1.5 outline-none text-xs border border-gray-700/40 placeholder-gray-600"/>
                    ))}
                    <textarea placeholder="Açıklama" value={exp.description||''} onChange={e=>{const n=[...editData.experience];n[i]={...n[i],description:e.target.value};setEditData({...editData,experience:n})}}
                      className="w-full bg-gray-800 text-white rounded-lg px-2.5 py-1.5 outline-none text-xs h-12 resize-none border border-gray-700/40 placeholder-gray-600"/>
                  </div>
                ))}
                {editData.education?.map((edu,i)=>(
                  <div key={i} className="bg-gray-900/60 rounded-lg p-2.5 border border-gray-700/30 space-y-1">
                    <p className="text-yellow-500/80 text-xs">Eğitim {i+1}</p>
                    {[['school','Okul'],['degree','Bölüm'],['year','Yıl']].map(([f,p])=>(
                      <input key={f} type="text" placeholder={p} value={edu[f]||''} onChange={e=>{const n=[...editData.education];n[i]={...n[i],[f]:e.target.value};setEditData({...editData,education:n})}}
                        className="w-full bg-gray-800 text-white rounded-lg px-2.5 py-1.5 outline-none text-xs border border-gray-700/40 placeholder-gray-600"/>
                    ))}
                  </div>
                ))}
                <button onClick={saveEdit} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2.5 rounded-xl font-medium">✅ Kaydet</button>
              </div>
            )}
          </>
      }
    </div>
  )

  const toolsPanel=(
    <div className="space-y-3">
      {!cvData
        ?<div className="text-center py-8"><p className="text-gray-600 text-sm mb-2">Önce CV oluşturun</p><button onClick={resetAll} className="text-blue-400 text-xs hover:text-blue-300">← Başa dön</button></div>
        :<>
            <button onClick={scoreCV} disabled={scoring} className="w-full flex items-center gap-3 bg-purple-700/80 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-3 px-4 rounded-xl">{Ic.star} {scoring?'Puanlanıyor...':'CV\'yi Puanla'}</button>
            {scoreData&&(
              <div className="bg-gray-800/40 border border-gray-700/40 rounded-xl p-3">
                <div className="flex justify-between items-center mb-2"><span className="text-white text-xs font-medium">Toplam Puan</span><span className={`text-xl font-bold ${(scoreData.totalScore??0)>=80?'text-green-400':(scoreData.totalScore??0)>=60?'text-yellow-400':'text-red-400'}`}>{scoreData.totalScore??scoreData.toplam_puan??'—'}<span className="text-xs text-gray-600 font-normal">/100</span></span></div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mb-2"><div className="bg-blue-500 h-1.5 rounded-full" style={{width:`${scoreData.totalScore??scoreData.toplam_puan??0}%`}}/></div>
                {scoreData.strengths?.slice(0,2).map((s,i)=><p key={i} className="text-gray-500 text-xs">💪 {s}</p>)}
                {scoreData.improvements?.slice(0,2).map((s,i)=><p key={i} className="text-gray-500 text-xs">🔧 {s}</p>)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={()=>translate('en')} disabled={translating||currentLang==='en'} className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 hover:text-white text-xs py-2.5 rounded-xl border border-gray-700/50">{Ic.globe} 🇬🇧 İngilizce</button>
              <button onClick={()=>translate('tr')} disabled={translating||currentLang==='tr'} className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 hover:text-white text-xs py-2.5 rounded-xl border border-gray-700/50">{Ic.globe} 🇹🇷 Türkçe</button>
            </div>
            <button onClick={linkedin} disabled={genLinkedin} className="w-full flex items-center gap-3 bg-blue-800/60 hover:bg-blue-800 disabled:opacity-50 text-white text-sm py-3 px-4 rounded-xl">{Ic.li} {genLinkedin?'Oluşturuluyor...':'LinkedIn Özeti'}</button>
            {linkedinTxt&&(<div className="bg-gray-800/40 border border-blue-900/40 rounded-xl p-3"><div className="flex justify-between items-center mb-2"><p className="text-blue-400 text-xs font-medium">LinkedIn Özeti</p><button onClick={()=>navigator.clipboard.writeText(linkedinTxt)} className="text-blue-400 text-xs border border-blue-900/50 px-2 py-0.5 rounded-md">Kopyala</button></div><p className="text-gray-400 text-xs leading-relaxed line-clamp-4">{linkedinTxt}</p></div>)}
            <button onClick={()=>setShowRefForm(v=>!v)} className="w-full flex items-center gap-3 bg-orange-700/60 hover:bg-orange-700 text-white text-sm py-3 px-4 rounded-xl">{Ic.doc} Referans Mektubu</button>
            {showRefForm&&(<div className="bg-gray-800/40 border border-orange-800/40 rounded-xl p-3 space-y-2">{[['refName','Ad Soyad'],['refPosition','Pozisyon'],['refCompany','Şirket'],['relationship','İlişki']].map(([k,p])=>(<input key={k} type="text" placeholder={p} value={refInfo[k]} onChange={e=>setRefInfo({...refInfo,[k]:e.target.value})} className="w-full bg-gray-800 text-white rounded-lg px-3 py-1.5 outline-none text-xs border border-gray-700/50 placeholder-gray-600"/>))}<button onClick={reference} disabled={genRef||!refInfo.refName} className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs py-2 rounded-lg">{genRef?'Oluşturuluyor...':'Oluştur'}</button></div>)}
            {refLetter&&(<div className="bg-gray-800/40 border border-orange-900/40 rounded-xl p-3"><div className="flex justify-between items-center mb-2"><p className="text-orange-400 text-xs font-medium">Referans Mektubu</p><button onClick={()=>navigator.clipboard.writeText(refLetter)} className="text-orange-400 text-xs border border-orange-900/50 px-2 py-0.5 rounded-md">Kopyala</button></div><p className="text-gray-400 text-xs leading-relaxed whitespace-pre-line line-clamp-5">{refLetter}</p></div>)}
          </>
      }
    </div>
  )

  const panelMap={photo:photoPanel,design:designPanel,actions:actionsPanel,tools:toolsPanel}

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <div className="bg-gray-950 pt-16">
      <input ref={fileRef} type="file"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden" onChange={handleFileUpload}/>

      {/* ── Başlangıç: seçim ── */}
      {startMode===null && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <p className="text-blue-400 text-xs font-semibold mb-3 tracking-widest uppercase">Resumind AI</p>
              <h1 className="text-white text-2xl sm:text-3xl font-bold mb-3 leading-tight">CV'nizi nasıl<br/>oluşturmak istersiniz?</h1>
              <p className="text-gray-500 text-sm">Yapay zeka birkaç saniyede profesyonel CV hazırlasın</p>
            </div>
            <div className="space-y-3">
              <button onClick={()=>{setStartMode('upload');setTimeout(()=>fileRef.current?.click(),50)}}
                className="group w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/60 rounded-2xl p-5 text-left transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-blue-600/15 border border-blue-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-600/25 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm mb-0.5">Belge Yükle</h3>
                    <p className="text-gray-500 text-xs">Mevcut CV'nizi yükleyin, AI profesyonel hale getirir.</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {['PDF','DOCX','TXT'].map(f=><span key={f} className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700/50">{f}</span>)}
                  </div>
                </div>
              </button>
              <button onClick={()=>setStartMode('text')}
                className="group w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/60 rounded-2xl p-5 text-left transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-purple-600/15 border border-purple-600/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-600/25 transition-all">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth={1.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-sm mb-0.5">Manuel Yaz</h3>
                    <p className="text-gray-500 text-xs">Kısa notlar yazın, AI profesyonel CV'ye dönüştürsün.</p>
                  </div>
                  <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded border border-purple-800/40 shrink-0">AI</span>
                </div>
              </button>
            </div>
            <div className="text-center mt-6">
              <button onClick={()=>router.push('/dashboard')} className="text-gray-600 hover:text-gray-400 text-sm">← Dashboard'a dön</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manuel yaz ── */}
      {startMode==='text' && !loading && !cvData && (
        <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center px-4 py-8">
          <div className="w-full max-w-lg mx-auto">
            <button onClick={()=>setStartMode(null)} className="flex items-center gap-1.5 text-gray-600 hover:text-white text-sm mb-6">{Ic.back} Geri</button>
            <h2 className="text-white text-xl font-bold mb-1.5">Bilgilerinizi yazın</h2>
            <p className="text-gray-500 text-sm mb-4">Kısa notlar yeterli — AI profesyonel hale getirecek</p>
            <textarea value={cvText} onChange={e=>setCvText(e.target.value)} autoFocus
              placeholder="Örn: Adım Ahmet Yılmaz, 3 yıldır yazılım geliştirici olarak çalışıyorum..."
              className="w-full bg-gray-900 border border-gray-800 focus:border-blue-500/50 text-white rounded-2xl px-4 py-3.5 h-44 outline-none resize-none text-sm placeholder-gray-600 mb-4"/>
            <button onClick={()=>generateCV(true)} disabled={!cvText.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-2xl text-sm">✨ CV Oluştur</button>
          </div>
        </div>
      )}

      {/* ── Yükleme ── */}
      {loading && (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-14 h-14 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5"/>
            <p className="text-white text-base font-medium mb-1.5">CV oluşturuluyor...</p>
            <p className="text-gray-500 text-sm">Yapay zeka bilgilerinizi işliyor</p>
          </div>
        </div>
      )}

      {/* ── Geliştirme Modalı ── */}
      {showImprove && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-6 sm:pb-0">
          <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <div className="text-3xl mb-3 text-center">🤖</div>
            <h2 className="text-white text-base font-bold text-center mb-2">CV'yi Geliştirelim mi?</h2>
            <p className="text-gray-500 text-sm text-center mb-4">Yapay zeka içeriği profesyonel hale getirsin mi?</p>
            {pendingPhoto64&&<div className="bg-green-900/20 border border-green-800/40 rounded-xl px-3 py-2 mb-3"><p className="text-green-400 text-xs">✅ Belgeden fotoğraf çıkarıldı.</p></div>}
            {pendingHasPhoto&&!pendingPhoto64&&<div className="bg-blue-900/20 border border-blue-800/40 rounded-xl px-3 py-2 mb-3"><p className="text-blue-400 text-xs">📸 Fotoğraf sekmesinden yükleyebilirsiniz.</p></div>}
            <div className="space-y-2">
              <button onClick={()=>handleImprove(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl">✨ Evet, Geliştir</button>
              <button onClick={()=>handleImprove(false)} className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 py-2.5 rounded-xl text-sm">📋 Olduğu Gibi Al</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobil Önizleme Popup ── */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm lg:hidden" onClick={()=>setShowMobilePreview(false)}>
          <div className="absolute inset-x-0 bottom-0 top-16 flex flex-col" onClick={e=>e.stopPropagation()}>
            {/* Başlık */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
              <div>
                <p className="text-white text-sm font-semibold">CV Önizleme</p>
                <p className="text-gray-500 text-xs">{template} · {color}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={downloadPDF} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg">{Ic.dl} PDF</button>
                <button onClick={()=>setShowMobilePreview(false)} className="w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg">
                  {Ic.close}
                </button>
              </div>
            </div>
            {/* CV içeriği — scroll */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-3">
              <CVComponent cvData={cvData||previewData} color={color}/>
            </div>
          </div>
        </div>
      )}

      {/* ── Ana Layout ── */}
      {(startMode==='done'||isEdit) && (
        <div className={`flex ${NAV_H_CLS} overflow-hidden`}>

          {/* Dikey icon bar — desktop */}
          <div className="hidden lg:flex flex-col items-center gap-1 py-4 px-2 bg-[#0d1117] border-r border-gray-800/80 w-14 shrink-0">
            <button onClick={()=>router.push('/dashboard')} title="Geri"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:text-white hover:bg-gray-800 mb-3">
              {Ic.back}
            </button>
            <div className="w-6 h-px bg-gray-800 mb-2"/>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} title={tab.label}
                className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${activeTab===tab.id?'bg-blue-600 text-white shadow-lg shadow-blue-600/30':'text-gray-600 hover:text-gray-300 hover:bg-gray-800/80'}`}>
                {tab.icon}
                {tab.id==='photo'   && cvPhoto && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full border border-gray-900"/>}
                {tab.id==='actions' && cvData  && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-400 rounded-full border border-gray-900"/>}
              </button>
            ))}
          </div>

          {/* Panel */}
          <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-gray-950 border-r border-gray-800/60 flex flex-col overflow-hidden">

            {/* ── Mobil Header — düzeltildi ── */}
            <div className="lg:hidden shrink-0 bg-gray-900/80 border-b border-gray-800/60">
              {/* Üst satır: Geri + Başlık + Hazır — navbar'dan yeterli mesafe */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-2">
                <button onClick={()=>router.push('/dashboard')}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg border border-gray-700/50 transition-all shrink-0">
                  {Ic.back}
                  <span>Geri</span>
                </button>
                <span className="text-white text-sm font-semibold">CV Oluştur</span>
                <div className="ml-auto flex items-center gap-2">
                  {cvData && (
                    <span className="flex items-center gap-1 text-green-400 text-xs">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                      Hazır
                    </span>
                  )}
                </div>
              </div>

              {/* Icon tab bar — sadece ikonlar, temiz görünüm */}
              <div className="flex border-t border-gray-800/60">
                {TABS.map(tab=>(
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                    className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-all ${activeTab===tab.id?'text-blue-400 border-b-2 border-blue-500':'text-gray-500 hover:text-gray-300'}`}>
                    <span className={`transition-all ${activeTab===tab.id?'scale-110':''}`}>{tab.icon}</span>
                    <span className={`text-[10px] leading-none font-medium ${activeTab===tab.id?'text-blue-400':'text-gray-600'}`}>{tab.label}</span>
                    {tab.id==='photo'   && cvPhoto && <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 bg-green-500 rounded-full"/>}
                    {tab.id==='actions' && cvData  && <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full"/>}
                  </button>
                ))}
                {/* Önizleme butonu */}
                <button onClick={()=>setShowMobilePreview(true)}
                  className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs text-gray-500 hover:text-blue-400 transition-all">
                  {Ic.eye}
                  <span className="text-[10px] leading-none font-medium text-gray-600">Önizle</span>
                </button>
              </div>
            </div>

            {/* Desktop başlık */}
            <div className="hidden lg:flex items-center shrink-0 px-4 py-3 border-b border-gray-800/40">
              <p className="text-gray-300 text-sm font-semibold">{TABS.find(t=>t.id===activeTab)?.label}</p>
              {cvData && activeTab!=='actions' && (
                <button onClick={()=>setActiveTab('actions')} className="ml-auto text-blue-400 text-xs hover:text-blue-300">Eylemler →</button>
              )}
            </div>

            {/* Panel içeriği */}
            <div className="flex-1 overflow-y-auto px-4 py-4 pb-8">
              {panelMap[activeTab]}
            </div>
          </div>

          {/* Sağ: Önizleme — desktop */}
          <div className="hidden lg:flex flex-1 flex-col overflow-hidden bg-gray-900/40">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800/60 shrink-0 bg-gray-900/60">
              <p className="text-gray-400 text-sm font-medium">Canlı Önizleme</p>
              <div className="flex items-center gap-2">
                <button onClick={resetAll} className="text-gray-600 hover:text-gray-400 text-xs">← Yeniden</button>
                <span className="text-xs bg-blue-600/15 text-blue-400 px-2.5 py-1 rounded-full border border-blue-600/25">{template}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <CVComponent cvData={cvData||previewData} color={color}/>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default function CreateCV() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center pt-16"><p className="text-white text-sm">Yükleniyor...</p></div>}>
      <CreateCVContent/>
    </Suspense>
  )
}
