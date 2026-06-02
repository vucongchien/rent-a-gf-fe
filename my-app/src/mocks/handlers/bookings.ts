import { http, HttpResponse, delay } from 'msw'
import { mockBookings, companions } from '../fixtures/data'

// State mutable cho booking CRUD
let bookings = [...mockBookings]

function createBooking(body: {
  companionId: string
  scenarioId: string
  scheduledAt: string
  note?: string
}) {
  const companion = companions.find(c => c.id === body.companionId)
  const scenario = companion?.scenarios.find(s => s.id === body.scenarioId)
  return {
    id: `bk-${Date.now()}`,
    companionId: body.companionId,
    companionName: companion?.displayName ?? 'Unknown',
    companionAvatarUrl: companion?.avatarUrl ?? '',
    scenarioName: scenario?.name ?? 'Unknown',
    scheduledAt: body.scheduledAt,
    endsAt: new Date(new Date(body.scheduledAt).getTime() + (scenario?.durationMinutes ?? 60) * 60000).toISOString(),
    status: 'PENDING',
    priceInCoin: scenario?.priceInCoin ?? 0,
    chatRoomId: null,
    scenarioLocation: scenario?.location ?? '',
    escrowStatus: 'frozen',
  }
}

export const bookingHandlers = [
  // GET /api/bookings
  http.get('/api/bookings', async ({ request }) => {
    await delay(600)
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 10

    let items = bookings
    if (status) items = items.filter(b => b.status.toLowerCase() === status.toLowerCase())

    const start = (page - 1) * limit
    return HttpResponse.json({
      data: {
        items: items.slice(start, start + limit),
        meta: { page, limit, total: items.length, hasNextPage: start + limit < items.length },
      },
    })
  }),

  // GET /api/bookings/:id
  http.get('/api/bookings/:bookingId', async ({ params }) => {
    await delay(400)
    const booking = bookings.find(b => b.id === params.bookingId)
    if (!booking) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Không tìm thấy booking' } },
        { status: 404 }
      )
    }
    return HttpResponse.json({ data: booking })
  }),

  // POST /api/bookings — tạo mới
  http.post('/api/bookings', async ({ request }) => {
    await delay(1000)
    const body = await request.json() as Parameters<typeof createBooking>[0]
    const newBooking = createBooking(body)
    bookings.unshift(newBooking)
    return HttpResponse.json({ data: { id: newBooking.id, status: 'PENDING', frozenCoin: newBooking.priceInCoin } }, { status: 201 })
  }),

  // PATCH /api/bookings/:id/cancel
  http.patch('/api/bookings/:bookingId/cancel', async ({ params }) => {
    await delay(800)
    const idx = bookings.findIndex(b => b.id === params.bookingId)
    if (idx === -1) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy booking' } }, { status: 404 })
    }
    const booking = bookings[idx]
    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      return HttpResponse.json({ error: { code: 'CANCEL_NOT_ALLOWED', message: 'Không thể hủy lúc này' } }, { status: 422 })
    }
    bookings[idx] = { ...booking, status: 'CANCELLED' }
    return HttpResponse.json({ data: { status: 'CANCELLED', refundedCoin: booking.priceInCoin } })
  }),

  // PATCH /api/bookings/:id/accept (companion)
  http.patch('/api/bookings/:bookingId/accept', async ({ params }) => {
    await delay(600)
    const idx = bookings.findIndex(b => b.id === params.bookingId)
    if (idx === -1) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }, { status: 404 })
    const chatRoomId = `room-${params.bookingId}`
    bookings[idx] = { ...bookings[idx], status: 'ACCEPTED', chatRoomId }
    return HttpResponse.json({ data: { status: 'ACCEPTED', chatRoomId } })
  }),

  // PATCH /api/bookings/:id/reject (companion)
  http.patch('/api/bookings/:bookingId/reject', async ({ params }) => {
    await delay(600)
    const idx = bookings.findIndex(b => b.id === params.bookingId)
    if (idx === -1) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }, { status: 404 })
    bookings[idx] = { ...bookings[idx], status: 'REJECTED' }
    return HttpResponse.json({ data: { status: 'REJECTED' } })
  }),
]
