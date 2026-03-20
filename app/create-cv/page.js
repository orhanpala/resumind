'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

function ModernCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-blue-600 px-10 py-8">
        <h2 className="text-white text-3xl font-bold">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-blue-100 text-sm flex-wrap">
          {cvData.email && <span>✉ {cvData.email}</span>}
          {cvData.phone && <span>📞 {cvData.phone}</span>}
          {cvData.location && <span>📍 {cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-blue-50 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-10">
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-blue-600 font-bold text-lg mb-4 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4 pl-4 border-l-2 border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 font-semibold">{exp.position}</p>
                    <p className="text-blue-600 text-sm">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-sm">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-blue-600 font-bold text-lg mb-4 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2 pl-4 border-l-2 border-blue-200">
                <p className="text-gray-900 font-semibold">{edu.school}</p>
                <p className="text-gray-500 text-sm">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-blue-600 font-bold text-lg mb-4 uppercase tracking-wide border-b-2 border-blue-600 pb-1">Beceriler</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-200">{skill}</span>
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
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gray-900 px-10 py-8">
        <h2 className="text-white text-3xl font-bold tracking-wide">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-gray-300 text-sm flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-300 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-10">
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-lg mb-4 uppercase tracking-widest border-b border-gray-300 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 font-semibold">{exp.position}</p>
                    <p className="text-gray-600 text-sm italic">{exp.company}</p>
                  </div>
                  <p className="text-gray-500 text-sm">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-lg mb-4 uppercase tracking-widest border-b border-gray-300 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-gray-900 font-semibold">{edu.school}</p>
                <p className="text-gray-500 text-sm">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4 uppercase tracking-widest border-b border-gray-300 pb-1">Beceriler</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 border border-gray-300">{skill}</span>
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
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl p-10">
      <div className="mb-8">
        <h2 className="text-gray-900 text-4xl font-light">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-gray-400 text-sm flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-500 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      {cvData.experience?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-300 font-medium text-xs mb-4 uppercase tracking-widest">Deneyim</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900 font-medium">{exp.position}</p>
                  <p className="text-gray-400 text-sm">{exp.company}</p>
                </div>
                <p className="text-gray-300 text-sm">{exp.duration}</p>
              </div>
              {exp.description && <p className="text-gray-500 text-sm mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {cvData.education?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-300 font-medium text-xs mb-4 uppercase tracking-widest">Eğitim</h3>
          {cvData.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="text-gray-900 font-medium">{edu.school}</p>
              <p className="text-gray-400 text-sm">{edu.degree} — {edu.year}</p>
            </div>
          ))}
        </div>
      )}
      {cvData.skills?.length > 0 && (
        <div>
          <h3 className="text-gray-300 font-medium text-xs mb-4 uppercase tracking-widest">Beceriler</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="text-gray-600 text-sm px-3 py-1 border border-gray-200 rounded-full">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CreateCV() {
  const [template, setTemplate] = useState('Modern')
  const [mode, setMode] = useState(null)
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData] = useState(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!cvText) return
    setLoading(true)
    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvContent: cvText,
          template,
          isRawText: mode === 'text'
        })
      })
      const data = await response.json()
      if (data.success) setCvData(data.cvData)
      else alert('Hata: ' + data.error)
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setLoading(false)
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  if (cvData) {
    return (
      <div className="min-h-screen bg-gray-950 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-white text-2xl font-bold">CV Hazır! 🎉</h1>
            <div className="flex gap-3">
              <button
                onClick={() => setCvData(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl"
              >
                Yeniden Oluştur
              </button>
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl"
              >
                📄 PDF İndir
              </button>
            </div>
          </div>
          {template === 'Modern' && <ModernCV cvData={cvData} />}
          {template === 'Klasik' && <KlasikCV cvData={cvData} />}
          {template === 'Minimal' && <MinimalCV cvData={cvData} />}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm mb-8 flex items-center gap-2">
          ← Geri
        </button>
        <h1 className="text-white text-3xl font-bold mb-2">CV Oluştur</h1>
        <p className="text-gray-400 mb-8">Yapay zeka CV'ni saniyeler içinde hazırlasın</p>
        <div className="mb-8">
          <p className="text-gray-300 text-sm font-medium mb-3">Şablon Seç</p>
          <div className="flex gap-3">
            {['Modern', 'Klasik', 'Minimal'].map((t) => (
              <button
                key={t}
                onClick={() => setTemplate(t)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${template === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {!mode && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode('upload')}
              className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-8 text-left transition-all"
            >
              <div className="text-3xl mb-3">📄</div>
              <h3 className="text-white font-medium text-lg mb-1">CV Yükle</h3>
              <p className="text-gray-400 text-sm">Mevcut CV'ni yapıştır, yapay zeka dönüştürsün</p>
            </button>
            <button
              onClick={() => setMode('text')}
              className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-8 text-left transition-all"
            >
              <div className="text-3xl mb-3">✏️</div>
              <h3 className="text-white font-medium text-lg mb-1">Bilgileri Yaz</h3>
              <p className="text-gray-400 text-sm">CV bilgilerini yaz, yapay zeka tamamlasın</p>
            </button>
          </div>
        )}
        {mode && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-300 text-sm font-medium">
                {mode === 'upload' ? 'CV içeriğini buraya yapıştır' : 'Bilgilerini kaba taslak yaz'}
              </p>
              <button onClick={() => setMode(null)} className="text-gray-500 hover:text-white text-sm">Geri</button>
            </div>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder={mode === 'upload'
                ? 'CV içeriğini buraya kopyalayıp yapıştır...'
                : 'Örnek: Adım Ahmet, yazılım geliştirici olarak 3 yıl çalıştım, Python ve React biliyorum, İstanbul Üniversitesi mezunuyum...'}
              className="w-full bg-gray-900 border border-gray-800 text-white rounded-2xl px-5 py-4 h-64 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !cvText}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-4 rounded-2xl transition-all text-lg"
            >
              {loading ? '✨ CV Oluşturuluyor...' : '✨ CV Oluştur'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}