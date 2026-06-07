import { http, HttpResponse, delay } from 'msw'
import { companions } from '../fixtures/data'

export const companionHandlers = [
  // GET /api/companions — list với filter + cursor-based pagination
  http.get('/api/companions', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const cursor = url.searchParams.get('cursor')
    const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 6

    let items = companions
    if (city && city !== 'all') {
      items = items.filter(c => c.city === city)
    }

    let startIndex = 0
    if (cursor) {
      const idx = items.findIndex(c => c.id === cursor)
      if (idx !== -1) {
        startIndex = idx + 1
      }
    }

    const sliced = items.slice(startIndex, startIndex + limit)
    const hasNextPage = startIndex + limit < items.length
    const nextCursor = hasNextPage && sliced.length > 0 ? sliced[sliced.length - 1].id : null

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
          metadata: c.metadata || [],
        })),
        meta: {
          cursor,
          limit,
          total: items.length,
          nextCursor,
          hasNextPage,
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
