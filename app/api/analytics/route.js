import { BetaAnalyticsDataClient } from '@google-analytics/data'

const propertyId = process.env.GA_PROPERTY_ID

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return Response.json({ error: 'Yetkisiz' }, { status: 401 })

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }
    })

    const [activeUsers, pageViews, topPages, deviceTypes, countries] = await Promise.all([
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'activeUsers' }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
      }),
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ])

    return Response.json({
      success: true,
      data: {
        activeUsers: activeUsers[0]?.rows?.[0]?.metricValues?.[0]?.value || '0',
        dailyStats: pageViews[0]?.rows?.map(row => ({
          date: row.dimensionValues[0].value,
          pageViews: row.metricValues[0].value,
          sessions: row.metricValues[1].value,
        })) || [],
        topPages: topPages[0]?.rows?.map(row => ({
          page: row.dimensionValues[0].value,
          views: row.metricValues[0].value,
        })) || [],
        devices: deviceTypes[0]?.rows?.map(row => ({
          device: row.dimensionValues[0].value,
          sessions: row.metricValues[0].value,
        })) || [],
        countries: countries[0]?.rows?.map(row => ({
          country: row.dimensionValues[0].value,
          sessions: row.metricValues[0].value,
        })) || [],
      }
    })
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
