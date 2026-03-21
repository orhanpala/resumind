export async function POST(request) {
  try {
    const { cvData, theme } = await request.json()

    const resumeJson = {
      basics: {
        name: cvData.name || '',
        label: cvData.experience?.[0]?.position || '',
        email: cvData.email || '',
        phone: cvData.phone || '',
        location: { city: cvData.location || '' },
        summary: cvData.summary || '',
      },
      work: cvData.experience?.map(exp => ({
        company: exp.company || '',
        position: exp.position || '',
        startDate: '',
        endDate: exp.duration || '',
        summary: exp.description || '',
      })) || [],
      education: cvData.education?.map(edu => ({
        institution: edu.school || '',
        area: edu.degree || '',
        studyType: '',
        endDate: edu.year || '',
      })) || [],
      skills: cvData.skills?.map(skill => ({
        name: skill,
        keywords: [],
      })) || [],
    }

    let themeModule
    if (theme === 'elegant') {
      themeModule = await import('jsonresume-theme-elegant')
    } else if (theme === 'flat') {
      themeModule = await import('jsonresume-theme-flat')
    } else if (theme === 'stackoverflow') {
      themeModule = await import('jsonresume-theme-stackoverflow')
    } else {
      themeModule = await import('jsonresume-theme-elegant')
    }

    const html = themeModule.render(resumeJson)

    return Response.json({ success: true, html })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}