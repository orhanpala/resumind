export async function GET(request) {
  try {
    const clientEmail = process.env.GA_CLIENT_EMAIL
    const privateKey = process.env.GA_PRIVATE_KEY
    const propertyId = process.env.GA_PROPERTY_ID

    if (!clientEmail) return Response.json({ error: 'GA_CLIENT_EMAIL eksik' })
    if (!privateKey) return Response.json({ error: 'GA_PRIVATE_KEY eksik' })
    if (!propertyId) return Response.json({ error: 'GA_PROPERTY_ID eksik' })

    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      }
    })

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
    })

    return Response.json({ success: true, data: { activeUsers: response?.rows?.[0]?.metricValues?.[0]?.value || '0' } })
  } catch (error) {
    return Response.json({ success: false, error: error.message, stack: error.stack })
  }
}