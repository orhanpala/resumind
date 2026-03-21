'use client'

const colors = {
  blue: { primary: 'bg-blue-600', gradient: 'from-blue-700 to-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-400', badge: 'bg-blue-500', badgeText: 'text-blue-700', dot: 'bg-blue-500' },
  green: { primary: 'bg-green-600', gradient: 'from-green-700 to-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-400', badge: 'bg-green-500', badgeText: 'text-green-700', dot: 'bg-green-500' },
  purple: { primary: 'bg-purple-600', gradient: 'from-purple-700 to-purple-500', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-400', badge: 'bg-purple-500', badgeText: 'text-purple-700', dot: 'bg-purple-500' },
  red: { primary: 'bg-red-600', gradient: 'from-red-700 to-red-500', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-400', badge: 'bg-red-500', badgeText: 'text-red-700', dot: 'bg-red-500' },
  gray: { primary: 'bg-gray-700', gradient: 'from-gray-800 to-gray-600', text: 'text-gray-700', light: 'bg-gray-50', border: 'border-gray-400', badge: 'bg-gray-600', badgeText: 'text-gray-700', dot: 'bg-gray-500' },
}

export const colorOptions = [
  { id: 'blue', label: 'Mavi', hex: '#2563EB' },
  { id: 'green', label: 'Yeşil', hex: '#16A34A' },
  { id: 'purple', label: 'Mor', hex: '#9333EA' },
  { id: 'red', label: 'Kırmızı', hex: '#DC2626' },
  { id: 'gray', label: 'Gri', hex: '#374151' },
]

export function ModernCV({ cvData, color = 'blue' }) {
  const c = colors[color] || colors.blue
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${c.gradient} px-10 py-8`}>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 border-2 border-white border-opacity-40">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-white text-3xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
            {cvData.experience?.[0] && <p className="text-white text-opacity-80 text-sm mt-1 opacity-80">{cvData.experience[0].position}</p>}
          </div>
        </div>
        <div className="flex gap-5 mt-4 text-white text-xs flex-wrap opacity-80">
          {cvData.email && <span>✉ {cvData.email}</span>}
          {cvData.phone && <span>📞 {cvData.phone}</span>}
          {cvData.location && <span>📍 {cvData.location}</span>}
        </div>
      </div>
      <div className="flex">
        <div className="w-2/3 p-8 border-r border-gray-100">
          {cvData.summary && (
            <div className="mb-6">
              <h3 className={`${c.text} font-bold text-xs mb-2 uppercase tracking-widest pb-1 border-b ${c.light} border-opacity-50`}>Hakkımda</h3>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">{cvData.summary}</p>
            </div>
          )}
          {cvData.experience?.length > 0 && (
            <div className="mb-6">
              <h3 className={`${c.text} font-bold text-xs mb-3 uppercase tracking-widest pb-1 border-b border-gray-100`}>Deneyim</h3>
              {cvData.experience.map((exp, i) => (
                <div key={i} className={`mb-4 pl-3 border-l-2 ${c.border}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                      <p className={`${c.text} text-xs font-medium`}>{exp.company}</p>
                    </div>
                    <span className={`text-xs text-white ${c.badge} px-2 py-0.5 rounded-full shrink-0 ml-2`}>{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          {cvData.education?.length > 0 && (
            <div>
              <h3 className={`${c.text} font-bold text-xs mb-3 uppercase tracking-widest pb-1 border-b border-gray-100`}>Eğitim</h3>
              {cvData.education.map((edu, i) => (
                <div key={i} className={`mb-3 pl-3 border-l-2 ${c.border}`}>
                  <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                  <p className="text-gray-500 text-xs">{edu.degree}</p>
                  <p className={`${c.text} text-xs`}>{edu.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`w-1/3 p-6 ${c.light}`}>
          {cvData.skills?.length > 0 && (
            <div>
              <h3 className={`${c.text} font-bold text-xs mb-3 uppercase tracking-widest pb-1 border-b border-opacity-30`}>Beceriler</h3>
              <div className="flex flex-col gap-2 mt-2">
                {cvData.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 ${c.dot} rounded-full shrink-0`}></div>
                    <span className="text-gray-700 text-xs">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function KlasikCV({ cvData, color = 'gray' }) {
  const c = colors[color] || colors.gray
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${c.gradient} px-10 py-8`}>
        <h2 className="text-white text-3xl font-bold tracking-wide">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className="flex gap-4 mt-2 text-white text-sm flex-wrap opacity-80">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-white mt-3 text-sm leading-relaxed opacity-80">{cvData.summary}</p>}
      </div>
      <div className="p-10">
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-lg mb-4 uppercase tracking-widest border-b border-gray-300 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-900 font-semibold">{exp.position}</p>
                    <p className={`${c.text} text-sm italic`}>{exp.company}</p>
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
                <span key={i} className={`${c.light} ${c.badgeText} text-sm px-3 py-1 border`}>{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MinimalCV({ cvData, color = 'gray' }) {
  const c = colors[color] || colors.gray
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl p-10">
      <div className="mb-8">
        <h2 className="text-gray-900 text-4xl font-light">{cvData.name || 'Adınız Soyadınız'}</h2>
        <div className={`flex gap-4 mt-2 ${c.text} text-sm flex-wrap`}>
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
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-900 font-medium">{exp.position}</p>
                  <p className={`${c.text} text-sm`}>{exp.company}</p>
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
              <p className={`${c.text} text-sm`}>{edu.degree} — {edu.year}</p>
            </div>
          ))}
        </div>
      )}
      {cvData.skills?.length > 0 && (
        <div>
          <h3 className="text-gray-300 font-medium text-xs mb-4 uppercase tracking-widest">Beceriler</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className={`${c.text} text-sm px-3 py-1 border border-gray-200 rounded-full`}>{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function TimelineCV({ cvData, color = 'blue' }) {
  const c = colors[color] || colors.blue
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${c.gradient} px-10 py-8 flex items-center gap-6`}>
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-white text-3xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
          {cvData.experience?.[0] && <p className="text-white opacity-80 text-sm mt-1">{cvData.experience[0].position}</p>}
          <div className="flex gap-4 mt-2 text-white text-xs flex-wrap opacity-80">
            {cvData.email && <span>✉ {cvData.email}</span>}
            {cvData.phone && <span>📞 {cvData.phone}</span>}
            {cvData.location && <span>📍 {cvData.location}</span>}
          </div>
        </div>
      </div>
      <div className="p-10">
        {cvData.summary && (
          <div className={`mb-8 ${c.light} border-l-4 ${c.border} pl-4 py-3 rounded-r-xl`}>
            <p className="text-gray-700 text-sm leading-relaxed">{cvData.summary}</p>
          </div>
        )}
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-widest">Deneyim</h3>
            <div className="relative">
              <div className={`absolute left-3 top-0 bottom-0 w-0.5 ${c.light}`}></div>
              {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-5 pl-10 relative">
                  <div className={`absolute left-0 top-1 w-6 h-6 ${c.badge} rounded-full flex items-center justify-center`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                      <p className={`${c.text} text-xs font-medium`}>{exp.company}</p>
                    </div>
                    <span className={`text-xs ${c.light} ${c.badgeText} px-2 py-0.5 rounded-full`}>{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-8">
          {cvData.education?.length > 0 && (
            <div>
              <h3 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-widest">Eğitim</h3>
              {cvData.education.map((edu, i) => (
                <div key={i} className={`mb-3 pl-3 border-l-2 ${c.border}`}>
                  <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                  <p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.skills?.length > 0 && (
            <div>
              <h3 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-widest">Beceriler</h3>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, i) => (
                  <span key={i} className={`${c.light} ${c.badgeText} text-xs px-3 py-1 rounded-full border`}>{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SidebarCV({ cvData, color = 'blue' }) {
  const c = colors[color] || colors.blue
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden flex">
      <div className="w-2/5 bg-slate-800 p-8 flex flex-col">
        <div className={`w-20 h-20 ${c.badge} rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4`}>
          {initials}
        </div>
        <h2 className="text-white text-xl font-bold text-center mb-1">{cvData.name || 'Adınız Soyadınız'}</h2>
        {cvData.experience?.[0] && <p className={`${c.text} text-xs text-center mb-4`} style={{color: '#5eead4'}}>{cvData.experience[0].position}</p>}
        <div className="space-y-2 mb-6">
          {cvData.email && <p className="text-slate-300 text-xs">✉ {cvData.email}</p>}
          {cvData.phone && <p className="text-slate-300 text-xs">📞 {cvData.phone}</p>}
          {cvData.location && <p className="text-slate-300 text-xs">📍 {cvData.location}</p>}
        </div>
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-3 border-b border-slate-600 pb-2">Beceriler</h3>
            <div className="space-y-2">
              {cvData.skills.map((skill, i) => (
                <div key={i}>
                  <span className="text-slate-300 text-xs">{skill}</span>
                  <div className="w-full bg-slate-600 rounded-full h-1 mt-1">
                    <div className={`${c.badge} h-1 rounded-full`} style={{width: `${85 - (i * 8)}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-3 border-b border-slate-600 pb-2">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-white text-xs font-medium">{edu.school}</p>
                <p className="text-slate-400 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-8">
        {cvData.summary && (
          <div className="mb-6">
            <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-2 pb-1 border-b-2 ${c.border}`}>Hakkımda</h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">{cvData.summary}</p>
          </div>
        )}
        {cvData.experience?.length > 0 && (
          <div>
            <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b-2 ${c.border}`}>Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                    <p className={`${c.text} text-xs`}>{exp.company}</p>
                  </div>
                  <span className={`text-xs ${c.light} ${c.badgeText} px-2 py-0.5 rounded border`}>{exp.duration}</span>
                </div>
                {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function BantCV({ cvData, color = 'red' }) {
  const c = colors[color] || colors.red
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className={`h-2 ${c.primary}`}></div>
      <div className="px-10 py-8 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 ${c.light} rounded-full flex items-center justify-center ${c.text} text-xl font-bold shrink-0 border-2`}>
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 text-3xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
            {cvData.experience?.[0] && <p className={`${c.text} text-sm mt-1 font-medium`}>{cvData.experience[0].position}</p>}
          </div>
        </div>
        <div className="flex gap-6 mt-4 text-gray-500 text-xs flex-wrap">
          {cvData.email && <span>✉ {cvData.email}</span>}
          {cvData.phone && <span>📞 {cvData.phone}</span>}
          {cvData.location && <span>📍 {cvData.location}</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-2 p-8 border-r border-gray-100">
          {cvData.summary && (
            <div className="mb-6">
              <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-2`}>Hakkımda</h3>
              <div className={`h-0.5 ${c.primary} mb-3 w-1/3`}></div>
              <p className="text-gray-600 text-sm leading-relaxed">{cvData.summary}</p>
            </div>
          )}
          {cvData.experience?.length > 0 && (
            <div>
              <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-2`}>Deneyim</h3>
              <div className={`h-0.5 ${c.primary} mb-3 w-1/3`}></div>
              {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                      <p className={`${c.text} text-xs`}>{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-400">{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6">
          {cvData.education?.length > 0 && (
            <div className="mb-6">
              <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-2`}>Eğitim</h3>
              <div className={`h-0.5 ${c.primary} mb-3 w-1/2`}></div>
              {cvData.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <p className="text-gray-900 font-semibold text-xs">{edu.school}</p>
                  <p className="text-gray-500 text-xs">{edu.degree}</p>
                  <p className={`${c.text} text-xs`}>{edu.year}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.skills?.length > 0 && (
            <div>
              <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-2`}>Beceriler</h3>
              <div className={`h-0.5 ${c.primary} mb-3 w-1/2`}></div>
              <div className="flex flex-col gap-1.5">
                {cvData.skills.map((skill, i) => (
                  <span key={i} className={`text-gray-600 text-xs flex items-center gap-1`}>
                    <span className={`w-1 h-1 ${c.dot} rounded-full shrink-0`}></span>{skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function KartliCV({ cvData, color = 'purple' }) {
  const c = colors[color] || colors.purple
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-gray-100 rounded-2xl shadow-2xl p-6">
      <div className="bg-white rounded-xl p-6 mb-4 flex items-center gap-4 shadow-sm">
        <div className={`w-16 h-16 ${c.badge} rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0`}>
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="text-gray-900 text-2xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
          {cvData.experience?.[0] && <p className={`${c.text} text-sm font-medium`}>{cvData.experience[0].position}</p>}
          <div className="flex gap-4 mt-1 text-gray-400 text-xs flex-wrap">
            {cvData.email && <span>{cvData.email}</span>}
            {cvData.phone && <span>{cvData.phone}</span>}
            {cvData.location && <span>{cvData.location}</span>}
          </div>
        </div>
      </div>
      {cvData.summary && (
        <div className={`${c.light} rounded-xl p-4 mb-4 border border-opacity-20`}>
          <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-2`}>Hakkımda</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{cvData.summary}</p>
        </div>
      )}
      {cvData.experience?.length > 0 && (
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-3`}>Deneyim</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                  <p className={`${c.text} text-xs`}>{exp.company}</p>
                </div>
                <span className={`text-xs ${c.light} ${c.badgeText} px-2 py-0.5 rounded-lg border`}>{exp.duration}</span>
              </div>
              {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {cvData.education?.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-3`}>Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-gray-900 font-semibold text-xs">{edu.school}</p>
                <p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className={`${c.text} font-bold text-xs uppercase tracking-widest mb-3`}>Beceriler</h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.skills.map((skill, i) => (
                <span key={i} className={`${c.light} ${c.badgeText} text-xs px-2 py-0.5 rounded-lg border`}>{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const CVComponents = {
  Modern: ModernCV,
  Klasik: KlasikCV,
  Minimal: MinimalCV,
  Timeline: TimelineCV,
  Sidebar: SidebarCV,
  Bant: BantCV,
  Kartlı: KartliCV,
}