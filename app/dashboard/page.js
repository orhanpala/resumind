'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { CVComponents } from '../components/CVTemplates'

const templates = [
  { id: 'Modern', name: 'Modern', desc: 'Mavi başlık, temiz çizgiler', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="bg-blue-600 p-2"><div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div><div className="h-1 bg-blue-300 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-blue-600 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div><div className="h-1 bg-blue-600 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-4/6"></div></div></div>) },
  { id: 'Klasik', name: 'Klasik', desc: 'Siyah başlık, resmi görünüm', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="bg-gray-900 p-2"><div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div><div className="h-1 bg-gray-400 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-gray-800 rounded w-1/3 mb-1 mt-1"></div><div className="h-px bg-gray-300 w-full mb-2"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div><div className="h-1 bg-gray-200 rounded w-5/6 mb-2"></div></div></div>) },
  { id: 'Minimal', name: 'Minimal', desc: 'Sade, beyaz ağırlıklı', preview: (<div className="w-full h-full bg-white rounded-lg p-2"><div className="h-3 bg-gray-800 rounded w-2/3 mb-1"></div><div className="h-1 bg-gray-300 rounded w-1/2 mb-3"></div><div className="h-1 bg-gray-200 rounded w-1/4 mb-2"></div><div className="h-1 bg-gray-100 rounded w-full mb-1"></div><div className="h-1 bg-gray-100 rounded w-5/6 mb-3"></div></div>) },
  { id: 'Kreatif', name: 'Kreatif', desc: 'Mor tonlar, yaratıcı tasarım', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="bg-gradient-to-r from-purple-600 to-pink-500 p-2"><div className="h-2 bg-white bg-opacity-80 rounded w-3/4 mb-1"></div><div className="h-1 bg-purple-200 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-purple-500 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div></div></div>) },
  { id: 'Teknoloji', name: 'Teknoloji', desc: 'Koyu tema, yazılımcı stili', preview: (<div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden"><div className="border-b border-green-500 p-2"><div className="h-2 bg-green-400 rounded w-3/4 mb-1"></div><div className="h-1 bg-green-800 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-green-500 rounded w-1/3 mb-2"></div><div className="h-1 bg-gray-700 rounded w-full mb-1"></div></div></div>) },
  { id: 'Elegant', name: 'Elegant', desc: 'Gold detaylar, şık tasarım', preview: (<div className="w-full h-full bg-amber-50 rounded-lg overflow-hidden"><div className="border-b-2 border-amber-600 p-2"><div className="h-2 bg-amber-800 rounded w-3/4 mb-1"></div><div className="h-1 bg-amber-400 rounded w-1/2"></div></div><div className="p-2"><div className="h-1 bg-amber-600 rounded w-1/3 mb-2"></div></div></div>) },
  { id: 'Kompakt', name: 'Kompakt', desc: 'İki sütunlu, bilgi yoğun', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden flex"><div className="bg-slate-700 w-1/3 p-1"><div className="w-6 h-6 bg-slate-400 rounded-full mx-auto mb-1"></div></div><div className="flex-1 p-1"><div className="h-1 bg-slate-700 rounded w-3/4 mb-1"></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div></div></div>) },
  { id: 'Akademik', name: 'Akademik', desc: 'Resmi, akademik format', preview: (<div className="w-full h-full bg-white rounded-lg p-2"><div className="text-center mb-2"><div className="h-2 bg-gray-800 rounded w-1/2 mx-auto mb-1"></div><div className="h-px bg-gray-800 w-full"></div></div><div className="h-1 bg-gray-200 rounded w-full mb-1"></div></div>) },
  { id: 'Timeline', name: 'Timeline', desc: 'Kronolojik zaman çizgisi', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="bg-gray-900 p-2 flex items-center gap-2"><div className="w-5 h-5 bg-orange-500 rounded-full"></div><div className="h-2 bg-white bg-opacity-80 rounded w-2/3"></div></div></div>) },
  { id: 'Sidebar', name: 'Sidebar', desc: 'Koyu panel, modern', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden flex"><div className="bg-slate-800 w-2/5 p-1"><div className="w-5 h-5 bg-teal-500 rounded-full mx-auto mb-1"></div></div><div className="flex-1 p-1"><div className="h-1 bg-teal-500 rounded w-1/2 mb-1"></div></div></div>) },
  { id: 'Bant', name: 'Bant', desc: 'Renkli üst şerit', preview: (<div className="w-full h-full bg-white rounded-lg overflow-hidden"><div className="h-1 bg-gradient-to-r from-rose-500 to-pink-400"></div><div className="p-2 flex items-center gap-2 border-b border-gray-100"><div className="w-5 h-5 bg-rose-100 rounded-full"></div></div></div>) },
  { id: 'Kartlı', name: 'Kartlı', desc: 'Kart bazlı düzen', preview: (<div className="w-full h-full bg-gray-100 rounded-lg p-1"><div className="bg-white rounded p-1 mb-1 flex items-center gap-1"><div className="w-5 h-5 bg-indigo-600 rounded"></div></div></div>) },
]

/* CV'yi yeni pencerede açıp PDF olarak yazdır */
function downloadCV(cv) {
  const CVComponent = CVComponents[cv.template] || CVComponents.Modern
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;background:white;'
  document.body.appendChild(container)

  const { createRoot } = require('react-dom/client')
  const root = createRoot(container)
  root.render(CVComponent({ cvData: cv.cv_data, color: 'blue' }))

  setTimeout(() => {
    const el = container.querySelector('#cv-preview')
    if (!el) { root.unmount(); document.body.removeChild(container); return }
    const styles = Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules).map(r=>r.cssText).join('\n') } catch { return '' } }).join('\n')
    const win = window.open('','_blank','width=900,height=700')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${cv.cv_data.name||'CV'}</title>
      <style>${styles}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{margin:0;padding:0;background:white;}@page{margin:0;size:A4;}</style>
      </head><body>${el.outerHTML}<script>window.onload=function(){setTimeout(function(){window.print();window.close();},600)}<\/script></body></html>`)
    win.document.close()
    root.unmount()
    document.body.removeChild(container)
  }, 500)
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [pastCVs, setPastCVs] = useState([])
  const [activeTab, setActiveTab] = useState('templates')
  const [activeTemplates, setActiveTemplates] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser(user)
      supabase.from('cvs').select('*').order('created_at', { ascending: false }).then(({ data }) => {
        if (data) setPastCVs(data)
      })
      supabase.from('template_settings').select('*').eq('is_active', true).then(({ data }) => {
        if (data) setActiveTemplates(data.map(t => t.template_id))
      })
    })
  }, [])

  const handleDelete = async (id) => {
    await supabase.from('cvs').delete().eq('id', id)
    setPastCVs(prev => prev.filter(cv => cv.id !== id))
    setDeleteConfirm(null)
  }

  const handleEdit = (cv) => {
    // CV verisini sessionStorage'a koy, create-cv sayfasında kullan
    sessionStorage.setItem('editCV', JSON.stringify(cv))
    router.push(`/create-cv?template=${cv.template}&edit=1`)
  }

  const handleDownload = (cv) => {
    const CVComponent = CVComponents[cv.template] || CVComponents.Modern
    // Geçici div oluştur
    const tmp = document.createElement('div')
    tmp.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:800px;'
    document.body.appendChild(tmp)
    // React render
    import('react-dom/client').then(({ createRoot }) => {
      import('react').then(React => {
        const root = createRoot(tmp)
        root.render(React.createElement(CVComponent, { cvData: cv.cv_data, color: 'blue' }))
        setTimeout(() => {
          const el = tmp.querySelector('#cv-preview') || tmp.firstElementChild
          if (!el) { root.unmount(); document.body.removeChild(tmp); return }
          const styles = Array.from(document.styleSheets).map(s => { try { return Array.from(s.cssRules).map(r=>r.cssText).join('\n') } catch { return '' } }).join('\n')
          const win = window.open('','_blank','width=900,height=700')
          win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${cv.cv_data.name||'CV'} - Resumind</title>
            <style>${styles}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}body{margin:0;padding:0;background:white;}@page{margin:0;size:A4;}</style>
            </head><body>${el.outerHTML}<script>window.onload=function(){setTimeout(function(){window.print();window.close();},600)}<\/script></body></html>`)
          win.document.close()
          root.unmount()
          document.body.removeChild(tmp)
        }, 600)
      })
    })
  }

  if (!user) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12">

        {/* Tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          <button onClick={() => setActiveTab('templates')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab==='templates'?'bg-blue-600 text-white shadow-lg shadow-blue-600/20':'bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'}`}>
            Şablonlar
          </button>
          <button onClick={() => setActiveTab('history')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab==='history'?'bg-blue-600 text-white shadow-lg shadow-blue-600/20':'bg-gray-800/60 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-700/50'}`}>
            Geçmiş CV'ler
            {pastCVs.length > 0 && <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab==='history'?'bg-white/20':'bg-blue-600 text-white'}`}>{pastCVs.length}</span>}
          </button>
          <button onClick={() => router.push('/premium-templates')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/20">
            ✦ Premium Şablonlar
          </button>
        </div>

        {/* Şablonlar */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-8">
              <h2 className="text-white text-3xl font-bold mb-1">Şablon seç</h2>
              <p className="text-gray-500 text-sm">Beğendiğin şablonu seç, yapay zeka CV'ni oluştursun</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {templates.filter(t => activeTemplates.length === 0 || activeTemplates.includes(t.id)).map(t => (
                <div key={t.id} onClick={() => router.push(`/create-cv?template=${t.id}`)}
                  className="group bg-gray-900/60 border border-gray-800 hover:border-blue-500/60 rounded-2xl p-3 cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5">
                  <div className="w-full h-32 bg-gray-800 rounded-xl mb-3 overflow-hidden group-hover:ring-1 group-hover:ring-blue-500/40 transition-all">
                    {t.preview}
                  </div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-gray-600 text-xs mt-0.5 truncate">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Geçmiş CV'ler */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-white text-3xl font-bold mb-1">Geçmiş CV'ler</h2>
                <p className="text-gray-500 text-sm">{pastCVs.length} CV kaydedildi</p>
              </div>
              <button onClick={() => setActiveTab('templates')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all">
                + Yeni CV
              </button>
            </div>

            {pastCVs.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl">
                <p className="text-5xl mb-4">📄</p>
                <p className="text-gray-400 text-lg mb-2">Henüz CV oluşturmadın</p>
                <p className="text-gray-600 text-sm mb-6">İlk CV'ni oluşturmak için bir şablon seç</p>
                <button onClick={() => setActiveTab('templates')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl">Şablona Git</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pastCVs.map(cv => {
                  const initials = cv.cv_data.name
                    ? cv.cv_data.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()
                    : 'CV'
                  const date = new Date(cv.created_at).toLocaleDateString('tr-TR', { day:'2-digit', month:'short', year:'numeric' })
                  return (
                    <div key={cv.id} className="group relative bg-gray-900/60 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-black/30">

                      {/* Üst renkli şerit */}
                      <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />

                      <div className="p-5">
                        {/* Avatar + İsim */}
                        <div className="flex items-center gap-3 mb-4">
                          {cv.cv_data.photo
                            ? <img src={cv.cv_data.photo} alt="foto" className="w-11 h-11 rounded-full object-cover border-2 border-gray-700" />
                            : <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-400 text-sm font-bold flex-shrink-0">{initials}</div>
                          }
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-base truncate">{cv.cv_data.name || 'İsimsiz CV'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-blue-400 text-xs font-medium">{cv.template}</span>
                              <span className="text-gray-700 text-xs">•</span>
                              <span className="text-gray-600 text-xs">{date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Özet */}
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
                          {cv.cv_data.summary || 'Özet bilgisi yok'}
                        </p>

                        {/* Beceriler */}
                        {cv.cv_data.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {cv.cv_data.skills.slice(0,4).map((s,i) => (
                              <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md border border-gray-700/50">{s}</span>
                            ))}
                            {cv.cv_data.skills.length > 4 && (
                              <span className="text-xs text-gray-600">+{cv.cv_data.skills.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* Aksiyon butonları */}
                        <div className="flex gap-2">
                          {/* Düzenle */}
                          <button
                            onClick={() => handleEdit(cv)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs py-2 rounded-lg transition-all border border-gray-700/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Düzenle
                          </button>

                          {/* PDF İndir */}
                          <button
                            onClick={() => handleDownload(cv)}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-lg transition-all"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            PDF
                          </button>

                          {/* Sil */}
                          {deleteConfirm === cv.id ? (
                            <div className="flex gap-1">
                              <button onClick={() => handleDelete(cv.id)}
                                className="px-2.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-all">
                                Evet
                              </button>
                              <button onClick={() => setDeleteConfirm(null)}
                                className="px-2.5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-all">
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(cv.id)}
                              className="w-9 flex items-center justify-center bg-gray-800 hover:bg-red-900/30 text-gray-600 hover:text-red-400 rounded-lg transition-all border border-gray-700/50"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
