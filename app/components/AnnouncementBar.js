'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const typeStyles = {
  info: 'bg-blue-600 bg-opacity-20 border-blue-500 text-blue-400',
  success: 'bg-green-600 bg-opacity-20 border-green-500 text-green-400',
  warning: 'bg-yellow-600 bg-opacity-20 border-yellow-500 text-yellow-400',
  error: 'bg-red-600 bg-opacity-20 border-red-500 text-red-400',
}

const typeIcons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
}

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([])
  const [dismissed, setDismissed] = useState([])

 useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
      if (data) {
        setAnnouncements(data)
        setTimeout(() => {
          setDismissed(data.map(a => a.id))
        }, 5000)
      }
    }
    fetchAnnouncements()
  }, [])

  const visible = announcements.filter(a => !dismissed.includes(a.id))

  if (visible.length === 0) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 space-y-1 px-4 pt-2">
      {visible.map((ann) => (
        <div key={ann.id} className={`border rounded-xl px-4 py-3 flex items-center justify-between ${typeStyles[ann.type] || typeStyles.info}`}>
          <div className="flex items-center gap-2">
            <span>{typeIcons[ann.type] || 'ℹ️'}</span>
            <div>
              <span className="font-medium text-sm">{ann.title}: </span>
              <span className="text-sm">{ann.message}</span>
            </div>
          </div>
          <button onClick={() => setDismissed([...dismissed, ann.id])} className="ml-4 opacity-60 hover:opacity-100 text-sm">✕</button>
        </div>
      ))}
    </div>
  )
}