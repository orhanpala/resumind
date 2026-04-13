'use client'

const colors = {
  blue:   { gradient:'from-blue-700 to-blue-500',   text:'text-blue-600',   light:'bg-blue-50',   border:'border-blue-400',   badge:'bg-blue-500',   badgeText:'text-blue-700',   dot:'bg-blue-500',   ring:'ring-blue-400'   },
  green:  { gradient:'from-green-700 to-green-500',  text:'text-green-600',  light:'bg-green-50',  border:'border-green-400',  badge:'bg-green-500',  badgeText:'text-green-700',  dot:'bg-green-500',  ring:'ring-green-400'  },
  purple: { gradient:'from-purple-700 to-purple-500',text:'text-purple-600', light:'bg-purple-50', border:'border-purple-400', badge:'bg-purple-500', badgeText:'text-purple-700', dot:'bg-purple-500', ring:'ring-purple-400' },
  red:    { gradient:'from-red-700 to-red-500',      text:'text-red-600',    light:'bg-red-50',    border:'border-red-400',    badge:'bg-red-500',    badgeText:'text-red-700',    dot:'bg-red-500',    ring:'ring-red-400'    },
  gray:   { gradient:'from-gray-800 to-gray-600',    text:'text-gray-700',   light:'bg-gray-50',   border:'border-gray-400',   badge:'bg-gray-600',   badgeText:'text-gray-700',   dot:'bg-gray-500',   ring:'ring-gray-400'   },
}

export const colorOptions = [
  { id:'blue',   label:'Mavi',    hex:'#2563EB' },
  { id:'green',  label:'Yeşil',   hex:'#16A34A' },
  { id:'purple', label:'Mor',     hex:'#9333EA' },
  { id:'red',    label:'Kırmızı', hex:'#DC2626' },
  { id:'gray',   label:'Gri',     hex:'#374151' },
]

/* ─── Design Sistemi ───────────────────────────────────────── */
export const DEFAULT_DESIGN = {
  font:         'sans',        // 'sans' | 'serif' | 'mono'
  density:      'normal',      // 'compact' | 'normal' | 'wide'
  headingStyle: 'uppercase',   // 'uppercase' | 'underline' | 'colored' | 'dotted'
  intensity:    'medium',      // 'light' | 'medium' | 'strong'
  separator:    'line',        // 'line' | 'dot' | 'none'
  sectionOrder: ['summary','experience','education','skills'],
}

function getD(design = {}) {
  const d = { ...DEFAULT_DESIGN, ...design }

  const fontClass = d.font === 'serif' ? 'font-serif' : d.font === 'mono' ? 'font-mono' : ''

  const sp = {
    compact: { sec:'mb-3',   item:'mb-2',   p:'p-4 sm:p-5',    hp:'px-5 py-4 sm:px-8 sm:py-6'  },
    normal:  { sec:'mb-5',   item:'mb-3',   p:'p-5 sm:p-8',    hp:'px-6 py-6 sm:px-10 sm:py-8' },
    wide:    { sec:'mb-7',   item:'mb-5',   p:'p-6 sm:p-10',   hp:'px-7 py-7 sm:px-12 sm:py-10'},
  }[d.density] || { sec:'mb-5', item:'mb-3', p:'p-5 sm:p-8', hp:'px-6 py-6 sm:px-10 sm:py-8' }

  const heading = (ctext) => {
    if (d.headingStyle === 'uppercase') return `${ctext} font-bold text-xs uppercase tracking-widest pb-1 mb-3`
    if (d.headingStyle === 'underline') return `text-gray-800 font-bold text-sm pb-1.5 border-b-2 border-gray-800 mb-3`
    if (d.headingStyle === 'colored')   return `${ctext} font-semibold text-sm mb-3`
    if (d.headingStyle === 'dotted')    return `text-gray-600 font-bold text-xs uppercase tracking-wider mb-3 pl-3 border-l-2 border-gray-300`
    return `${ctext} font-bold text-xs uppercase tracking-widest pb-1 mb-3`
  }

  // item separator between list items
  const sep = d.separator === 'line' ? 'pb-3 mb-3 border-b border-gray-100 last:border-0 last:pb-0 last:mb-0'
            : d.separator === 'dot'  ? 'mb-3 pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-gray-300'
            : 'mb-3'

  // How much color intensity
  const headerOpacity = d.intensity === 'light' ? 'opacity-90' : ''
  const accentBg      = d.intensity === 'strong' ? '' : d.intensity === 'light' ? 'bg-opacity-60' : ''
  const showBorders   = d.intensity !== 'light'

  return { fontClass, sp, heading, sep, sectionOrder: d.sectionOrder, intensity: d.intensity, headerOpacity, accentBg, showBorders }
}

