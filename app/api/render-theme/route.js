export async function POST(request) {
  try {
    const { cvData, theme } = await request.json()
    const renderer = renderers[theme] || renderers['elegant']
    const html = renderer(cvData)
    return Response.json({ success: true, html })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}

const base = (cv, styles, body) => `<style>${styles}</style><div class="cv">${body(cv)}</div>`

const header = (cv, cls) => `
  <div class="${cls}-header">
    <h1 class="${cls}-name">${cv.name || ''}</h1>
    ${cv.experience?.[0] ? `<p class="${cls}-title">${cv.experience[0].position}</p>` : ''}
    <div class="${cls}-contact">
      ${cv.email ? `<span>✉ ${cv.email}</span>` : ''}
      ${cv.phone ? `<span>📞 ${cv.phone}</span>` : ''}
      ${cv.location ? `<span>📍 ${cv.location}</span>` : ''}
    </div>
    ${cv.summary ? `<p class="${cls}-summary">${cv.summary}</p>` : ''}
  </div>`

const experience = (cv, cls) => cv.experience?.length ? `
  <div class="${cls}-section">
    <div class="${cls}-section-title">Deneyim</div>
    ${cv.experience.map(exp => `
      <div class="${cls}-item">
        <div class="${cls}-item-row">
          <div><strong>${exp.position}</strong><br><span class="${cls}-sub">${exp.company}</span></div>
          <span class="${cls}-date">${exp.duration}</span>
        </div>
        ${exp.description ? `<p class="${cls}-desc">${exp.description}</p>` : ''}
      </div>`).join('')}
  </div>` : ''

const education = (cv, cls) => cv.education?.length ? `
  <div class="${cls}-section">
    <div class="${cls}-section-title">Eğitim</div>
    ${cv.education.map(edu => `
      <div class="${cls}-item">
        <div class="${cls}-item-row">
          <div><strong>${edu.school}</strong><br><span class="${cls}-sub">${edu.degree}</span></div>
          <span class="${cls}-date">${edu.year}</span>
        </div>
      </div>`).join('')}
  </div>` : ''

const skills = (cv, cls, pill = false) => cv.skills?.length ? `
  <div class="${cls}-section">
    <div class="${cls}-section-title">Beceriler</div>
    <div class="${cls}-skills">
      ${cv.skills.map(s => `<span class="${cls}-skill">${s}</span>`).join('')}
    </div>
  </div>` : ''

const renderers = {

  // 1. ELEGANT
  elegant: cv => `
    <style>
      .elegant{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#333}
      .elegant-header{text-align:center;border-bottom:2px solid #ddd;padding-bottom:24px;margin-bottom:28px}
      .elegant-name{font-size:32px;color:#2c3e50;margin:0 0 6px}
      .elegant-title{color:#7f8c8d;font-size:15px;margin:0 0 10px}
      .elegant-contact{display:flex;justify-content:center;gap:20px;font-size:12px;color:#555;flex-wrap:wrap}
      .elegant-summary{color:#555;font-size:13px;line-height:1.7;margin-top:14px}
      .elegant-section{margin-bottom:24px}
      .elegant-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#2c3e50;border-bottom:1px solid #ddd;padding-bottom:5px;margin-bottom:14px}
      .elegant-item{margin-bottom:14px}
      .elegant-item-row{display:flex;justify-content:space-between}
      .elegant-sub{color:#7f8c8d;font-size:12px}
      .elegant-date{color:#aaa;font-size:12px}
      .elegant-desc{color:#555;font-size:12px;margin-top:5px;line-height:1.5}
      .elegant-skills{display:flex;flex-wrap:wrap;gap:8px}
      .elegant-skill{background:#f5f5f5;color:#333;padding:3px 12px;border-radius:20px;font-size:12px;border:1px solid #ddd}
    </style>
    <div class="elegant">${header(cv,'elegant')}${experience(cv,'elegant')}${education(cv,'elegant')}${skills(cv,'elegant')}</div>`,

  // 2. FLAT
  flat: cv => `
    <style>
      .flat{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;color:#333}
      .flat-header{background:#2980b9;color:white;padding:36px}
      .flat-name{font-size:34px;font-weight:300;margin:0 0 6px;letter-spacing:2px}
      .flat-title{font-size:13px;opacity:.9;margin:0 0 12px;text-transform:uppercase}
      .flat-contact{display:flex;gap:16px;font-size:12px;opacity:.9;flex-wrap:wrap}
      .flat-summary{color:rgba(255,255,255,.85);font-size:13px;margin-top:12px;line-height:1.6}
      .flat-body{display:grid;grid-template-columns:220px 1fr}
      .flat-sidebar{background:#ecf0f1;padding:28px}
      .flat-main{padding:28px}
      .flat-section{margin-bottom:22px}
      .flat-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#2980b9;border-bottom:2px solid #2980b9;padding-bottom:5px;margin-bottom:12px}
      .flat-item{margin-bottom:12px}
      .flat-item-row{display:flex;justify-content:space-between}
      .flat-sub{color:#7f8c8d;font-size:12px}
      .flat-date{color:#aaa;font-size:11px}
      .flat-desc{color:#555;font-size:12px;margin-top:4px;line-height:1.5}
      .flat-skills{display:flex;flex-direction:column;gap:4px}
      .flat-skill{background:#bdc3c7;color:#2c3e50;padding:3px 10px;border-radius:3px;font-size:12px}
    </style>
    <div class="flat">
      <div class="flat-header">
        <div class="flat-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="flat-title">${cv.experience[0].position}</div>`:''}
        <div class="flat-contact">${cv.email?`<span>✉ ${cv.email}</span>`:''} ${cv.phone?`<span>📞 ${cv.phone}</span>`:''} ${cv.location?`<span>📍 ${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="flat-summary">${cv.summary}</div>`:''}
      </div>
      <div class="flat-body">
        <div class="flat-sidebar">${skills(cv,'flat')}${education(cv,'flat')}</div>
        <div class="flat-main">${experience(cv,'flat')}</div>
      </div>
    </div>`,

  // 3. STACKOVERFLOW
  stackoverflow: cv => `
    <style>
      .so{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:36px;color:#242729}
      .so-header{display:flex;gap:20px;border-bottom:1px solid #e4e6e8;padding-bottom:20px;margin-bottom:20px}
      .so-avatar{width:72px;height:72px;background:#f48024;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:28px;font-weight:bold;flex-shrink:0}
      .so-name{font-size:26px;font-weight:bold;margin:0 0 4px}
      .so-title{font-size:13px;color:#6a737c;margin:0 0 8px}
      .so-contact{display:flex;gap:14px;font-size:12px;color:#6a737c;flex-wrap:wrap}
      .so-summary{color:#525960;font-size:13px;line-height:1.6;margin-bottom:18px}
      .so-section{margin-bottom:20px}
      .so-section-title{font-size:11px;font-weight:bold;color:#f48024;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
      .so-item{border-left:3px solid #f48024;padding-left:14px;margin-bottom:14px}
      .so-item-row{display:flex;justify-content:space-between}
      .so-sub{color:#6a737c;font-size:12px}
      .so-date{color:#9199a1;font-size:11px}
      .so-desc{color:#525960;font-size:12px;margin-top:5px;line-height:1.5}
      .so-skills{display:flex;flex-wrap:wrap;gap:6px}
      .so-skill{background:#e1ecf4;color:#39739d;padding:2px 8px;border-radius:3px;font-size:12px;border:1px solid #a4c4e1}
    </style>
    <div class="so">
      <div class="so-header">
        <div class="so-avatar">${cv.name?.charAt(0)||'R'}</div>
        <div><div class="so-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="so-title">${cv.experience[0].position}</div>`:''}<div class="so-contact">${cv.email?`<span>✉ ${cv.email}</span>`:''} ${cv.phone?`<span>📞 ${cv.phone}</span>`:''} ${cv.location?`<span>📍 ${cv.location}</span>`:''}</div></div>
      </div>
      ${cv.summary?`<div class="so-summary">${cv.summary}</div>`:''}
      ${experience(cv,'so')}${education(cv,'so')}${skills(cv,'so')}
    </div>`,

  // 4. CORPORATE (Kurumsal)
  corporate: cv => `
    <style>
      .corp{font-family:'Arial',sans-serif;max-width:800px;margin:0 auto;padding:0;color:#1a1a2e}
      .corp-header{background:#1a1a2e;color:white;padding:36px;display:flex;justify-content:space-between;align-items:center}
      .corp-name{font-size:28px;font-weight:bold;margin:0 0 4px;letter-spacing:1px}
      .corp-title{font-size:13px;color:#a0aec0;margin:0}
      .corp-contact{text-align:right;font-size:12px;color:#a0aec0;line-height:1.8}
      .corp-body{padding:36px}
      .corp-summary{color:#4a5568;font-size:13px;line-height:1.7;margin-bottom:24px;padding:16px;background:#f7fafc;border-left:4px solid #1a1a2e;border-radius:0 4px 4px 0}
      .corp-section{margin-bottom:24px}
      .corp-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#1a1a2e;margin-bottom:12px;display:flex;align-items:center;gap:8px}
      .corp-section-title::after{content:'';flex:1;height:1px;background:#e2e8f0}
      .corp-item{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #edf2f7}
      .corp-item:last-child{border-bottom:none}
      .corp-item-row{display:flex;justify-content:space-between;align-items:flex-start}
      .corp-sub{color:#718096;font-size:12px}
      .corp-date{background:#1a1a2e;color:white;padding:2px 8px;border-radius:3px;font-size:11px;white-space:nowrap}
      .corp-desc{color:#4a5568;font-size:12px;margin-top:6px;line-height:1.5}
      .corp-skills{display:flex;flex-wrap:wrap;gap:8px}
      .corp-skill{background:#1a1a2e;color:white;padding:4px 12px;border-radius:4px;font-size:12px}
    </style>
    <div class="corp">
      <div class="corp-header">
        <div><div class="corp-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="corp-title">${cv.experience[0].position}</div>`:''}</div>
        <div class="corp-contact">${cv.email?`<div>✉ ${cv.email}</div>`:''} ${cv.phone?`<div>📞 ${cv.phone}</div>`:''} ${cv.location?`<div>📍 ${cv.location}</div>`:''}</div>
      </div>
      <div class="corp-body">
        ${cv.summary?`<div class="corp-summary">${cv.summary}</div>`:''}
        ${experience(cv,'corp')}${education(cv,'corp')}${skills(cv,'corp')}
      </div>
    </div>`,

  // 5. CREATIVE (Yaratıcı)
  creative: cv => `
    <style>
      .cre{font-family:'Arial',sans-serif;max-width:800px;margin:0 auto;padding:0;color:#2d3748}
      .cre-header{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:40px;position:relative;overflow:hidden}
      .cre-header::before{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:rgba(255,255,255,.1);border-radius:50%}
      .cre-name{font-size:34px;font-weight:900;margin:0 0 6px;position:relative}
      .cre-title{font-size:14px;opacity:.9;margin:0 0 14px;text-transform:uppercase;letter-spacing:2px;position:relative}
      .cre-contact{display:flex;gap:16px;font-size:12px;opacity:.9;flex-wrap:wrap;position:relative}
      .cre-summary{color:rgba(255,255,255,.85);font-size:13px;margin-top:14px;line-height:1.6;position:relative}
      .cre-body{padding:36px}
      .cre-section{margin-bottom:24px}
      .cre-section-title{font-size:13px;font-weight:bold;color:#764ba2;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;padding-left:12px;border-left:4px solid #667eea}
      .cre-item{margin-bottom:14px;padding:14px;background:#f7f7ff;border-radius:8px}
      .cre-item-row{display:flex;justify-content:space-between;align-items:flex-start}
      .cre-sub{color:#718096;font-size:12px}
      .cre-date{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:2px 10px;border-radius:20px;font-size:11px}
      .cre-desc{color:#4a5568;font-size:12px;margin-top:6px;line-height:1.5}
      .cre-skills{display:flex;flex-wrap:wrap;gap:8px}
      .cre-skill{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:4px 14px;border-radius:20px;font-size:12px}
    </style>
    <div class="cre">
      <div class="cre-header">
        <div class="cre-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="cre-title">${cv.experience[0].position}</div>`:''}
        <div class="cre-contact">${cv.email?`<span>✉ ${cv.email}</span>`:''} ${cv.phone?`<span>📞 ${cv.phone}</span>`:''} ${cv.location?`<span>📍 ${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="cre-summary">${cv.summary}</div>`:''}
      </div>
      <div class="cre-body">${experience(cv,'cre')}${education(cv,'cre')}${skills(cv,'cre')}</div>
    </div>`,

  // 6. MINIMAL
  minimal: cv => `
    <style>
      .min{font-family:'Helvetica Neue',sans-serif;max-width:800px;margin:0 auto;padding:48px;color:#1a202c}
      .min-header{margin-bottom:36px}
      .min-name{font-size:36px;font-weight:300;margin:0 0 6px;letter-spacing:-1px}
      .min-title{font-size:14px;color:#718096;margin:0 0 12px}
      .min-contact{display:flex;gap:20px;font-size:12px;color:#a0aec0;flex-wrap:wrap}
      .min-summary{color:#4a5568;font-size:13px;line-height:1.8;margin-top:16px}
      .min-section{margin-bottom:28px}
      .min-section-title{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#a0aec0;margin-bottom:16px}
      .min-item{margin-bottom:16px;display:grid;grid-template-columns:1fr auto;gap:8px}
      .min-item-row{display:flex;justify-content:space-between}
      .min-sub{color:#718096;font-size:12px}
      .min-date{color:#cbd5e0;font-size:12px}
      .min-desc{color:#4a5568;font-size:12px;margin-top:5px;line-height:1.6;grid-column:1/-1}
      .min-skills{display:flex;flex-wrap:wrap;gap:8px}
      .min-skill{border:1px solid #e2e8f0;color:#4a5568;padding:3px 12px;border-radius:20px;font-size:12px}
    </style>
    <div class="min">
      <div class="min-header">
        <div class="min-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="min-title">${cv.experience[0].position}</div>`:''}
        <div class="min-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="min-summary">${cv.summary}</div>`:''}
      </div>
      ${experience(cv,'min')}${education(cv,'min')}${skills(cv,'min')}
    </div>`,

  // 7. EXECUTIVE (Liderlik)
  executive: cv => `
    <style>
      .exec{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:0;color:#1a202c}
      .exec-header{background:#2d3748;color:white;padding:40px;text-align:center}
      .exec-name{font-size:36px;font-weight:bold;margin:0 0 8px;letter-spacing:3px;text-transform:uppercase}
      .exec-title{font-size:13px;color:#a0aec0;margin:0 0 14px;letter-spacing:2px;text-transform:uppercase}
      .exec-contact{display:flex;justify-content:center;gap:20px;font-size:12px;color:#a0aec0;flex-wrap:wrap}
      .exec-body{padding:40px}
      .exec-summary{color:#4a5568;font-size:14px;line-height:1.8;margin-bottom:28px;text-align:justify;font-style:italic;border-left:4px solid #2d3748;padding-left:16px}
      .exec-section{margin-bottom:28px}
      .exec-section-title{font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#2d3748;margin-bottom:16px;text-align:center;position:relative}
      .exec-section-title::before,.exec-section-title::after{content:'——';color:#a0aec0;margin:0 8px}
      .exec-item{margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #edf2f7}
      .exec-item:last-child{border-bottom:none}
      .exec-item-row{display:flex;justify-content:space-between}
      .exec-sub{color:#718096;font-size:12px;font-style:italic}
      .exec-date{color:#a0aec0;font-size:12px}
      .exec-desc{color:#4a5568;font-size:13px;margin-top:6px;line-height:1.6}
      .exec-skills{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
      .exec-skill{background:#2d3748;color:white;padding:4px 16px;font-size:12px;letter-spacing:1px}
    </style>
    <div class="exec">
      <div class="exec-header">
        <div class="exec-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="exec-title">${cv.experience[0].position}</div>`:''}
        <div class="exec-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
      </div>
      <div class="exec-body">
        ${cv.summary?`<div class="exec-summary">${cv.summary}</div>`:''}
        ${experience(cv,'exec')}${education(cv,'exec')}${skills(cv,'exec')}
      </div>
    </div>`,

  // 8. TECH
  tech: cv => `
    <style>
      .tech{font-family:'Courier New',monospace;max-width:800px;margin:0 auto;padding:36px;background:#0d1117;color:#e6edf3}
      .tech-header{border:1px solid #30363d;padding:24px;border-radius:8px;margin-bottom:24px}
      .tech-name{font-size:28px;color:#58a6ff;margin:0 0 6px}
      .tech-title{font-size:13px;color:#8b949e;margin:0 0 12px}
      .tech-contact{display:flex;gap:16px;font-size:12px;color:#8b949e;flex-wrap:wrap}
      .tech-summary{color:#c9d1d9;font-size:12px;margin-top:12px;line-height:1.6}
      .tech-section{margin-bottom:20px}
      .tech-section-title{font-size:13px;font-weight:bold;color:#58a6ff;margin-bottom:12px}
      .tech-section-title::before{content:'// '}
      .tech-item{border-left:2px solid #30363d;padding-left:14px;margin-bottom:14px}
      .tech-item-row{display:flex;justify-content:space-between}
      .tech-sub{color:#8b949e;font-size:12px}
      .tech-date{color:#3fb950;font-size:11px}
      .tech-desc{color:#8b949e;font-size:12px;margin-top:5px;line-height:1.5}
      .tech-skills{display:flex;flex-wrap:wrap;gap:6px}
      .tech-skill{background:#161b22;color:#58a6ff;padding:3px 10px;border:1px solid #30363d;border-radius:4px;font-size:12px}
    </style>
    <div class="tech">
      <div class="tech-header">
        <div class="tech-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="tech-title">> ${cv.experience[0].position}</div>`:''}
        <div class="tech-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="tech-summary">${cv.summary}</div>`:''}
      </div>
      ${experience(cv,'tech')}${education(cv,'tech')}${skills(cv,'tech')}
    </div>`,

  // 9. ACADEMIC
  academic: cv => `
    <style>
      .acad{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:48px;color:#1a202c}
      .acad-header{text-align:center;border-bottom:2px solid #1a202c;padding-bottom:20px;margin-bottom:24px}
      .acad-name{font-size:30px;font-weight:bold;margin:0 0 6px;text-transform:uppercase;letter-spacing:2px}
      .acad-title{font-size:13px;color:#718096;margin:0 0 10px;font-style:italic}
      .acad-contact{display:flex;justify-content:center;gap:20px;font-size:12px;color:#4a5568;flex-wrap:wrap}
      .acad-summary{color:#4a5568;font-size:13px;line-height:1.8;margin-top:14px;text-align:justify}
      .acad-section{margin-bottom:22px}
      .acad-section-title{font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#1a202c;border-bottom:1px solid #1a202c;padding-bottom:4px;margin-bottom:14px}
      .acad-item{margin-bottom:14px;display:grid;grid-template-columns:80px 1fr;gap:8px}
      .acad-item-row{display:flex;justify-content:space-between}
      .acad-sub{color:#718096;font-size:12px;font-style:italic}
      .acad-date{color:#718096;font-size:12px;text-align:right}
      .acad-desc{color:#4a5568;font-size:12px;margin-top:5px;line-height:1.6;grid-column:2}
      .acad-skills{color:#4a5568;font-size:13px;line-height:1.8}
      .acad-skill{display:inline}
      .acad-skill:not(:last-child)::after{content:' • ';color:#a0aec0}
    </style>
    <div class="acad">
      <div class="acad-header">
        <div class="acad-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="acad-title">${cv.experience[0].position}</div>`:''}
        <div class="acad-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="acad-summary">${cv.summary}</div>`:''}
      </div>
      ${experience(cv,'acad')}${education(cv,'acad')}
      ${cv.skills?.length?`<div class="acad-section"><div class="acad-section-title">Beceriler</div><div class="acad-skills">${cv.skills.map(s=>`<span class="acad-skill">${s}</span>`).join('')}</div></div>`:''}
    </div>`,

  // 10. MEDICAL (Sağlık)
  medical: cv => `
    <style>
      .med{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:0;color:#1a202c}
      .med-header{background:#00b4d8;color:white;padding:36px;display:flex;gap:20px;align-items:center}
      .med-avatar{width:72px;height:72px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;flex-shrink:0;border:2px solid rgba(255,255,255,.5)}
      .med-name{font-size:26px;font-weight:bold;margin:0 0 4px}
      .med-title{font-size:13px;opacity:.9;margin:0 0 8px}
      .med-contact{display:flex;gap:14px;font-size:12px;opacity:.9;flex-wrap:wrap}
      .med-body{padding:32px}
      .med-summary{color:#4a5568;font-size:13px;line-height:1.7;margin-bottom:22px;padding:14px;background:#e0f7fa;border-radius:6px;border-left:4px solid #00b4d8}
      .med-section{margin-bottom:22px}
      .med-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#00b4d8;margin-bottom:12px}
      .med-item{margin-bottom:12px;padding:12px;border:1px solid #e2e8f0;border-radius:6px}
      .med-item-row{display:flex;justify-content:space-between}
      .med-sub{color:#718096;font-size:12px}
      .med-date{background:#00b4d8;color:white;padding:1px 8px;border-radius:10px;font-size:11px}
      .med-desc{color:#4a5568;font-size:12px;margin-top:5px;line-height:1.5}
      .med-skills{display:flex;flex-wrap:wrap;gap:6px}
      .med-skill{background:#e0f7fa;color:#00b4d8;padding:3px 12px;border-radius:20px;font-size:12px;border:1px solid #b2ebf2}
    </style>
    <div class="med">
      <div class="med-header">
        <div class="med-avatar">${cv.name?.charAt(0)||'M'}</div>
        <div><div class="med-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="med-title">${cv.experience[0].position}</div>`:''}<div class="med-contact">${cv.email?`<span>✉ ${cv.email}</span>`:''} ${cv.phone?`<span>📞 ${cv.phone}</span>`:''} ${cv.location?`<span>📍 ${cv.location}</span>`:''}</div></div>
      </div>
      <div class="med-body">
        ${cv.summary?`<div class="med-summary">${cv.summary}</div>`:''}
        ${experience(cv,'med')}${education(cv,'med')}${skills(cv,'med')}
      </div>
    </div>`,

  // 11. LEGAL (Hukuk)
  legal: cv => `
    <style>
      .leg{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:48px;color:#1a202c}
      .leg-header{border:2px solid #1a202c;padding:24px;margin-bottom:28px;text-align:center}
      .leg-name{font-size:28px;font-weight:bold;margin:0 0 6px;text-transform:uppercase;letter-spacing:3px}
      .leg-title{font-size:12px;color:#718096;margin:0 0 12px;text-transform:uppercase;letter-spacing:2px}
      .leg-contact{display:flex;justify-content:center;gap:20px;font-size:12px;color:#4a5568;flex-wrap:wrap}
      .leg-summary{color:#4a5568;font-size:13px;line-height:1.8;margin-top:14px;font-style:italic}
      .leg-section{margin-bottom:24px}
      .leg-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#1a202c;border-bottom:2px solid #1a202c;padding-bottom:5px;margin-bottom:14px}
      .leg-item{margin-bottom:14px;padding-bottom:14px;border-bottom:1px dotted #cbd5e0}
      .leg-item:last-child{border-bottom:none}
      .leg-item-row{display:flex;justify-content:space-between}
      .leg-sub{color:#718096;font-size:12px;font-style:italic}
      .leg-date{color:#a0aec0;font-size:12px}
      .leg-desc{color:#4a5568;font-size:12px;margin-top:6px;line-height:1.6}
      .leg-skills{display:flex;flex-wrap:wrap;gap:8px}
      .leg-skill{border:1px solid #1a202c;color:#1a202c;padding:3px 12px;font-size:12px}
    </style>
    <div class="leg">
      <div class="leg-header">
        <div class="leg-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="leg-title">${cv.experience[0].position}</div>`:''}
        <div class="leg-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="leg-summary">${cv.summary}</div>`:''}
      </div>
      ${experience(cv,'leg')}${education(cv,'leg')}${skills(cv,'leg')}
    </div>`,

  // 12. MODERN DARK
  'modern-dark': cv => `
    <style>
      .md{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:0;background:#1e1e2e;color:#cdd6f4}
      .md-header{background:#313244;padding:36px;border-bottom:3px solid #89b4fa}
      .md-name{font-size:30px;font-weight:bold;color:#89b4fa;margin:0 0 6px}
      .md-title{font-size:13px;color:#a6adc8;margin:0 0 12px}
      .md-contact{display:flex;gap:16px;font-size:12px;color:#a6adc8;flex-wrap:wrap}
      .md-summary{color:#cdd6f4;font-size:13px;margin-top:12px;line-height:1.6}
      .md-body{padding:32px}
      .md-section{margin-bottom:22px}
      .md-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#89b4fa;margin-bottom:12px}
      .md-item{border-left:2px solid #89b4fa;padding-left:14px;margin-bottom:14px}
      .md-item-row{display:flex;justify-content:space-between}
      .md-sub{color:#a6adc8;font-size:12px}
      .md-date{color:#a6e3a1;font-size:11px}
      .md-desc{color:#cdd6f4;font-size:12px;margin-top:5px;line-height:1.5}
      .md-skills{display:flex;flex-wrap:wrap;gap:6px}
      .md-skill{background:#313244;color:#89b4fa;padding:3px 10px;border:1px solid #89b4fa;border-radius:4px;font-size:12px}
    </style>
    <div class="md">
      <div class="md-header">
        <div class="md-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="md-title">${cv.experience[0].position}</div>`:''}
        <div class="md-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="md-summary">${cv.summary}</div>`:''}
      </div>
      <div class="md-body">${experience(cv,'md')}${education(cv,'md')}${skills(cv,'md')}</div>
    </div>`,

  // 13. PASTEL
  pastel: cv => `
    <style>
      .pas{font-family:'Arial',sans-serif;max-width:800px;margin:0 auto;padding:40px;background:#fef9f0;color:#5d4037}
      .pas-header{text-align:center;margin-bottom:28px}
      .pas-name{font-size:32px;font-weight:bold;color:#5d4037;margin:0 0 6px}
      .pas-title{font-size:14px;color:#8d6e63;margin:0 0 12px}
      .pas-contact{display:flex;justify-content:center;gap:16px;font-size:12px;color:#8d6e63;flex-wrap:wrap}
      .pas-summary{color:#6d4c41;font-size:13px;line-height:1.7;margin-top:14px}
      .pas-section{margin-bottom:22px}
      .pas-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#ff7043;margin-bottom:12px;padding-bottom:5px;border-bottom:2px dashed #ffccbc}
      .pas-item{margin-bottom:14px;padding:12px;background:white;border-radius:8px;border:1px solid #ffccbc}
      .pas-item-row{display:flex;justify-content:space-between}
      .pas-sub{color:#8d6e63;font-size:12px}
      .pas-date{background:#ffccbc;color:#bf360c;padding:2px 8px;border-radius:10px;font-size:11px}
      .pas-desc{color:#6d4c41;font-size:12px;margin-top:5px;line-height:1.5}
      .pas-skills{display:flex;flex-wrap:wrap;gap:8px}
      .pas-skill{background:#ffccbc;color:#bf360c;padding:4px 12px;border-radius:20px;font-size:12px}
    </style>
    <div class="pas">
      <div class="pas-header">
        <div class="pas-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="pas-title">${cv.experience[0].position}</div>`:''}
        <div class="pas-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="pas-summary">${cv.summary}</div>`:''}
      </div>
      ${experience(cv,'pas')}${education(cv,'pas')}${skills(cv,'pas')}
    </div>`,

  // 14. BOLD
  bold: cv => `
    <style>
      .bld{font-family:'Arial Black',sans-serif;max-width:800px;margin:0 auto;padding:0;color:#1a202c}
      .bld-header{background:#e53e3e;color:white;padding:36px}
      .bld-name{font-size:38px;font-weight:900;margin:0 0 6px;text-transform:uppercase}
      .bld-title{font-size:14px;margin:0 0 12px;font-weight:bold;opacity:.9}
      .bld-contact{display:flex;gap:16px;font-size:12px;opacity:.9;flex-wrap:wrap}
      .bld-summary{color:rgba(255,255,255,.85);font-size:13px;margin-top:12px;line-height:1.6}
      .bld-body{padding:32px}
      .bld-section{margin-bottom:22px}
      .bld-section-title{font-size:14px;font-weight:900;text-transform:uppercase;color:#e53e3e;margin-bottom:12px;letter-spacing:1px}
      .bld-item{margin-bottom:14px;border-left:4px solid #e53e3e;padding-left:14px}
      .bld-item-row{display:flex;justify-content:space-between}
      .bld-sub{color:#718096;font-size:12px}
      .bld-date{background:#e53e3e;color:white;padding:2px 8px;font-size:11px;font-weight:bold}
      .bld-desc{color:#4a5568;font-size:12px;margin-top:5px;line-height:1.5}
      .bld-skills{display:flex;flex-wrap:wrap;gap:6px}
      .bld-skill{background:#e53e3e;color:white;padding:4px 12px;font-size:12px;font-weight:bold}
    </style>
    <div class="bld">
      <div class="bld-header">
        <div class="bld-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="bld-title">${cv.experience[0].position}</div>`:''}
        <div class="bld-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="bld-summary">${cv.summary}</div>`:''}
      </div>
      <div class="bld-body">${experience(cv,'bld')}${education(cv,'bld')}${skills(cv,'bld')}</div>
    </div>`,

  // 15. NATURE
  nature: cv => `
    <style>
      .nat{font-family:Georgia,sans-serif;max-width:800px;margin:0 auto;padding:40px;background:#f0fff4;color:#1a4731}
      .nat-header{border-bottom:2px solid #38a169;padding-bottom:20px;margin-bottom:24px}
      .nat-name{font-size:32px;color:#276749;margin:0 0 6px;font-weight:bold}
      .nat-title{font-size:14px;color:#68d391;margin:0 0 10px}
      .nat-contact{display:flex;gap:16px;font-size:12px;color:#48bb78;flex-wrap:wrap}
      .nat-summary{color:#276749;font-size:13px;line-height:1.7;margin-top:14px}
      .nat-section{margin-bottom:22px}
      .nat-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#276749;margin-bottom:12px;padding-bottom:5px;border-bottom:2px solid #68d391}
      .nat-item{margin-bottom:14px;padding:12px;background:white;border-radius:8px;border-left:4px solid #38a169}
      .nat-item-row{display:flex;justify-content:space-between}
      .nat-sub{color:#48bb78;font-size:12px}
      .nat-date{background:#38a169;color:white;padding:2px 8px;border-radius:10px;font-size:11px}
      .nat-desc{color:#276749;font-size:12px;margin-top:5px;line-height:1.5}
      .nat-skills{display:flex;flex-wrap:wrap;gap:8px}
      .nat-skill{background:#c6f6d5;color:#276749;padding:4px 12px;border-radius:20px;font-size:12px;border:1px solid #68d391}
    </style>
    <div class="nat">
      <div class="nat-header">
        <div class="nat-name">${cv.name||''}</div>
        ${cv.experience?.[0]?`<div class="nat-title">${cv.experience[0].position}</div>`:''}
        <div class="nat-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>
        ${cv.summary?`<div class="nat-summary">${cv.summary}</div>`:''}
      </div>
      ${experience(cv,'nat')}${education(cv,'nat')}${skills(cv,'nat')}
    </div>`,

  // 16-30 more templates
  'navy': cv => `<style>.nv{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#fff;color:#1b2a4a}.nv-header{background:#1b2a4a;color:white;padding:36px}.nv-name{font-size:30px;font-weight:bold;margin:0 0 5px;letter-spacing:1px}.nv-title{font-size:13px;color:#90a4c9;margin:0 0 10px}.nv-contact{display:flex;gap:14px;font-size:12px;color:#90a4c9;flex-wrap:wrap}.nv-summary{color:rgba(255,255,255,.8);font-size:12px;margin-top:12px;line-height:1.6}.nv-body{padding:32px}.nv-section{margin-bottom:20px}.nv-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#1b2a4a;border-bottom:2px solid #1b2a4a;padding-bottom:5px;margin-bottom:12px}.nv-item{margin-bottom:12px}.nv-item-row{display:flex;justify-content:space-between}.nv-sub{color:#718096;font-size:12px}.nv-date{background:#1b2a4a;color:white;padding:2px 8px;font-size:11px;border-radius:3px}.nv-desc{color:#4a5568;font-size:12px;margin-top:4px;line-height:1.5}.nv-skills{display:flex;flex-wrap:wrap;gap:6px}.nv-skill{background:#e8edf5;color:#1b2a4a;padding:3px 10px;border-radius:3px;font-size:12px}</style><div class="nv"><div class="nv-header"><div class="nv-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="nv-title">${cv.experience[0].position}</div>`:''}<div class="nv-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="nv-summary">${cv.summary}</div>`:''}</div><div class="nv-body">${experience(cv,'nv')}${education(cv,'nv')}${skills(cv,'nv')}</div></div>`,

  'teal': cv => `<style>.tl{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#fff;color:#1a202c}.tl-header{background:linear-gradient(135deg,#0d9488,#0891b2);color:white;padding:36px}.tl-name{font-size:30px;font-weight:bold;margin:0 0 5px}.tl-title{font-size:13px;opacity:.9;margin:0 0 10px}.tl-contact{display:flex;gap:14px;font-size:12px;opacity:.9;flex-wrap:wrap}.tl-summary{color:rgba(255,255,255,.85);font-size:12px;margin-top:12px;line-height:1.6}.tl-body{padding:32px}.tl-section{margin-bottom:20px}.tl-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#0d9488;border-bottom:2px solid #0d9488;padding-bottom:5px;margin-bottom:12px}.tl-item{margin-bottom:12px;padding-left:12px;border-left:3px solid #0d9488}.tl-item-row{display:flex;justify-content:space-between}.tl-sub{color:#718096;font-size:12px}.tl-date{color:#0d9488;font-size:11px}.tl-desc{color:#4a5568;font-size:12px;margin-top:4px;line-height:1.5}.tl-skills{display:flex;flex-wrap:wrap;gap:6px}.tl-skill{background:#ccfbf1;color:#0d9488;padding:3px 10px;border-radius:20px;font-size:12px}</style><div class="tl"><div class="tl-header"><div class="tl-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="tl-title">${cv.experience[0].position}</div>`:''}<div class="tl-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="tl-summary">${cv.summary}</div>`:''}</div><div class="tl-body">${experience(cv,'tl')}${education(cv,'tl')}${skills(cv,'tl')}</div></div>`,

  'rose': cv => `<style>.ros{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#fff5f5;color:#1a202c}.ros-header{background:linear-gradient(135deg,#e53e3e,#d53f8c);color:white;padding:36px}.ros-name{font-size:30px;font-weight:bold;margin:0 0 5px}.ros-title{font-size:13px;opacity:.9;margin:0 0 10px}.ros-contact{display:flex;gap:14px;font-size:12px;opacity:.9;flex-wrap:wrap}.ros-summary{color:rgba(255,255,255,.85);font-size:12px;margin-top:12px;line-height:1.6}.ros-body{padding:32px}.ros-section{margin-bottom:20px}.ros-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#e53e3e;border-bottom:2px solid #fed7d7;padding-bottom:5px;margin-bottom:12px}.ros-item{margin-bottom:12px;padding:12px;background:white;border-radius:8px;border-left:4px solid #e53e3e}.ros-item-row{display:flex;justify-content:space-between}.ros-sub{color:#718096;font-size:12px}.ros-date{background:#fed7d7;color:#e53e3e;padding:2px 8px;border-radius:10px;font-size:11px}.ros-desc{color:#4a5568;font-size:12px;margin-top:4px;line-height:1.5}.ros-skills{display:flex;flex-wrap:wrap;gap:6px}.ros-skill{background:#fed7d7;color:#e53e3e;padding:3px 10px;border-radius:20px;font-size:12px}</style><div class="ros"><div class="ros-header"><div class="ros-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="ros-title">${cv.experience[0].position}</div>`:''}<div class="ros-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="ros-summary">${cv.summary}</div>`:''}</div><div class="ros-body">${experience(cv,'ros')}${education(cv,'ros')}${skills(cv,'ros')}</div></div>`,

  'gold': cv => `<style>.gld{font-family:Georgia,serif;max-width:800px;margin:0 auto;background:#fffdf0;color:#1a202c}.gld-header{background:#92400e;color:white;padding:36px;text-align:center}.gld-name{font-size:30px;font-weight:bold;margin:0 0 5px;letter-spacing:2px}.gld-title{font-size:13px;color:#fcd34d;margin:0 0 10px;text-transform:uppercase;letter-spacing:1px}.gld-contact{display:flex;justify-content:center;gap:14px;font-size:12px;color:#fde68a;flex-wrap:wrap}.gld-summary{color:rgba(255,255,255,.85);font-size:12px;margin-top:12px;line-height:1.6}.gld-body{padding:32px}.gld-section{margin-bottom:20px}.gld-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#92400e;border-bottom:2px solid #fcd34d;padding-bottom:5px;margin-bottom:12px}.gld-item{margin-bottom:12px;padding:12px;background:white;border-radius:4px;border-left:4px solid #f59e0b}.gld-item-row{display:flex;justify-content:space-between}.gld-sub{color:#718096;font-size:12px}.gld-date{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:3px;font-size:11px}.gld-desc{color:#4a5568;font-size:12px;margin-top:4px;line-height:1.5}.gld-skills{display:flex;flex-wrap:wrap;gap:6px}.gld-skill{background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:3px;font-size:12px;border:1px solid #fcd34d}</style><div class="gld"><div class="gld-header"><div class="gld-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="gld-title">${cv.experience[0].position}</div>`:''}<div class="gld-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="gld-summary">${cv.summary}</div>`:''}</div><div class="gld-body">${experience(cv,'gld')}${education(cv,'gld')}${skills(cv,'gld')}</div></div>`,

  'indigo': cv => `<style>.ind{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#fff;color:#1a202c}.ind-header{background:#4338ca;color:white;padding:36px}.ind-name{font-size:30px;font-weight:bold;margin:0 0 5px}.ind-title{font-size:13px;opacity:.9;margin:0 0 10px}.ind-contact{display:flex;gap:14px;font-size:12px;opacity:.9;flex-wrap:wrap}.ind-summary{color:rgba(255,255,255,.85);font-size:12px;margin-top:12px;line-height:1.6}.ind-body{padding:32px}.ind-section{margin-bottom:20px}.ind-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#4338ca;border-bottom:2px solid #e0e7ff;padding-bottom:5px;margin-bottom:12px}.ind-item{margin-bottom:12px;padding-left:12px;border-left:3px solid #4338ca}.ind-item-row{display:flex;justify-content:space-between}.ind-sub{color:#718096;font-size:12px}.ind-date{background:#e0e7ff;color:#4338ca;padding:2px 8px;border-radius:10px;font-size:11px}.ind-desc{color:#4a5568;font-size:12px;margin-top:4px;line-height:1.5}.ind-skills{display:flex;flex-wrap:wrap;gap:6px}.ind-skill{background:#e0e7ff;color:#4338ca;padding:3px 10px;border-radius:20px;font-size:12px}</style><div class="ind"><div class="ind-header"><div class="ind-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="ind-title">${cv.experience[0].position}</div>`:''}<div class="ind-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="ind-summary">${cv.summary}</div>`:''}</div><div class="ind-body">${experience(cv,'ind')}${education(cv,'ind')}${skills(cv,'ind')}</div></div>`,

  'slate': cv => `<style>.slt{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#f8fafc;color:#0f172a}.slt-header{background:#0f172a;color:white;padding:36px;display:grid;grid-template-columns:1fr auto;gap:20px}.slt-name{font-size:28px;font-weight:bold;margin:0 0 5px}.slt-title{font-size:13px;color:#94a3b8;margin:0}.slt-contact{text-align:right;font-size:12px;color:#94a3b8;line-height:1.8}.slt-summary{grid-column:1/-1;color:rgba(255,255,255,.75);font-size:12px;margin-top:12px;line-height:1.6}.slt-body{padding:32px}.slt-section{margin-bottom:20px}.slt-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#475569;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-bottom:12px}.slt-item{margin-bottom:12px;background:white;padding:12px;border-radius:6px;border:1px solid #e2e8f0}.slt-item-row{display:flex;justify-content:space-between}.slt-sub{color:#64748b;font-size:12px}.slt-date{background:#0f172a;color:white;padding:2px 8px;border-radius:3px;font-size:11px}.slt-desc{color:#475569;font-size:12px;margin-top:4px;line-height:1.5}.slt-skills{display:flex;flex-wrap:wrap;gap:6px}.slt-skill{background:#e2e8f0;color:#0f172a;padding:3px 10px;border-radius:4px;font-size:12px}</style><div class="slt"><div class="slt-header"><div><div class="slt-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="slt-title">${cv.experience[0].position}</div>`:''}</div><div class="slt-contact">${cv.email?`<div>${cv.email}</div>`:''} ${cv.phone?`<div>${cv.phone}</div>`:''} ${cv.location?`<div>${cv.location}</div>`:''}</div>${cv.summary?`<div class="slt-summary">${cv.summary}</div>`:''}</div><div class="slt-body">${experience(cv,'slt')}${education(cv,'slt')}${skills(cv,'slt')}</div></div>`,

  'orange': cv => `<style>.org{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#fff;color:#1a202c}.org-header{background:#ea580c;color:white;padding:36px}.org-name{font-size:30px;font-weight:bold;margin:0 0 5px}.org-title{font-size:13px;opacity:.9;margin:0 0 10px}.org-contact{display:flex;gap:14px;font-size:12px;opacity:.9;flex-wrap:wrap}.org-summary{color:rgba(255,255,255,.85);font-size:12px;margin-top:12px;line-height:1.6}.org-body{padding:32px}.org-section{margin-bottom:20px}.org-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#ea580c;border-bottom:2px solid #fed7aa;padding-bottom:5px;margin-bottom:12px}.org-item{margin-bottom:12px;padding-left:12px;border-left:3px solid #ea580c}.org-item-row{display:flex;justify-content:space-between}.org-sub{color:#718096;font-size:12px}.org-date{background:#fed7aa;color:#ea580c;padding:2px 8px;border-radius:10px;font-size:11px}.org-desc{color:#4a5568;font-size:12px;margin-top:4px;line-height:1.5}.org-skills{display:flex;flex-wrap:wrap;gap:6px}.org-skill{background:#fed7aa;color:#ea580c;padding:3px 10px;border-radius:20px;font-size:12px}</style><div class="org"><div class="org-header"><div class="org-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="org-title">${cv.experience[0].position}</div>`:''}<div class="org-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="org-summary">${cv.summary}</div>`:''}</div><div class="org-body">${experience(cv,'org')}${education(cv,'org')}${skills(cv,'org')}</div></div>`,

  'zen': cv => `<style>.zen{font-family:'Georgia',serif;max-width:800px;margin:0 auto;padding:48px;background:white;color:#2d3748}.zen-header{margin-bottom:36px}.zen-name{font-size:40px;font-weight:300;margin:0 0 4px;color:#1a202c}.zen-line{height:2px;background:linear-gradient(to right,#1a202c,transparent);margin-bottom:12px;width:60px}.zen-title{font-size:14px;color:#a0aec0;margin:0 0 10px;letter-spacing:1px}.zen-contact{display:flex;gap:20px;font-size:12px;color:#a0aec0;flex-wrap:wrap}.zen-summary{color:#4a5568;font-size:13px;line-height:1.9;margin-top:16px;border-left:2px solid #e2e8f0;padding-left:14px}.zen-section{margin-bottom:28px}.zen-section-title{font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:4px;color:#a0aec0;margin-bottom:14px}.zen-item{margin-bottom:16px}.zen-item-row{display:flex;justify-content:space-between;align-items:baseline}.zen-sub{color:#a0aec0;font-size:12px}.zen-date{color:#cbd5e0;font-size:11px}.zen-desc{color:#4a5568;font-size:12px;margin-top:6px;line-height:1.7}.zen-skills{display:flex;flex-wrap:wrap;gap:10px}.zen-skill{color:#4a5568;font-size:12px;padding:2px 0;border-bottom:1px solid #e2e8f0}</style><div class="zen"><div class="zen-header"><div class="zen-name">${cv.name||''}</div><div class="zen-line"></div>${cv.experience?.[0]?`<div class="zen-title">${cv.experience[0].position}</div>`:''}<div class="zen-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="zen-summary">${cv.summary}</div>`:''}</div>${experience(cv,'zen')}${education(cv,'zen')}${skills(cv,'zen')}</div>`,

  'swiss': cv => `<style>.sw{font-family:Helvetica,Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;background:white;color:#000}.sw-header{display:grid;grid-template-columns:1fr 1fr;gap:20px;border-bottom:3px solid #000;padding-bottom:20px;margin-bottom:24px}.sw-name{font-size:36px;font-weight:900;margin:0;text-transform:uppercase;letter-spacing:-1px}.sw-title{font-size:13px;color:#666;margin:4px 0 0}.sw-contact{text-align:right;font-size:12px;color:#666;line-height:1.8}.sw-summary{grid-column:1/-1;font-size:13px;color:#333;line-height:1.6;margin-top:12px}.sw-section{margin-bottom:22px}.sw-section-title{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:3px;color:#000;margin-bottom:10px}.sw-item{margin-bottom:12px;display:grid;grid-template-columns:100px 1fr;gap:8px}.sw-date{font-size:11px;color:#999;padding-top:2px}.sw-item-body{}.sw-sub{color:#666;font-size:12px}.sw-desc{color:#333;font-size:12px;margin-top:4px;line-height:1.5}.sw-skills{display:flex;flex-wrap:wrap;gap:6px}.sw-skill{border:1px solid #000;color:#000;padding:2px 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px}</style><div class="sw"><div class="sw-header"><div><div class="sw-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="sw-title">${cv.experience[0].position}</div>`:''}</div><div class="sw-contact">${cv.email?`<div>${cv.email}</div>`:''} ${cv.phone?`<div>${cv.phone}</div>`:''} ${cv.location?`<div>${cv.location}</div>`:''}</div>${cv.summary?`<div class="sw-summary">${cv.summary}</div>`:''}</div>${cv.experience?.length?`<div class="sw-section"><div class="sw-section-title">Deneyim</div>${cv.experience.map(exp=>`<div class="sw-item"><div class="sw-date">${exp.duration}</div><div class="sw-item-body"><strong>${exp.position}</strong><div class="sw-sub">${exp.company}</div>${exp.description?`<div class="sw-desc">${exp.description}</div>`:''}</div></div>`).join('')}</div>`:''}${cv.education?.length?`<div class="sw-section"><div class="sw-section-title">Eğitim</div>${cv.education.map(edu=>`<div class="sw-item"><div class="sw-date">${edu.year}</div><div class="sw-item-body"><strong>${edu.school}</strong><div class="sw-sub">${edu.degree}</div></div></div>`).join('')}</div>`:''}${cv.skills?.length?`<div class="sw-section"><div class="sw-section-title">Beceriler</div><div class="sw-skills">${cv.skills.map(s=>`<span class="sw-skill">${s}</span>`).join('')}</div></div>`:''}</div>`,

  'retro': cv => `<style>.ret{font-family:'Courier New',monospace;max-width:800px;margin:0 auto;padding:40px;background:#faf8f4;color:#2d2d2d;border:2px solid #2d2d2d}.ret-header{text-align:center;border-bottom:2px dashed #2d2d2d;padding-bottom:20px;margin-bottom:24px}.ret-name{font-size:32px;font-weight:bold;margin:0 0 6px;text-transform:uppercase;letter-spacing:4px}.ret-title{font-size:13px;color:#666;margin:0 0 10px}.ret-contact{display:flex;justify-content:center;gap:16px;font-size:12px;color:#666;flex-wrap:wrap}.ret-summary{color:#444;font-size:12px;line-height:1.7;margin-top:14px;font-style:italic}.ret-section{margin-bottom:22px}.ret-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#2d2d2d;border-top:1px dashed #2d2d2d;border-bottom:1px dashed #2d2d2d;padding:5px 0;margin-bottom:12px;text-align:center}.ret-item{margin-bottom:12px}.ret-item-row{display:flex;justify-content:space-between}.ret-sub{color:#666;font-size:12px}.ret-date{color:#888;font-size:12px}.ret-desc{color:#444;font-size:12px;margin-top:4px;line-height:1.5}.ret-skills{display:flex;flex-wrap:wrap;gap:6px}.ret-skill{border:1px dashed #2d2d2d;color:#2d2d2d;padding:2px 10px;font-size:12px}</style><div class="ret"><div class="ret-header"><div class="ret-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="ret-title">${cv.experience[0].position}</div>`:''}<div class="ret-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="ret-summary">${cv.summary}</div>`:''}</div>${experience(cv,'ret')}${education(cv,'ret')}${skills(cv,'ret')}</div>`,

  'purple-rain': cv => `<style>.pr{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;background:#fff;color:#1a202c}.pr-header{background:linear-gradient(135deg,#6b21a8,#4c1d95);color:white;padding:36px}.pr-name{font-size:30px;font-weight:bold;margin:0 0 5px}.pr-title{font-size:13px;opacity:.9;margin:0 0 10px}.pr-contact{display:flex;gap:14px;font-size:12px;opacity:.9;flex-wrap:wrap}.pr-summary{color:rgba(255,255,255,.85);font-size:12px;margin-top:12px;line-height:1.6}.pr-body{padding:32px}.pr-section{margin-bottom:20px}.pr-section-title{font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#6b21a8;border-bottom:2px solid #e9d5ff;padding-bottom:5px;margin-bottom:12px}.pr-item{margin-bottom:12px;padding-left:12px;border-left:3px solid #6b21a8}.pr-item-row{display:flex;justify-content:space-between}.pr-sub{color:#718096;font-size:12px}.pr-date{background:#e9d5ff;color:#6b21a8;padding:2px 8px;border-radius:10px;font-size:11px}.pr-desc{color:#4a5568;font-size:12px;margin-top:4px;line-height:1.5}.pr-skills{display:flex;flex-wrap:wrap;gap:6px}.pr-skill{background:#e9d5ff;color:#6b21a8;padding:3px 10px;border-radius:20px;font-size:12px}</style><div class="pr"><div class="pr-header"><div class="pr-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="pr-title">${cv.experience[0].position}</div>`:''}<div class="pr-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="pr-summary">${cv.summary}</div>`:''}</div><div class="pr-body">${experience(cv,'pr')}${education(cv,'pr')}${skills(cv,'pr')}</div></div>`,

  'timeline-pro': cv => `<style>.tp{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;background:#fff;color:#1a202c}.tp-header{margin-bottom:28px;padding-bottom:20px;border-bottom:3px solid #f59e0b}.tp-name{font-size:32px;font-weight:bold;color:#1a202c;margin:0 0 5px}.tp-title{font-size:14px;color:#f59e0b;margin:0 0 10px;font-weight:bold}.tp-contact{display:flex;gap:16px;font-size:12px;color:#718096;flex-wrap:wrap}.tp-summary{color:#4a5568;font-size:13px;line-height:1.7;margin-top:14px}.tp-section{margin-bottom:24px}.tp-section-title{font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:#1a202c;margin-bottom:16px}.tp-timeline{position:relative;padding-left:24px}.tp-timeline::before{content:'';position:absolute;left:6px;top:0;bottom:0;width:2px;background:#f59e0b}.tp-item{position:relative;margin-bottom:18px}.tp-dot{position:absolute;left:-22px;top:4px;width:12px;height:12px;background:#f59e0b;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px #f59e0b}.tp-item-row{display:flex;justify-content:space-between}.tp-sub{color:#718096;font-size:12px}.tp-date{background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:3px;font-size:11px}.tp-desc{color:#4a5568;font-size:12px;margin-top:5px;line-height:1.5}.tp-skills{display:flex;flex-wrap:wrap;gap:8px}.tp-skill{background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:4px;font-size:12px;border:1px solid #fcd34d}</style><div class="tp"><div class="tp-header"><div class="tp-name">${cv.name||''}</div>${cv.experience?.[0]?`<div class="tp-title">${cv.experience[0].position}</div>`:''}<div class="tp-contact">${cv.email?`<span>${cv.email}</span>`:''} ${cv.phone?`<span>${cv.phone}</span>`:''} ${cv.location?`<span>${cv.location}</span>`:''}</div>${cv.summary?`<div class="tp-summary">${cv.summary}</div>`:''}</div>${cv.experience?.length?`<div class="tp-section"><div class="tp-section-title">Deneyim</div><div class="tp-timeline">${cv.experience.map(exp=>`<div class="tp-item"><div class="tp-dot"></div><div class="tp-item-row"><div><strong>${exp.position}</strong><div class="tp-sub">${exp.company}</div></div><span class="tp-date">${exp.duration}</span></div>${exp.description?`<div class="tp-desc">${exp.description}</div>`:''}</div>`).join('')}</div></div>`:''}${education(cv,'tp')}${skills(cv,'tp')}</div>`,
}