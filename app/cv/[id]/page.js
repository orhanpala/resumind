'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { CVComponents } from '../../components/CVTemplates'

export default function SharedCVPage() {
  const { id } = useParams()
  const [cv, setCv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCV = async () => {
      const { data, error } = await supabase
        .from('cvs')
        .select('*')
        .eq('share_id', id)
        .eq('is_shared', true)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setCv(data)
      }
      setLoading(false)
    }
    fetchCV()
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-white">Yükleniyor...</p>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-white text-2xl font-bold mb-2">CV Bulunamadı</h1>
        <p className="text-gray-400 text-sm">Bu CV paylaşılmamış veya silinmiş olabilir.</p>
      </div>
    </div>
  )

  const CVComponent = CVComponents[cv.template] || CVComponents.Modern

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-xl font-bold">{cv.cv_data.name}</h1>
            <p className="text-gray-400 text-sm">{cv.template} şablonu</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
            >
              📄 PDF İndir
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Link kopyalandı!')
              }}
              className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl transition-all"
            >
              🔗 Linki Kopyala
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          <CVComponent cvData={cv.cv_data} color="blue" />
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">Bu CV <a href="https://resumind.com.tr" className="text-blue-400 hover:text-blue-300">Resumind</a> ile oluşturuldu</p>
        </div>
      </div>
    </div>
  )
}