/* ─── Avatar ─────────────────────────────────────────────── */
function Avatar({ cvData, badge, size='md', shape='rounded-full', cls='' }) {
  const initials = cvData.name ? cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'CV'
  const sz = size==='lg' ? 'w-20 h-20 text-2xl' : size==='sm' ? 'w-12 h-12 text-sm' : 'w-14 h-14 sm:w-16 sm:h-16 text-xl'
  if (cvData.photo) return <img src={cvData.photo} alt="Profil" className={`${sz} ${shape} object-cover flex-shrink-0 border-2 border-white border-opacity-50 ${cls}`}/>
  return <div className={`${sz} ${shape} ${badge} bg-opacity-30 border-2 border-white border-opacity-30 flex items-center justify-center text-white font-bold flex-shrink-0 ${cls}`}>{initials}</div>
}

/* ─── 1. MODERN ───────────────────────────────────────────── */
export function ModernCV({ cvData, color='blue', design={} }) {
  const c=colors[color]||colors.blue, d=getD(design)
  const order = d.sectionOrder.filter(s=>s!=='skills')
  const sectionMap = {
    summary: cvData.summary && (
      <div key="summary" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Hakkımda</h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{cvData.summary}</p>
      </div>
    ),
    experience: cvData.experience?.length>0 && (
      <div key="experience" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Deneyim</h3>
        {cvData.experience.map((exp,i)=>(
          <div key={i} className={`pl-3 border-l-2 ${c.border} ${d.sp.item} last:mb-0`}>
            <div className="flex flex-wrap justify-between gap-1">
              <div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className={`${c.text} text-xs`}>{exp.company}</p></div>
              {exp.duration && <span className={`text-xs text-white ${c.badge} px-2 py-0.5 rounded-full h-fit`}>{exp.duration}</span>}
            </div>
            {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
          </div>
        ))}
      </div>
    ),
    education: cvData.education?.length>0 && (
      <div key="education" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Eğitim</h3>
        {cvData.education.map((edu,i)=>(
          <div key={i} className={`pl-3 border-l-2 ${c.border} ${d.sp.item} last:mb-0`}>
            <p className="text-gray-900 font-semibold text-xs sm:text-sm">{edu.school}</p>
            <p className="text-gray-500 text-xs">{edu.degree}</p>
            <p className={`${c.text} text-xs`}>{edu.year}</p>
          </div>
        ))}
      </div>
    ),
  }
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`bg-gradient-to-r ${c.gradient} ${d.sp.hp} ${d.headerOpacity}`}>
        <div className="flex items-center gap-4 sm:gap-6">
          <Avatar cvData={cvData} badge={c.badge}/>
          <div className="flex-1 min-w-0">
            <h2 className="text-white text-xl sm:text-3xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>
            {cvData.experience?.[0] && <p className="text-white opacity-80 text-xs sm:text-sm mt-1">{cvData.experience[0].position}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-5 mt-3 text-white opacity-80 text-xs">
          {cvData.email&&<span>✉ {cvData.email}</span>}{cvData.phone&&<span>📞 {cvData.phone}</span>}{cvData.location&&<span>📍 {cvData.location}</span>}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row">
        <div className={`sm:w-2/3 ${d.sp.p} sm:border-r border-gray-100`}>
          {order.map(s=>sectionMap[s])}
        </div>
        <div className={`sm:w-1/3 ${d.sp.p} ${c.light}`}>
          {cvData.skills?.length>0&&(
            <div>
              <h3 className={d.heading(c.text)}>Beceriler</h3>
              <div className="flex flex-wrap sm:flex-col gap-1.5 sm:gap-2">
                {cvData.skills.map((s,i)=>(
                  <div key={i} className="flex items-center gap-2"><div className={`w-1.5 h-1.5 ${c.dot} rounded-full shrink-0`}/><span className="text-gray-700 text-xs">{s}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── 2. KLASİK ───────────────────────────────────────────── */
export function KlasikCV({ cvData, color='gray', design={} }) {
  const c=colors[color]||colors.gray, d=getD(design)
  const order = d.sectionOrder
  const sectionMap = {
    summary: cvData.summary && (
      <div key="summary" className={d.sp.sec}>
        <h3 className="text-gray-800 font-bold text-xs uppercase tracking-widest mb-1 pb-1 border-b-2 border-gray-800">Hakkımda</h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mt-2">{cvData.summary}</p>
      </div>
    ),
    experience: cvData.experience?.length>0 && (
      <div key="experience" className={d.sp.sec}>
        <h3 className="text-gray-800 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-gray-200">Deneyim</h3>
        {cvData.experience.map((exp,i)=>(
          <div key={i} className={d.sp.item}>
            <div className="flex flex-wrap justify-between gap-1">
              <div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className="text-gray-500 text-xs">{exp.company}</p></div>
              <span className="text-gray-500 text-xs">{exp.duration}</span>
            </div>
            {exp.description&&<p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
          </div>
        ))}
      </div>
    ),
    education: cvData.education?.length>0 && (
      <div key="education" className={d.sp.sec}>
        <h3 className="text-gray-800 font-bold text-xs uppercase tracking-widest mb-2 pb-1 border-b border-gray-200">Eğitim</h3>
        {cvData.education.map((edu,i)=>(
          <div key={i} className={d.sp.item}>
            <p className="text-gray-900 font-semibold text-xs">{edu.school}</p>
            <p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p>
          </div>
        ))}
      </div>
    ),
    skills: cvData.skills?.length>0 && (
      <div key="skills" className={d.sp.sec}>
        <h3 className="text-gray-800 font-bold text-xs uppercase tracking-widest mb-2 pb-1 border-b border-gray-200">Beceriler</h3>
        <div className="flex flex-wrap gap-1">
          {cvData.skills.map((s,i)=><span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">{s}</span>)}
        </div>
      </div>
    ),
  }
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`bg-gray-900 ${d.sp.hp}`}>
        <div className="flex items-center gap-4">
          {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-gray-600 shrink-0"/>:<div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">{initials}</div>}
          <div className="min-w-0">
            <h2 className="text-white text-xl sm:text-3xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>
            {cvData.experience?.[0]&&<p className="text-gray-400 text-xs sm:text-sm mt-1">{cvData.experience[0].position}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-gray-400 text-xs">
          {cvData.email&&<span>✉ {cvData.email}</span>}{cvData.phone&&<span>📞 {cvData.phone}</span>}{cvData.location&&<span>📍 {cvData.location}</span>}
        </div>
      </div>
      <div className={d.sp.p}>{order.map(s=>sectionMap[s])}</div>
    </div>
  )
}

/* ─── 3. MİNİMAL ──────────────────────────────────────────── */
export function MinimalCV({ cvData, color='gray', design={} }) {
  const c=colors[color]||colors.gray, d=getD(design)
  const order = d.sectionOrder
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  const sectionMap = {
    summary: cvData.summary && <div key="s" className={d.sp.sec}><p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{cvData.summary}</p></div>,
    experience: cvData.experience?.length>0 && (
      <div key="e" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Deneyim</h3>
        {cvData.experience.map((exp,i)=>(
          <div key={i} className={d.sp.item}>
            <div className="flex flex-wrap justify-between gap-1">
              <div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className="text-gray-400 text-xs">{exp.company}</p></div>
              <span className="text-gray-400 text-xs">{exp.duration}</span>
            </div>
            {exp.description&&<p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
          </div>
        ))}
      </div>
    ),
    education: cvData.education?.length>0 && (
      <div key="ed" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Eğitim</h3>
        {cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-gray-900 font-semibold text-xs sm:text-sm">{edu.school}</p><p className="text-gray-400 text-xs">{edu.degree} — {edu.year}</p></div>)}
      </div>
    ),
    skills: cvData.skills?.length>0 && (
      <div key="sk" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Beceriler</h3>
        <div className="flex flex-wrap gap-1.5">{cvData.skills.map((s,i)=><span key={i} className={`text-xs ${c.light} ${c.badgeText} px-2.5 py-0.5 rounded-full border border-gray-200`}>{s}</span>)}</div>
      </div>
    ),
  }
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`${d.sp.p} pb-0`}>
        <div className="flex items-start gap-4 sm:gap-6 pb-5 sm:pb-7 border-b border-gray-100">
          {cvData.photo?<img src={cvData.photo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0"/>:<div className={`w-16 h-16 sm:w-20 sm:h-20 ${c.badge} rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold shrink-0`}>{initials}</div>}
          <div className="min-w-0">
            <h2 className="text-gray-900 text-xl sm:text-3xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>
            {cvData.experience?.[0]&&<p className={`${c.text} text-sm mt-1`}>{cvData.experience[0].position}</p>}
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-2 text-gray-400 text-xs">
              {cvData.email&&<span>{cvData.email}</span>}{cvData.phone&&<span>{cvData.phone}</span>}{cvData.location&&<span>{cvData.location}</span>}
            </div>
          </div>
        </div>
        <div className={d.sp.p}>{order.map(s=>sectionMap[s])}</div>
      </div>
    </div>
  )
}

/* ─── 4. TİMELİNE ─────────────────────────────────────────── */
export function TimelineCV({ cvData, color='blue', design={} }) {
  const c=colors[color]||colors.blue, d=getD(design)
  const order = d.sectionOrder.filter(s=>s!=='skills')
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  const sectionMap = {
    summary: cvData.summary && <div key="s" className={`${d.sp.sec} ${c.light} border-l-4 ${c.border} pl-4 py-3 rounded-r-xl`}><p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{cvData.summary}</p></div>,
    experience: cvData.experience?.length>0 && (
      <div key="e" className={d.sp.sec}>
        <h3 className={d.heading('text-gray-900')}>Deneyim</h3>
        <div className="relative">
          <div className={`absolute left-3 top-0 bottom-0 w-0.5 ${c.light}`}/>
          {cvData.experience.map((exp,i)=>(
            <div key={i} className={`pl-8 sm:pl-10 relative ${d.sp.item}`}>
              <div className={`absolute left-0 top-1 w-5 h-5 sm:w-6 sm:h-6 ${c.badge} rounded-full flex items-center justify-center`}><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"/></div>
              <div className="flex flex-wrap justify-between gap-1">
                <div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className={`${c.text} text-xs`}>{exp.company}</p></div>
                {exp.duration&&<span className={`text-xs ${c.light} ${c.badgeText} px-2 py-0.5 rounded-full`}>{exp.duration}</span>}
              </div>
              {exp.description&&<p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    ),
    education: cvData.education?.length>0 && (
      <div key="ed" className={d.sp.sec}>
        <h3 className={d.heading('text-gray-900')}>Eğitim</h3>
        {cvData.education.map((edu,i)=><div key={i} className={`pl-3 border-l-2 ${c.border} ${d.sp.item}`}><p className="text-gray-900 font-semibold text-xs sm:text-sm">{edu.school}</p><p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p></div>)}
      </div>
    ),
  }
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`bg-gradient-to-r ${c.gradient} ${d.sp.hp} ${d.headerOpacity} flex items-center gap-4 sm:gap-6`}>
        {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white border-opacity-60 shrink-0"/>:<div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">{initials}</div>}
        <div className="min-w-0">
          <h2 className="text-white text-xl sm:text-3xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>
          {cvData.experience?.[0]&&<p className="text-white opacity-80 text-xs sm:text-sm mt-1">{cvData.experience[0].position}</p>}
          <div className="flex flex-wrap gap-3 mt-2 text-white opacity-70 text-xs">
            {cvData.email&&<span>✉ {cvData.email}</span>}{cvData.phone&&<span>📞 {cvData.phone}</span>}{cvData.location&&<span>📍 {cvData.location}</span>}
          </div>
        </div>
      </div>
      <div className={d.sp.p}>
        {order.map(s=>sectionMap[s])}
        {cvData.skills?.length>0&&(
          <div className={d.sp.sec}>
            <h3 className={d.heading('text-gray-900')}>Beceriler</h3>
            <div className="flex flex-wrap gap-1.5">{cvData.skills.map((s,i)=><span key={i} className={`${c.light} ${c.badgeText} text-xs px-2.5 py-0.5 rounded-full border`}>{s}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── 5. SİDEBAR ──────────────────────────────────────────── */
export function SidebarCV({ cvData, color='blue', design={} }) {
  const c=colors[color]||colors.blue, d=getD(design)
  const order = d.sectionOrder.filter(s=>s!=='skills')
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className="flex flex-col sm:flex-row">
        <div className={`sm:w-2/5 bg-slate-800 ${d.sp.p}`}>
          <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-5">
            {cvData.photo?<img src={cvData.photo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-600 sm:mb-3 shrink-0"/>:<div className={`w-16 h-16 sm:w-20 sm:h-20 ${c.badge} rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold sm:mb-3 shrink-0`}>{initials}</div>}
            <div className="sm:text-center">
              <h2 className="text-white text-base sm:text-xl font-bold">{cvData.name||'Ad Soyad'}</h2>
              {cvData.experience?.[0]&&<p className="text-teal-400 text-xs mt-0.5">{cvData.experience[0].position}</p>}
            </div>
          </div>
          <div className="space-y-1.5 mb-4">
            {cvData.email&&<p className="text-slate-300 text-xs truncate">✉ {cvData.email}</p>}
            {cvData.phone&&<p className="text-slate-300 text-xs">📞 {cvData.phone}</p>}
            {cvData.location&&<p className="text-slate-300 text-xs">📍 {cvData.location}</p>}
          </div>
          {cvData.skills?.length>0&&(
            <div className="mb-4">
              <h3 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">Beceriler</h3>
              <div className="flex flex-wrap sm:flex-col gap-1.5 sm:gap-1">
                {cvData.skills.map((s,i)=><div key={i} className="flex items-center gap-2"><div className={`w-1.5 h-1.5 ${c.badge} rounded-full shrink-0`}/><span className="text-slate-400 text-xs">{s}</span></div>)}
              </div>
            </div>
          )}
          {cvData.education?.length>0&&(
            <div>
              <h3 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">Eğitim</h3>
              {cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-white text-xs font-medium">{edu.school}</p><p className="text-slate-500 text-xs">{edu.degree} {edu.year}</p></div>)}
            </div>
          )}
        </div>
        <div className={`flex-1 ${d.sp.p}`}>
          {cvData.summary&&<div className={d.sp.sec}><h3 className="text-teal-500 font-bold text-xs uppercase tracking-widest mb-2 pb-1 border-b border-gray-100">Hakkımda</h3><p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{cvData.summary}</p></div>}
          {cvData.experience?.length>0&&(
            <div>
              <h3 className="text-teal-500 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-gray-100">Deneyim</h3>
              {cvData.experience.map((exp,i)=>(
                <div key={i} className={`pl-3 border-l-2 border-teal-400 ${d.sp.item}`}>
                  <div className="flex flex-wrap justify-between gap-1"><div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className="text-teal-500 text-xs">{exp.company}</p></div><span className="text-gray-400 text-xs">{exp.duration}</span></div>
                  {exp.description&&<p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── 6. BANT ─────────────────────────────────────────────── */
export function BantCV({ cvData, color='red', design={} }) {
  const c=colors[color]||colors.red, d=getD(design)
  const order = d.sectionOrder
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  const sectionMap = {
    summary: cvData.summary&&<div key="s" className={d.sp.sec}><p className="text-gray-600 text-xs sm:text-sm leading-relaxed italic">{cvData.summary}</p></div>,
    experience: cvData.experience?.length>0&&(
      <div key="e" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Deneyim</h3>
        {cvData.experience.map((exp,i)=>(
          <div key={i} className={d.sp.item}>
            <div className="flex flex-wrap justify-between gap-1"><div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className={`${c.text} text-xs`}>{exp.company}</p></div>{exp.duration&&<span className={`text-xs text-white ${c.badge} px-2 py-0.5 rounded-full`}>{exp.duration}</span>}</div>
            {exp.description&&<p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
          </div>
        ))}
      </div>
    ),
    education: cvData.education?.length>0&&(
      <div key="ed" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Eğitim</h3>
        {cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-gray-900 font-semibold text-xs">{edu.school}</p><p className="text-gray-400 text-xs">{edu.degree} {edu.year}</p></div>)}
      </div>
    ),
    skills: cvData.skills?.length>0&&(
      <div key="sk" className={d.sp.sec}>
        <h3 className={d.heading(c.text)}>Beceriler</h3>
        <div className="flex flex-wrap gap-1">{cvData.skills.map((s,i)=><span key={i} className={`text-xs ${c.light} ${c.badgeText} px-2 py-0.5 rounded-full`}>{s}</span>)}</div>
      </div>
    ),
  }
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`h-1.5 bg-gradient-to-r ${c.gradient}`}/>
      <div className={`${d.sp.hp} flex flex-wrap items-center gap-4 border-b border-gray-100`}>
        {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200 shrink-0"/>:<div className={`w-14 h-14 sm:w-16 sm:h-16 ${c.light} rounded-full flex items-center justify-center ${c.text} text-xl font-bold shrink-0 border-2 border-gray-200`}>{initials}</div>}
        <div className="min-w-0">
          <h2 className="text-gray-900 text-lg sm:text-2xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>
          {cvData.experience?.[0]&&<p className={`${c.text} text-xs sm:text-sm`}>{cvData.experience[0].position}</p>}
          <div className="flex flex-wrap gap-3 mt-1 text-gray-400 text-xs">{cvData.email&&<span>✉ {cvData.email}</span>}{cvData.phone&&<span>📞 {cvData.phone}</span>}{cvData.location&&<span>📍 {cvData.location}</span>}</div>
        </div>
      </div>
      <div className={d.sp.p}>{order.map(s=>sectionMap[s])}</div>
    </div>
  )
}

/* ─── 7. KARTLI ───────────────────────────────────────────── */
export function KartliCV({ cvData, color='purple', design={} }) {
  const c=colors[color]||colors.purple, d=getD(design)
  const order = d.sectionOrder
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-gray-100 rounded-2xl shadow-2xl overflow-hidden w-full ${d.sp.p} space-y-3 ${d.fontClass}`}>
      <div className="bg-white rounded-xl p-4 sm:p-5 flex items-center gap-4 shadow-sm">
        {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"/>:<div className={`w-14 h-14 sm:w-16 sm:h-16 ${c.badge} rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0`}>{initials}</div>}
        <div className="min-w-0">
          <h2 className="text-gray-900 text-lg sm:text-xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>
          {cvData.experience?.[0]&&<p className={`${c.text} text-xs sm:text-sm`}>{cvData.experience[0].position}</p>}
          <div className="flex flex-wrap gap-2 mt-1 text-gray-400 text-xs">{cvData.email&&<span className="truncate">{cvData.email}</span>}{cvData.phone&&<span>{cvData.phone}</span>}</div>
        </div>
      </div>
      {order.map(s=>{
        if(s==='summary'&&cvData.summary) return <div key={s} className="bg-white rounded-xl p-4 shadow-sm"><h3 className={d.heading(c.text)}>Hakkımda</h3><p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{cvData.summary}</p></div>
        if(s==='experience'&&cvData.experience?.length>0) return (
          <div key={s} className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className={d.heading(c.text)}>Deneyim</h3>
            {cvData.experience.map((exp,i)=>(
              <div key={i} className={d.sp.item}>
                <div className="flex flex-wrap justify-between gap-1"><div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className={`${c.text} text-xs`}>{exp.company}</p></div>{exp.duration&&<span className={`text-xs ${c.light} ${c.badgeText} px-2 py-0.5 rounded-lg`}>{exp.duration}</span>}</div>
                {exp.description&&<p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )
        if(s==='education'&&cvData.education?.length>0) return <div key={s} className="bg-white rounded-xl p-4 shadow-sm"><h3 className={d.heading(c.text)}>Eğitim</h3>{cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-gray-900 font-semibold text-xs">{edu.school}</p><p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p></div>)}</div>
        if(s==='skills'&&cvData.skills?.length>0) return <div key={s} className="bg-white rounded-xl p-4 shadow-sm"><h3 className={d.heading(c.text)}>Beceriler</h3><div className="flex flex-wrap gap-1.5">{cvData.skills.map((sk,i)=><span key={i} className={`${c.light} ${c.badgeText} text-xs px-2 py-0.5 rounded-lg border`}>{sk}</span>)}</div></div>
        return null
      })}
    </div>
  )
}

/* ─── 8. KREATİF ──────────────────────────────────────────── */
export function KreatifCV({ cvData, color='purple', design={} }) {
  const d=getD(design)
  const order = d.sectionOrder
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`bg-gradient-to-r from-purple-600 to-pink-500 ${d.sp.hp} ${d.headerOpacity}`}>
        <div className="flex items-center gap-4 sm:gap-6">
          {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white border-opacity-60 shrink-0"/>:<div className="w-14 h-14 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">{initials}</div>}
          <div className="min-w-0"><h2 className="text-white text-xl sm:text-3xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>{cvData.experience?.[0]&&<p className="text-purple-200 text-xs sm:text-sm mt-1">{cvData.experience[0].position}</p>}</div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-purple-100 text-xs">{cvData.email&&<span>✉ {cvData.email}</span>}{cvData.phone&&<span>📞 {cvData.phone}</span>}{cvData.location&&<span>📍 {cvData.location}</span>}</div>
      </div>
      <div className={d.sp.p}>
        {order.map(s=>{
          if(s==='summary'&&cvData.summary) return <div key={s} className={`${d.sp.sec} bg-purple-50 border-l-4 border-purple-500 pl-4 py-3 rounded-r-xl`}><p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{cvData.summary}</p></div>
          if(s==='experience'&&cvData.experience?.length>0) return (
            <div key={s} className={d.sp.sec}>
              <h3 className="text-purple-600 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-purple-100">Deneyim</h3>
              {cvData.experience.map((exp,i)=>(
                <div key={i} className={`${d.sp.item} bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4`}>
                  <div className="flex flex-wrap justify-between gap-1"><div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className="text-purple-600 text-xs">{exp.company}</p></div>{exp.duration&&<span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">{exp.duration}</span>}</div>
                  {exp.description&&<p className="text-gray-600 text-xs mt-2 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          )
          if(s==='education'&&cvData.education?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-purple-600 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-purple-100">Eğitim</h3>{cvData.education.map((edu,i)=><div key={i} className={`pl-3 border-l-2 border-purple-300 ${d.sp.item}`}><p className="text-gray-900 font-semibold text-xs">{edu.school}</p><p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p></div>)}</div>
          if(s==='skills'&&cvData.skills?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-purple-600 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-purple-100">Beceriler</h3><div className="flex flex-wrap gap-1.5">{cvData.skills.map((sk,i)=><span key={i} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full">{sk}</span>)}</div></div>
          return null
        })}
      </div>
    </div>
  )
}

/* ─── 9. TEKNOLOJİ ────────────────────────────────────────── */
export function TeknolojiCV({ cvData, color='green', design={} }) {
  const d=getD(design)
  const order = d.sectionOrder
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-gray-900 rounded-2xl shadow-2xl overflow-hidden w-full font-mono ${d.fontClass}`}>
      <div className={`border-b border-green-500 ${d.sp.hp}`}>
        <div className="flex items-center gap-4 sm:gap-6">
          {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-green-500 shrink-0"/>:<div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center text-green-400 text-xl font-bold border-2 border-green-500 shrink-0">{initials}</div>}
          <div className="min-w-0"><h2 className="text-green-400 text-xl sm:text-2xl font-bold truncate">{cvData.name||'Adınız Soyadınız'}</h2>{cvData.experience?.[0]&&<p className="text-green-600 text-xs sm:text-sm mt-1">&gt; {cvData.experience[0].position}</p>}</div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-green-700 text-xs">{cvData.email&&<span>{cvData.email}</span>}{cvData.phone&&<span>{cvData.phone}</span>}{cvData.location&&<span>{cvData.location}</span>}</div>
      </div>
      <div className={d.sp.p}>
        {order.map(s=>{
          if(s==='summary'&&cvData.summary) return <div key={s} className={`${d.sp.sec} bg-green-500 bg-opacity-10 border border-green-800 rounded-lg p-3 sm:p-4`}><p className="text-green-300 text-xs leading-relaxed font-sans">// {cvData.summary}</p></div>
          if(s==='experience'&&cvData.experience?.length>0) return (
            <div key={s} className={d.sp.sec}>
              <h3 className="text-green-500 font-bold text-xs mb-3">// DENEYIM</h3>
              {cvData.experience.map((exp,i)=>(
                <div key={i} className={`border-l-2 border-green-800 pl-3 sm:pl-4 ${d.sp.item}`}>
                  <div className="flex flex-wrap justify-between gap-1"><div><p className="text-white font-semibold text-xs sm:text-sm font-sans">{exp.position}</p><p className="text-green-600 text-xs">{exp.company}</p></div><span className="text-green-700 text-xs">{exp.duration}</span></div>
                  {exp.description&&<p className="text-gray-400 text-xs mt-1 leading-relaxed font-sans">{exp.description}</p>}
                </div>
              ))}
            </div>
          )
          if(s==='education'&&cvData.education?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-green-500 font-bold text-xs mb-3">// EGITIM</h3>{cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-white text-xs font-sans">{edu.school}</p><p className="text-gray-500 text-xs font-sans">{edu.degree} {edu.year}</p></div>)}</div>
          if(s==='skills'&&cvData.skills?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-green-500 font-bold text-xs mb-3">// BECERILER</h3><div className="flex flex-wrap gap-1.5">{cvData.skills.map((sk,i)=><span key={i} className="bg-green-900 border border-green-700 text-green-400 text-xs px-2 py-0.5 rounded font-sans">{sk}</span>)}</div></div>
          return null
        })}
      </div>
    </div>
  )
}

/* ─── 10. ELEGANT ─────────────────────────────────────────── */
export function ElegantCV({ cvData, color='gray', design={} }) {
  const d=getD(design)
  const order = d.sectionOrder
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-amber-50 rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`border-b-2 border-amber-600 ${d.sp.hp}`}>
        <div className="flex items-center gap-4 sm:gap-6">
          {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-amber-400 shrink-0"/>:<div className="w-14 h-14 sm:w-16 sm:h-16 bg-amber-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">{initials}</div>}
          <div className="min-w-0"><h2 className="text-amber-900 text-xl sm:text-3xl font-bold tracking-wide truncate">{cvData.name||'Adınız Soyadınız'}</h2>{cvData.experience?.[0]&&<p className="text-amber-600 text-xs sm:text-sm mt-1 italic">{cvData.experience[0].position}</p>}</div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-amber-700 text-xs">{cvData.email&&<span>✉ {cvData.email}</span>}{cvData.phone&&<span>☎ {cvData.phone}</span>}{cvData.location&&<span>⌖ {cvData.location}</span>}</div>
      </div>
      <div className={d.sp.p}>
        {order.map(s=>{
          if(s==='summary'&&cvData.summary) return <div key={s} className={d.sp.sec}><p className="text-amber-800 text-xs sm:text-sm leading-relaxed italic">{cvData.summary}</p></div>
          if(s==='experience'&&cvData.experience?.length>0) return (
            <div key={s} className={d.sp.sec}>
              <h3 className="text-amber-800 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-amber-300">İş Deneyimi</h3>
              {cvData.experience.map((exp,i)=>(
                <div key={i} className={`flex flex-col sm:flex-row gap-1 sm:gap-4 ${d.sp.item}`}>
                  <div className="sm:shrink-0 sm:text-right sm:w-24"><span className="text-amber-600 text-xs">{exp.duration}</span></div>
                  <div className="flex-1 sm:border-l-2 sm:border-amber-300 sm:pl-4"><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className="text-amber-600 text-xs">{exp.company}</p>{exp.description&&<p className="text-gray-600 text-xs mt-1">{exp.description}</p>}</div>
                </div>
              ))}
            </div>
          )
          if(s==='education'&&cvData.education?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-amber-800 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-amber-300">Eğitim</h3>{cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-gray-900 font-semibold text-xs sm:text-sm">{edu.school}</p><p className="text-amber-600 text-xs">{edu.degree} — {edu.year}</p></div>)}</div>
          if(s==='skills'&&cvData.skills?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-amber-800 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-amber-300">Beceriler</h3><div className="flex flex-wrap gap-1.5">{cvData.skills.map((sk,i)=><span key={i} className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded border border-amber-300">{sk}</span>)}</div></div>
          return null
        })}
      </div>
    </div>
  )
}

/* ─── 11. KOMPAKT ─────────────────────────────────────────── */
export function KompaktCV({ cvData, color='blue', design={} }) {
  const c=colors[color]||colors.blue, d=getD(design)
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className="flex flex-col sm:flex-row">
        <div className={`sm:w-56 bg-slate-800 ${d.sp.p}`}>
          <div className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-5">
            {cvData.photo?<img src={cvData.photo} alt="" className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-600 sm:mb-3 shrink-0"/>:<div className={`w-14 h-14 sm:w-20 sm:h-20 ${c.badge} rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold sm:mb-3 shrink-0`}>{initials}</div>}
            <div className="sm:text-center"><h2 className="text-white font-bold text-sm sm:text-base">{cvData.name||'Ad Soyad'}</h2>{cvData.experience?.[0]&&<p className="text-slate-400 text-xs mt-0.5">{cvData.experience[0].position}</p>}</div>
          </div>
          <div className="space-y-1 mb-4">{cvData.email&&<p className="text-slate-400 text-xs truncate">✉ {cvData.email}</p>}{cvData.phone&&<p className="text-slate-400 text-xs">☎ {cvData.phone}</p>}{cvData.location&&<p className="text-slate-400 text-xs">⌖ {cvData.location}</p>}</div>
          {cvData.skills?.length>0&&<div className="mb-4"><h3 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">Beceriler</h3><div className="flex flex-wrap sm:flex-col gap-1 sm:gap-1.5">{cvData.skills.slice(0,10).map((s,i)=><div key={i} className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 ${c.badge} rounded-full shrink-0`}/><span className="text-slate-400 text-xs">{s}</span></div>)}</div></div>}
          {cvData.education?.length>0&&<div><h3 className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">Eğitim</h3>{cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-white text-xs font-medium">{edu.school}</p><p className="text-slate-500 text-xs">{edu.degree} {edu.year}</p></div>)}</div>}
        </div>
        <div className={`flex-1 ${d.sp.p}`}>
          {cvData.summary&&<div className={d.sp.sec}><h3 className={d.heading(c.text)}>Hakkımda</h3><p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{cvData.summary}</p></div>}
          {cvData.experience?.length>0&&(
            <div>
              <h3 className={d.heading(c.text)}>Deneyim</h3>
              {cvData.experience.map((exp,i)=>(
                <div key={i} className={`pl-3 border-l-2 ${c.border} ${d.sp.item}`}>
                  <div className="flex flex-wrap justify-between gap-1"><div><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className={`${c.text} text-xs`}>{exp.company}</p></div>{exp.duration&&<span className={`text-xs text-white ${c.badge} px-2 py-0.5 rounded-full`}>{exp.duration}</span>}</div>
                  {exp.description&&<p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── 12. AKADEMİK ────────────────────────────────────────── */
export function AkademikCV({ cvData, color='gray', design={} }) {
  const d=getD(design)
  const order = d.sectionOrder
  const initials = cvData.name?cvData.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():'CV'
  return (
    <div id="cv-preview" className={`bg-white rounded-2xl shadow-2xl overflow-hidden w-full ${d.fontClass}`}>
      <div className={`text-center ${d.sp.hp} border-b-2 border-gray-900`}>
        {cvData.photo?<img src={cvData.photo} alt="" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover mx-auto mb-3 sm:mb-4 border-2 border-gray-300"/>:<div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">{initials}</div>}
        <h2 className="text-gray-900 text-xl sm:text-2xl font-bold tracking-widest uppercase">{cvData.name||'Adınız Soyadınız'}</h2>
        {cvData.experience?.[0]&&<p className="text-gray-600 text-xs sm:text-sm mt-1 italic">{cvData.experience[0].position}</p>}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-5 mt-2 text-gray-500 text-xs">{cvData.email&&<span>{cvData.email}</span>}{cvData.phone&&<span>{cvData.phone}</span>}{cvData.location&&<span>{cvData.location}</span>}</div>
      </div>
      <div className={d.sp.p}>
        {order.map(s=>{
          if(s==='summary'&&cvData.summary) return <div key={s} className={`${d.sp.sec} text-center`}><p className="text-gray-700 text-xs sm:text-sm leading-relaxed italic max-w-2xl mx-auto">{cvData.summary}</p></div>
          if(s==='experience'&&cvData.experience?.length>0) return (
            <div key={s} className={d.sp.sec}>
              <h3 className="text-gray-900 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-gray-900">İş Deneyimi</h3>
              {cvData.experience.map((exp,i)=>(
                <div key={i} className={`flex flex-col sm:grid sm:grid-cols-4 sm:gap-4 ${d.sp.item}`}>
                  <p className="text-gray-500 text-xs sm:text-right mb-0.5 sm:mb-0">{exp.duration}</p>
                  <div className="sm:col-span-3"><p className="text-gray-900 font-semibold text-xs sm:text-sm">{exp.position}</p><p className="text-gray-600 text-xs italic">{exp.company}</p>{exp.description&&<p className="text-gray-600 text-xs mt-1 leading-relaxed">{exp.description}</p>}</div>
                </div>
              ))}
            </div>
          )
          if(s==='education'&&cvData.education?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-gray-900 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-gray-900">Eğitim</h3>{cvData.education.map((edu,i)=><div key={i} className={d.sp.item}><p className="text-gray-900 font-semibold text-xs sm:text-sm">{edu.school}</p><p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p></div>)}</div>
          if(s==='skills'&&cvData.skills?.length>0) return <div key={s} className={d.sp.sec}><h3 className="text-gray-900 font-bold text-xs uppercase tracking-widest mb-3 pb-1 border-b border-gray-900">Beceriler</h3><div className="flex flex-wrap gap-x-4 gap-y-0.5">{cvData.skills.map((sk,i)=><span key={i} className="text-gray-700 text-xs">• {sk}</span>)}</div></div>
          return null
        })}
      </div>
    </div>
  )
}

export const CVComponents = {
  Modern:    ModernCV,
  Klasik:    KlasikCV,
  Minimal:   MinimalCV,
  Kreatif:   KreatifCV,
  Teknoloji: TeknolojiCV,
  Elegant:   ElegantCV,
  Kompakt:   KompaktCV,
  Akademik:  AkademikCV,
  Timeline:  TimelineCV,
  Sidebar:   SidebarCV,
  Bant:      BantCV,
  Kartlı:    KartliCV,
}
