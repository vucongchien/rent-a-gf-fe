import { http, HttpResponse, delay } from 'msw'
import { companions, currentMockUser } from '../fixtures/data'
import type { CreateScenarioBody, UpdateScenarioBody } from '@/shared/types/companion'

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

  // POST /api/companions/apply
  http.post('/api/companions/apply', async () => {
    await delay(600)
    if (!currentMockUser) {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' } }, { status: 401 })
    }
    currentMockUser.companionApplicationStatus = 'pending'
    return HttpResponse.json({ data: { status: 'pending' } })
  }),

  // GET /api/companions/me
  http.get('/api/companions/me', async () => {
    await delay(500)
    if (!currentMockUser || currentMockUser.role !== 'companion') {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Không có quyền truy cập' } }, { status: 401 })
    }
    const companion = companions.find(c => c.id === currentMockUser.id) || companions[0] 
    return HttpResponse.json({ data: companion })
  }),

  // PUT /api/companions/me
  http.put('/api/companions/me', async ({ request }) => {
    await delay(600)
    if (!currentMockUser || currentMockUser.role !== 'companion') {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Không có quyền truy cập' } }, { status: 401 })
    }
    const body = await request.json() as any
    const idx = companions.findIndex(c => c.id === currentMockUser.id)
    if (idx !== -1) {
      companions[idx] = { ...companions[idx], ...body }
      return HttpResponse.json({ data: companions[idx] })
    } else {
      // fallback cho mock
      companions[0] = { ...companions[0], ...body }
      return HttpResponse.json({ data: companions[0] })
    }
  }),

  // POST /api/companions/me/scenarios
  http.post('/api/companions/me/scenarios', async ({ request }) => {
    await delay(500)
    if (!currentMockUser || currentMockUser.role !== 'companion') return HttpResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
    
    const body = await request.json() as CreateScenarioBody
    const idx = companions.findIndex(c => c.id === currentMockUser.id)
    const targetComp = idx !== -1 ? companions[idx] : companions[0]
    
    const newScenario = {
      ...body,
      id: `sc-new-${Date.now()}`
    }
    targetComp.scenarios.unshift(newScenario)
    
    return HttpResponse.json({ data: newScenario })
  }),

  // PUT /api/companions/me/scenarios/:id
  http.put('/api/companions/me/scenarios/:scenarioId', async ({ request, params }) => {
    await delay(500)
    if (!currentMockUser || currentMockUser.role !== 'companion') return HttpResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
    
    const body = await request.json() as UpdateScenarioBody
    const targetComp = companions.find(c => c.id === currentMockUser.id) || companions[0]
    const sIdx = targetComp.scenarios.findIndex(s => s.id === params.scenarioId)
    
    if (sIdx !== -1) {
      targetComp.scenarios[sIdx] = { ...targetComp.scenarios[sIdx], ...body }
      return HttpResponse.json({ data: targetComp.scenarios[sIdx] })
    }
    return HttpResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
  }),

  // DELETE /api/companions/me/scenarios/:id
  http.delete('/api/companions/me/scenarios/:scenarioId', async ({ params }) => {
    await delay(500)
    if (!currentMockUser || currentMockUser.role !== 'companion') return HttpResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
    
    const targetComp = companions.find(c => c.id === currentMockUser.id) || companions[0]
    targetComp.scenarios = targetComp.scenarios.filter(s => s.id !== params.scenarioId)
    return HttpResponse.json({ data: { success: true } })
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
