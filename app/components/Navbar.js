'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function Navbar({ user }) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-gray-950 border-b border-gray-800">
        <h1 onClick={() => router.push('/')} className="text-white text-xl font-bold cursor-pointer hover:text-blue-400 transition-all">
          Resumind
        </h1>

        <div className="hidden md:flex items-center gap-6">
          {/* Özellikler Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-all"
            >
              Özellikler
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-10 left-0 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 w-80 z-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">AI Özellikler</p>
                    {[
                      { label: 'AI CV Oluşturucu', path: '/create-cv' },
                      { label: 'CV Puanlama', path: '/create-cv' },
                      { label: 'Çoklu Dil', path: '/create-cv' },
                    ].map((item) => (
                      <p key={item.label} onClick={() => { router.push(user ? item.path : '/login'); setDropdownOpen(false) }} className="text-gray-400 text-sm py-1.5 hover:text-white cursor-pointer transition-all">
                        {item.label}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="text-blue-400 font-bold text-xs uppercase tracking-widest mb-3">Araçlar</p>
                    {[
                      { label: 'LinkedIn Özeti', path: '/create-cv' },
                      { label: 'Referans Mektubu', path: '/create-cv' },
                      { label: 'CV Düzenleme', path: '/create-cv' },
                    ].map((item) => (
                      <p key={item.label} onClick={() => { router.push(user ? item.path : '/login'); setDropdownOpen(false) }} className="text-gray-400 text-sm py-1.5 hover:text-white cursor-pointer transition-all">
                        {item.label}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => router.push(user ? '/dashboard' : '/login')} className="text-gray-400 hover:text-white text-sm transition-all">CV Şablonları</button>
          <button className="text-gray-400 hover:text-white text-sm transition-all">Ücretlendirme</button>
         <button onClick={() => router.push('/iletisim')} className="text-gray-400 hover:text-white text-sm transition-all">İletişim</button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
           <>
              <p className="text-gray-400 text-sm hidden md:block">{user.email}</p>
              {user.email === 'palaorhan30@gmail.com' && (
                <button onClick={() => router.push('/admin')} className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded-xl transition-all">
                  ⚙️ Admin
                </button>
              )}
              <button onClick={handleLogout} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl transition-all">
                Çıkış Yap
              </button>
            </>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} className="text-gray-400 hover:text-white text-sm border border-gray-700 px-4 py-2 rounded-xl transition-all">
                Giriş Yap
              </button>
              <button onClick={() => router.push('/login')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-all">
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      </nav>

      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>}
    </>
  )
}