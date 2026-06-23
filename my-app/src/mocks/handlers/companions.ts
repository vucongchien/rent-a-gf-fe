/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from 'msw'
import { companions, currentMockUser } from '../fixtures/data'
import type { CreateScenarioBody, UpdateScenarioBody } from '@/shared/types/companion'

const DURATION_OPTIONS = [60, 120, 180]
const MAX_SCENARIOS = 5

function validateScenarioBody(body: Partial<CreateScenarioBody>) {
  const details: { field: string; description: string }[] = []
  if (body.price !== undefined && (!Number.isInteger(body.price) || body.price <= 0)) {
    details.push({ field: 'price', description: 'price > 0 (INV-P01)' })
  }
  if (
    body.durationMinutes !== undefined &&
    !DURATION_OPTIONS.includes(body.durationMinutes)
  ) {
    details.push({ field: 'durationMinutes', description: 'durationMinutes ∈ {60,120,180} (INV-P02)' })
  }
  return details
}

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
      companions[0] = { ...companions[0], ...body }
      return HttpResponse.json(companions[0])
    }
  }),

  // POST /api/companions/me/media/presigned-urls
  http.post('/api/companions/me/media/presigned-urls', async ({ request }) => {
    await delay(300)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') {
      return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    }
    const body = await request.json() as { assetType: 'IMAGE' | 'VOICE'; sizeBytes: number; durationSeconds?: number; contentType?: string }

    const details: { field: string; description: string }[] = []
    if (body.assetType === 'IMAGE' && body.sizeBytes > 2_000_000) {
      details.push({ field: 'sizeBytes', description: 'Ảnh tối đa 2MB (INV-P05)' })
    }
    if (body.assetType === 'VOICE') {
      if (body.sizeBytes > 5_000_000) details.push({ field: 'sizeBytes', description: 'Voice tối đa 5MB (INV-P04)' })
      if ((body.durationSeconds ?? 0) > 30) details.push({ field: 'durationSeconds', description: 'Voice tối đa 30 giây (INV-P04)' })
    }
    if (details.length > 0) {
      return HttpResponse.json({ code: 3, message: 'Media không hợp lệ', details }, { status: 400 })
    }

    const ext = body.assetType === 'IMAGE' ? 'png' : 'mp3'
    const id = `mock-${Date.now()}`
    const fileUrl = `https://storage.rent-a-gf.com/mock/${body.assetType.toLowerCase()}/${id}.${ext}`
    return HttpResponse.json({
      uploadUrl: `${fileUrl}?X-Amz-Signature=mock-${id}`,
      fileUrl,
    })
  }),

  // POST /api/companions/me/scenarios
  http.post('/api/companions/me/scenarios', async ({ request }) => {
    await delay(500)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })

    const body = await request.json() as CreateScenarioBody
    const targetComp = companions.find(c => c.companionId === user.userId) || companions[0]

    if ((targetComp.scenarios?.length ?? 0) >= MAX_SCENARIOS) {
      return HttpResponse.json(
        { code: 3, message: `Tối đa ${MAX_SCENARIOS} kịch bản (INV-P03)`, details: [{ field: 'scenarios', description: 'INV-P03' }] },
        { status: 400 },
      )
    }
    const details = validateScenarioBody(body)
    if (details.length > 0) {
      return HttpResponse.json({ code: 3, message: 'Dữ liệu không hợp lệ', details }, { status: 400 })
    }

    const newScenario = {
      ...body,
      scenarioId: `sc-new-${Date.now()}`,
    }
    targetComp.scenarios.unshift(newScenario)

    return HttpResponse.json(newScenario)
  }),

  // PUT /api/companions/me/scenarios/:scenarioId
  http.put('/api/companions/me/scenarios/:scenarioId', async ({ request, params }) => {
    await delay(500)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })

    const body = await request.json() as UpdateScenarioBody
    const details = validateScenarioBody(body)
    if (details.length > 0) {
      return HttpResponse.json({ code: 3, message: 'Dữ liệu không hợp lệ', details }, { status: 400 })
    }

    const targetComp = companions.find(c => c.companionId === user.userId) || companions[0]
    const sIdx = targetComp.scenarios.findIndex(s => s.scenarioId === params.scenarioId)

    if (sIdx !== -1) {
      targetComp.scenarios[sIdx] = { ...targetComp.scenarios[sIdx], ...body }
      return HttpResponse.json(targetComp.scenarios[sIdx])
    }
    return HttpResponse.json({ code: 'NOT_FOUND', message: 'Không tìm thấy kịch bản' }, { status: 404 })
  }),

  // DELETE /api/companions/me/scenarios/:scenarioId
  http.delete('/api/companions/me/scenarios/:scenarioId', async ({ params }) => {
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
