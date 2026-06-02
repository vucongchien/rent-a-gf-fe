import { http, HttpResponse, delay } from 'msw'
import { companions } from '../fixtures/data'

export const companionHandlers = [
  // GET /api/companions — list với filter + pagination
  http.get('/api/companions', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 6

    let items = companions
    if (city) items = items.filter(c => c.city === city)

    const start = (page - 1) * limit
    const sliced = items.slice(start, start + limit)

    return HttpResponse.json({
      data: {
        items: sliced.map(c => ({
          id: c.id,
          displayName: c.displayName,
          avatarUrl: c.avatarUrl,
          city: c.city,
          ratingAvg: c.ratingAvg,
          reviewCount: c.reviewCount,
          featuredScenario: c.featuredScenario,
          voiceIntroUrl: c.voiceIntroUrl,
        })),
        meta: {
          page,
          limit,
          total: items.length,
          hasNextPage: start + limit < items.length,
        },
      },
    })
  }),

  // GET /api/companions/:id — chi tiết
  http.get('/api/companions/:companionId', async ({ params }) => {
    await delay(500)
    const companion = companions.find(c => c.id === params.companionId)
    if (!companion) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Không tìm thấy companion' } },
        { status: 404 }
      )
    }
    return HttpResponse.json({ data: companion })
  }),
]
