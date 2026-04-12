const handleDownloadPDF = () => {
  const element = document.getElementById('cv-preview')
  if (!element) return alert('CV önizlemesi bulunamadı. Önce CV oluşturun.')

  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(r => r.cssText).join('\n')
      } catch { return '' }
    })
    .join('\n')

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${previewData.name || 'CV'} - Resumind</title>
        <style>
          ${styles}
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; background: white; }
          @page { margin: 0; size: A4; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print()
              window.close()
            }, 500)
          }
        </script>
      </body>
    </html>
  `)
  win.document.close()
}
