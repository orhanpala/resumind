'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'

function ModernCV({ cvData }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden h-full">
      <div className="bg-blue-600 px-8 py-6">
        <h2 className="text-white text-2xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-3 mt-2 text-blue-100 text-xs flex-wrap">
          {cvData.email && <span>✉ {cvData.email}</span>}
          {cvData.phone && <span>📞 {cvData.phone}</span>}
          {cvData.location && <span>📍 {cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-blue-50 mt-2 text-xs leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-8">
        {cvData.experience?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-blue-600 font-bold text-sm mb-3 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-3 pl-3 border-l-2 border-blue-200">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                    <p className="text-blue-600 text-xs">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-600 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-blue-600 font-bold text-sm mb-3 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2 pl-3 border-l-2 border-blue-200">
                <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                <p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-blue-600 font-bold text-sm mb-3 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Beceriler</h3>
            <div className="flex flex-wrap gap-1">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full border border-blue-200">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function KlasikCV({ cvData }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden h-full">
      <div className="bg-gray-900 px-8 py-6">
        <h2 className="text-white text-2xl font-bold tracking-wide">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-3 mt-2 text-gray-300 text-xs flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-300 mt-2 text-xs leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-8">
        {cvData.experience?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-900 font-bold text-sm mb-3 uppercase tracking-widest border-b border-gray-300 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                    <p className="text-gray-600 text-xs italic">{exp.company}</p>
                  </div>
                  <p className="text-gray-500 text-xs">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-600 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-gray-900 font-bold text-sm mb-3 uppercase tracking-widest border-b border-gray-300 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                <p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-gray-900 font-bold text-sm mb-3 uppercase tracking-widest border-b border-gray-300 pb-1">Beceriler</h3>
            <div className="flex flex-wrap gap-1">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 border border-gray-300">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MinimalCV({ cvData }) {
  return (
    <div className="bg-white rounded-xl p-8 h-full">
      <div className="mb-6">
        <h2 className="text-gray-900 text-2xl font-light">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-3 mt-1 text-gray-400 text-xs flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-500 mt-2 text-xs leading-relaxed">{cvData.summary}</p>}
      </div>
      {cvData.experience?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium text-xs mb-3 uppercase tracking-widest">Deneyim</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-900 font-medium text-sm">{exp.position}</p>
                  <p className="text-gray-400 text-xs">{exp.company}</p>
                </div>
                <p className="text-gray-300 text-xs">{exp.duration}</p>
              </div>
              {exp.description && <p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {cvData.education?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-300 font-medium text-xs mb-3 uppercase tracking-widest">Eğitim</h3>
          {cvData.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="text-gray-900 font-medium text-sm">{edu.school}</p>
              <p className="text-gray-400 text-xs">{edu.degree} — {edu.year}</p>
            </div>
          ))}
        </div>
      )}
      {cvData.skills?.length > 0 && (
        <div>
          <h3 className="text-gray-300 font-medium text-xs mb-3 uppercase tracking-widest">Beceriler</h3>
          <div className="flex flex-wrap gap-1">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="text-gray-600 text-xs px-2 py-1 border border-gray-200 rounded-full">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KreatifCV({ cvData }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden h-full">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-6">
        <h2 className="text-white text-2xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-3 mt-2 text-purple-100 text-xs flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-purple-50 mt-2 text-xs leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-8">
        {cvData.experience?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-purple-600 font-bold text-sm mb-3 uppercase tracking-wide border-b-2 border-purple-300 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-3 pl-3 border-l-2 border-pink-200">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                    <p className="text-purple-500 text-xs">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-600 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-purple-600 font-bold text-sm mb-3 uppercase tracking-wide border-b-2 border-purple-300 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2 pl-3 border-l-2 border-pink-200">
                <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                <p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-purple-600 font-bold text-sm mb-3 uppercase tracking-wide border-b-2 border-purple-300 pb-1">Beceriler</h3>
            <div className="flex flex-wrap gap-1">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded-full border border-purple-200">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TeknolojiCV({ cvData }) {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden h-full">
      <div className="border-b border-green-500 px-8 py-6">
        <h2 className="text-green-400 text-2xl font-bold font-mono">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-3 mt-2 text-green-600 text-xs flex-wrap font-mono">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-400 mt-2 text-xs leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-8">
        {cvData.experience?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-green-500 font-bold text-sm mb-3 font-mono">// Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-3 pl-3 border-l border-green-800">
                <div className="flex justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{exp.position}</p>
                    <p className="text-green-500 text-xs font-mono">{exp.company}</p>
                  </div>
                  <p className="text-gray-500 text-xs font-mono">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-400 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-green-500 font-bold text-sm mb-3 font-mono">// Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2 pl-3 border-l border-green-800">
                <p className="text-white font-semibold text-sm">{edu.school}</p>
                <p className="text-gray-400 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-green-500 font-bold text-sm mb-3 font-mono">// Beceriler</h3>
            <div className="flex flex-wrap gap-1">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-green-900 text-green-400 text-xs px-2 py-1 rounded border border-green-700 font-mono">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ElegantCV({ cvData }) {
  return (
    <div className="bg-amber-50 rounded-xl overflow-hidden h-full">
      <div className="border-b-4 border-amber-600 px-8 py-6 text-center">
        <h2 className="text-amber-900 text-2xl font-bold tracking-widest uppercase">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-3 mt-2 text-amber-600 text-xs flex-wrap justify-center">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-amber-800 mt-2 text-xs leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-8">
        {cvData.experience?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-amber-700 font-bold text-sm mb-3 uppercase tracking-widest text-center border-b border-amber-300 pb-2">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="text-amber-900 font-semibold text-sm">{exp.position}</p>
                    <p className="text-amber-600 text-xs italic">{exp.company}</p>
                  </div>
                  <p className="text-amber-500 text-xs">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-amber-800 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-amber-700 font-bold text-sm mb-3 uppercase tracking-widest text-center border-b border-amber-300 pb-2">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-amber-900 font-semibold text-sm">{edu.school}</p>
                <p className="text-amber-600 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-amber-700 font-bold text-sm mb-3 uppercase tracking-widest text-center border-b border-amber-300 pb-2">Beceriler</h3>
            <div className="flex flex-wrap gap-1 justify-center">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 border border-amber-300">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function KompaktCV({ cvData }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden h-full flex">
      <div className="bg-slate-700 w-2/5 p-6">
        <div className="w-14 h-14 bg-slate-500 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3 mx-auto">
          {cvData.name?.charAt(0) || 'A'}
        </div>
        <h2 className="text-white text-sm font-bold text-center mb-3">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="text-slate-300 text-xs space-y-1 mb-4">
          {cvData.email && <p className="truncate">✉ {cvData.email}</p>}
          {cvData.phone && <p>📞 {cvData.phone}</p>}
          {cvData.location && <p>📍 {cvData.location}</p>}
        </div>
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-slate-300 text-xs uppercase tracking-widest mb-2">Beceriler</h3>
            <div className="space-y-1">
              {cvData.skills.map((skill, i) => (
                <div key={i} className="bg-slate-600 text-slate-200 text-xs px-2 py-1 rounded">{skill}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 overflow-auto">
        {cvData.summary && <p className="text-gray-600 text-xs mb-4 leading-relaxed">{cvData.summary}</p>}
        {cvData.experience?.length > 0 && (
          <div className="mb-4">
            <h3 className="text-slate-700 font-bold text-xs mb-2 uppercase tracking-widest border-b border-slate-200 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold text-xs">{exp.position}</p>
                    <p className="text-slate-500 text-xs">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div>
            <h3 className="text-slate-700 font-bold text-xs mb-2 uppercase tracking-widest border-b border-slate-200 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-gray-900 font-semibold text-xs">{edu.school}</p>
                <p className="text-gray-400 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AkademikCV({ cvData }) {
  return (
    <div className="bg-white rounded-xl p-8 h-full">
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h2 className="text-gray-900 text-2xl font-bold uppercase tracking-widest">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-3 mt-1 text-gray-600 text-xs flex-wrap justify-center">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-600 mt-2 text-xs leading-relaxed">{cvData.summary}</p>}
      </div>
      {cvData.experience?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-gray-900 font-bold text-xs mb-2 uppercase tracking-widest">Deneyim</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-2 flex gap-3">
              <div className="text-gray-400 text-xs w-20 shrink-0 text-right">{exp.duration}</div>
              <div>
                <p className="text-gray-900 font-semibold text-xs">{exp.position}</p>
                <p className="text-gray-600 text-xs italic">{exp.company}</p>
                {exp.description && <p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {cvData.education?.length > 0 && (
        <div className="mb-4">
          <h3 className="text-gray-900 font-bold text-xs mb-2 uppercase tracking-widest">Eğitim</h3>
          {cvData.education.map((edu, i) => (
            <div key={i} className="mb-2 flex gap-3">
              <div className="text-gray-400 text-xs w-20 shrink-0 text-right">{edu.year}</div>
              <div>
                <p className="text-gray-900 font-semibold text-xs">{edu.school}</p>
                <p className="text-gray-500 text-xs">{edu.degree}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {cvData.skills?.length > 0 && (
        <div>
          <h3 className="text-gray-900 font-bold text-xs mb-2 uppercase tracking-widest">Beceriler</h3>
          <p className="text-gray-700 text-xs">{cvData.skills.join(' • ')}</p>
        </div>
      )}
    </div>
  )
}

const CVComponents = {
  Modern: ModernCV,
  Klasik: KlasikCV,
  Minimal: MinimalCV,
  Kreatif: KreatifCV,
  Teknoloji: TeknolojiCV,
  Elegant: ElegantCV,
  Kompakt: KompaktCV,
  Akademik: AkademikCV,
}

const emptyCV = {
  name: '', email: '', phone: '', location: '', summary: '',
  experience: [], education: [], skills: []
}

function CreateCVContent() {
  const searchParams = useSearchParams()
  const initialTemplate = searchParams.get('template') || 'Modern'
  const [template, setTemplate] = useState(initialTemplate)
  const [mode, setMode] = useState(null)
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData] = useState(null)
  const [previewData, setPreviewData] = useState(emptyCV)
  const router = useRouter()

  const CVComponent = CVComponents[template] || ModernCV

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
          <div className="mb-6">
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

          {/* Mod Seç */}
          {!mode && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => setMode('upload')}
                className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-xl p-5 text-left transition-all"
              >
                <div className="text-2xl mb-2">📄</div>
                <h3 className="text-white font-medium mb-1 text-sm">CV Yükle</h3>
                <p className="text-gray-400 text-xs">Mevcut CV'ni yapıştır</p>
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
                  {mode === 'upload' ? 'CV içeriğini yapıştır' : 'Bilgilerini yaz'}
                </p>
                <button onClick={() => setMode(null)} className="text-gray-500 hover:text-white text-xs">Geri</button>
              </div>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder={mode === 'upload'
                  ? 'CV içeriğini buraya kopyalayıp yapıştır...'
                  : 'Örnek: Adım Ahmet, yazılım geliştirici olarak 3 yıl çalıştım, Python ve React biliyorum, İstanbul Üniversitesi mezunuyum...'}
                className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 h-72 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
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
            <div className="mt-4 flex gap-3">
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
            <CVComponent cvData={previewData} />
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