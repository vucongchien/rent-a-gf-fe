/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from 'msw'
import { companions, currentMockUser } from '../fixtures/data'
import type { CreateScenarioBody, UpdateScenarioBody } from '@/shared/types/companion'

export const companionHandlers = [
  // GET /api/companions — list với filter + offset-based pagination
  http.get('/api/companions', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const city = url.searchParams.get('city')
    const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1
    const pageSize = url.searchParams.get('pageSize') ? Number(url.searchParams.get('pageSize')) : 6

    let items = companions
    if (city && city !== 'all') {
      items = items.filter(c => c.availableCities.includes(city))
    }

    const startIndex = (page - 1) * pageSize
    const sliced = items.slice(startIndex, startIndex + pageSize)

    return HttpResponse.json({
      companions: sliced.map(c => ({
        companionId: c.companionId,
        displayName: c.displayName,
        avatarUrl: c.avatarUrl,
        averageRating: c.averageRating,
        totalReviews: c.totalReviews,
        availableCities: c.availableCities,
        minPrice: c.minPrice,
        voiceIntroUrl: c.voiceIntroUrl,
      })),
      total: items.length,
      page,
      pageSize,
    })
  }),

  // POST /api/companions/apply
  http.post('/api/companions/apply', async () => {
    await delay(600)
    const user = currentMockUser
    if (!user) {
      return HttpResponse.json({ code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' }, { status: 401 })
    }
    return HttpResponse.json({ status: 'PENDING' })
  }),

  // GET /api/companions/me
  http.get('/api/companions/me', async () => {
    await delay(500)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') {
      return HttpResponse.json({ code: 'UNAUTHORIZED', message: 'Không có quyền truy cập' }, { status: 401 })
    }
    const companion = companions.find(c => c.companionId === user.userId) || companions[0] 
    return HttpResponse.json(companion)
  }),

  // PUT /api/companions/me
  http.put('/api/companions/me', async ({ request }) => {
    await delay(600)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') {
      return HttpResponse.json({ code: 'UNAUTHORIZED', message: 'Không có quyền truy cập' }, { status: 401 })
    }
    const body = await request.json() as any
    const idx = companions.findIndex(c => c.companionId === user.userId)
    if (idx !== -1) {
      companions[idx] = { ...companions[idx], ...body }
      return HttpResponse.json(companions[idx])
    } else {
      // fallback cho mock
      companions[0] = { ...companions[0], ...body }
      return HttpResponse.json(companions[0])
    }
  }),

  // POST /api/companion/scenarios
  http.post('/api/companion/scenarios', async ({ request }) => {
    await delay(500)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    
    const body = await request.json() as CreateScenarioBody
    const idx = companions.findIndex(c => c.companionId === user.userId)
    const targetComp = idx !== -1 ? companions[idx] : companions[0]
    
    const newScenario = {
      ...body,
      scenarioId: `sc-new-${Date.now()}`
    }
    targetComp.scenarios.unshift(newScenario)
    
    return HttpResponse.json(newScenario)
  }),

  // PATCH /api/companion/scenarios/:scenarioId
  http.patch('/api/companion/scenarios/:scenarioId', async ({ request, params }) => {
    await delay(500)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    
    const body = await request.json() as UpdateScenarioBody
    const targetComp = companions.find(c => c.companionId === user.userId) || companions[0]
    const sIdx = targetComp.scenarios.findIndex(s => s.scenarioId === params.scenarioId)
    
    if (sIdx !== -1) {
      targetComp.scenarios[sIdx] = { ...targetComp.scenarios[sIdx], ...body }
      return HttpResponse.json(targetComp.scenarios[sIdx])
    }
    return HttpResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
  }),

  // DELETE /api/companion/scenarios/:scenarioId
  http.delete('/api/companion/scenarios/:scenarioId', async ({ params }) => {
    await delay(500)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    
    const targetComp = companions.find(c => c.companionId === user.userId) || companions[0]
    targetComp.scenarios = targetComp.scenarios.filter(s => s.scenarioId !== params.scenarioId)
    return HttpResponse.json({ success: true })
  }),

  // GET /api/companions/:companionId — chi tiết
  http.get('/api/companions/:companionId', async ({ params }) => {
    await delay(500)
    const companion = companions.find(c => c.companionId === params.companionId)
    if (!companion) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Không tìm thấy companion' },
        { status: 404 }
      )
    }
    return HttpResponse.json(companion)
  }),
]
