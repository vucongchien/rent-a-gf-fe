import { http, HttpResponse, delay } from 'msw'
import { mockBookings, companions, mockWallet, currentMockUser } from '../fixtures/data'

// State mutable cho booking CRUD
const bookings = [...mockBookings]

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
    clientId: currentMockUser?.id || 'u-unknown',
    clientName: currentMockUser?.displayName || 'Unknown Client',
    clientAvatarUrl: currentMockUser?.avatarUrl || '',
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

function autoCompleteBookings() {
  bookings.forEach(b => {
    // 1. Tự động chuyển trạng thái booking quá hạn sang COMPLETED
    if (b.status === 'ACCEPTED' && new Date(b.endsAt) < new Date()) {
      b.status = 'COMPLETED'
      b.escrowStatus = 'released'
    }
    
    // 2. Chỉ giải phóng tiền khi Companion online và tiền chưa được release
    if (b.status === 'COMPLETED' && b.escrowStatus === 'released' && !(b as any).isFundsReleased) {
      if (currentMockUser?.role === 'companion' && b.companionId === currentMockUser.id) {
          mockWallet.balance += b.priceInCoin
          mockWallet.frozenBalance = Math.max(0, mockWallet.frozenBalance - b.priceInCoin)
          mockWallet.transactions.unshift({
            id: `tx-release-${b.id}`,
            label: `Hoàn thành · ${b.scenarioName}`,
            amountInCoin: b.priceInCoin,
            type: 'credit',
            status: 'completed',
            createdAt: new Date().toISOString(),
          })
          ;(b as any).isFundsReleased = true
      }
    }
  })
}

export const bookingHandlers = [
  // --- CLIENT BOOKINGS API ---

  // GET /api/client/bookings
  http.get('/api/client/bookings', async ({ request }) => {
    await delay(600)
    autoCompleteBookings()

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 10

    let items = bookings
    const user = currentMockUser
    if (user) {
      items = items.filter(b => b.clientId === user.id)
    }

    if (status) items = items.filter(b => b.status.toLowerCase() === status.toLowerCase())

    const start = (page - 1) * limit
    return HttpResponse.json({
      data: {
        items: items.slice(start, start + limit),
        meta: { page, limit, total: items.length, hasNextPage: start + limit < items.length },
      },
    })
  }),

  // GET /api/client/bookings/:bookingId
  http.get('/api/client/bookings/:bookingId', async ({ params }) => {
    await delay(400)
    const booking = bookings.find(b => b.id === params.bookingId && b.clientId === currentMockUser?.id)
    if (!booking) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Không tìm thấy booking' } },
        { status: 404 }
      )
    }
    return HttpResponse.json({ data: booking })
  }),

  // POST /api/client/bookings — tạo mới booking (Client)
  http.post('/api/client/bookings', async ({ request }) => {
    await delay(1000)
    const body = await request.json() as Parameters<typeof createBooking>[0]
    const newBooking = createBooking(body)
    bookings.unshift(newBooking)

    // Trừ coin khỏi ví mock (escrow/freeze)
    const price = newBooking.priceInCoin
    mockWallet.balance = Math.max(0, mockWallet.balance - price)
    mockWallet.frozenBalance = (mockWallet.frozenBalance || 0) + price
    mockWallet.transactions.unshift({
      id: `tx-booking-${newBooking.id}`,
      label: `Đặt lịch · ${newBooking.scenarioName}`,
      amountInCoin: -price,
      type: 'debit',
      status: 'frozen',
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json(
      { data: { bookingId: newBooking.id, status: 'PENDING', frozenCoin: price } },
      { status: 201 }
    )
  }),

  // PATCH /api/client/bookings/:bookingId/cancel — Hủy đặt lịch (Client)
  http.patch('/api/client/bookings/:bookingId/cancel', async ({ params }) => {
    await delay(800)
    const idx = bookings.findIndex(b => b.id === params.bookingId && b.clientId === currentMockUser?.id)
    if (idx === -1) {
      return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy booking' } }, { status: 404 })
    }
    const booking = bookings[idx]
    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      return HttpResponse.json({ error: { code: 'CANCEL_NOT_ALLOWED', message: 'Không thể hủy lúc này' } }, { status: 422 })
    }
    bookings[idx] = { ...booking, status: 'CANCELLED', escrowStatus: 'refunded' }

    // Hoàn trả coin lại ví Client
    mockWallet.balance += booking.priceInCoin
    mockWallet.frozenBalance = Math.max(0, mockWallet.frozenBalance - booking.priceInCoin)
    mockWallet.transactions.unshift({
      id: `tx-refund-${booking.id}`,
      label: `Hoàn tiền · ${booking.scenarioName}`,
      amountInCoin: booking.priceInCoin,
      type: 'credit',
      status: 'completed',
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({ data: { status: 'CANCELLED', refundedCoin: booking.priceInCoin } })
  }),


  // --- COMPANION BOOKINGS API ---

  // GET /api/companion/bookings
  http.get('/api/companion/bookings', async ({ request }) => {
    await delay(600)
    autoCompleteBookings()

    const user = currentMockUser
    if (!user || user.role !== 'companion') {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Không có quyền truy cập' } }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 10

    let items = bookings.filter(b => b.companionId === user.id)
    if (status) items = items.filter(b => b.status.toLowerCase() === status.toLowerCase())

    const start = (page - 1) * limit
    return HttpResponse.json({
      data: {
        items: items.slice(start, start + limit),
        meta: { page, limit, total: items.length, hasNextPage: start + limit < items.length },
      },
    })
  }),

  // GET /api/companion/bookings/:bookingId
  http.get('/api/companion/bookings/:bookingId', async ({ params }) => {
    await delay(400)
    const user = currentMockUser
    if (!user || user.role !== 'companion') {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
    }
    const booking = bookings.find(b => b.id === params.bookingId && b.companionId === user.id)
    if (!booking) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Không tìm thấy booking' } },
        { status: 404 }
      )
    }
    return HttpResponse.json({ data: booking })
  }),

  // PATCH /api/companion/bookings/:bookingId/accept — Chấp nhận đặt lịch (Companion)
  http.patch('/api/companion/bookings/:bookingId/accept', async ({ params }) => {
    await delay(600)
    const user = currentMockUser
    if (!user || user.role !== 'companion') {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
    }
    const idx = bookings.findIndex(b => b.id === params.bookingId && b.companionId === user.id)
    if (idx === -1) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }, { status: 404 })
    const chatRoomId = `room-${params.bookingId}`
    bookings[idx] = { ...bookings[idx], status: 'ACCEPTED', chatRoomId }
    return HttpResponse.json({ data: { status: 'ACCEPTED', chatRoomId } })
  }),

  // PATCH /api/companion/bookings/:bookingId/reject — Từ chối đặt lịch (Companion)
  http.patch('/api/companion/bookings/:bookingId/reject', async ({ params }) => {
    await delay(600)
    const user = currentMockUser
    if (!user || user.role !== 'companion') {
      return HttpResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
    }
    const idx = bookings.findIndex(b => b.id === params.bookingId && b.companionId === user.id)
    if (idx === -1) return HttpResponse.json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy' } }, { status: 404 })
    bookings[idx] = { ...bookings[idx], status: 'REJECTED' }
    return HttpResponse.json({ data: { status: 'REJECTED' } })
  }),
]
