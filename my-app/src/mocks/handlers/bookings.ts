/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse, delay } from 'msw'
import { mockBookings, companions, mockWallet, currentMockUser } from '../fixtures/data'
import type { BookingListItem, BookingDetail, ScenarioSnapshot } from '@/shared/types/booking'

// State mutable cho booking CRUD
const bookings: any[] = [...mockBookings]

function createBooking(body: {
  companionId: string
  scenarioId: string
  startTime: string
}) {
  const companion = companions.find(c => c.companionId === body.companionId)
  const scenario = companion?.scenarios.find(s => s.scenarioId === body.scenarioId)
  const price = scenario?.price ?? 0
  const duration = scenario?.durationMinutes ?? 60
  
  const scenarioSnapshot: ScenarioSnapshot = {
    title: scenario?.title ?? 'Unknown',
    price,
    durationMinutes: duration,
    publicPlace: scenario?.publicPlace ?? '',
  }

  const bookingId = `bk-${Date.now()}`

  return {
    bookingId,
    clientId: currentMockUser?.userId || 'u-unknown',
    clientName: currentMockUser?.displayName || 'Unknown Client',
    clientAvatarUrl: currentMockUser?.avatarUrl || '',
    companionId: body.companionId,
    companionName: companion?.displayName ?? 'Unknown',
    companionAvatarUrl: companion?.avatarUrl ?? '',
    scenarioTitle: scenario?.title ?? 'Unknown',
    startTime: body.startTime,
    endTime: new Date(new Date(body.startTime).getTime() + duration * 60000).toISOString(),
    status: 'PENDING' as const,
    price,
    chatRoomId: null,
    publicPlace: scenario?.publicPlace ?? '',
    escrowStatus: 'frozen',
    chatRoomStatus: 'INACTIVE' as const,
    hasReviewed: false,
    scenarioSnapshot,
  }
}

function autoCompleteBookings() {
  bookings.forEach(b => {
    // 1. Tự động chuyển trạng thái booking quá hạn sang COMPLETED
    if (b.status === 'ACCEPTED' && new Date(b.endTime) < new Date()) {
      b.status = 'COMPLETED'
      b.escrowStatus = 'released'
    }
    
    // 2. Chỉ giải phóng tiền khi Companion online và tiền chưa được release
    if (b.status === 'COMPLETED' && b.escrowStatus === 'released' && !(b as any).isFundsReleased) {
      if (currentMockUser?.role === 'COMPANION' && b.companionId === currentMockUser.userId) {
          mockWallet.availableBalance += b.price
          mockWallet.frozenBalance = Math.max(0, mockWallet.frozenBalance - b.price)
          mockWallet.transactions.unshift({
            transactionId: `tx-release-${b.bookingId}`,
            walletId: mockWallet.walletId,
            description: `Hoàn thành · ${b.scenarioTitle}`,
            amount: b.price,
            type: 'CREDIT',
            status: 'SUCCESS',
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

    let items = bookings
    const user = currentMockUser
    if (user) {
      items = items.filter(b => b.clientId === user.userId)
    }

    if (status) items = items.filter(b => b.status.toLowerCase() === status.toLowerCase())

    const mappedItems: BookingListItem[] = items.map(b => ({
      bookingId: b.bookingId,
      partnerName: b.companionName,
      partnerAvatar: b.companionAvatarUrl,
      scenarioTitle: b.scenarioTitle,
      price: b.price,
      startTime: b.startTime,
      endTime: b.endTime,
      chatRoomId: b.chatRoomId,
      hasReviewed: b.hasReviewed,
      status: b.status,
    }))

    return HttpResponse.json({
      bookings: mappedItems,
      nextPageToken: null,
    })
  }),

  // GET /api/client/bookings/:bookingId
  http.get('/api/client/bookings/:bookingId', async ({ params }) => {
    await delay(400)
    const booking = bookings.find(b => b.bookingId === params.bookingId && b.clientId === currentMockUser?.userId)
    if (!booking) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Không tìm thấy booking' },
        { status: 404 }
      )
    }
    
    const detail: BookingDetail = {
      bookingId: booking.bookingId,
      clientId: booking.clientId,
      companionId: booking.companionId,
      scenarioSnapshot: booking.scenarioSnapshot,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      chatRoomId: booking.chatRoomId,
      chatRoomStatus: booking.chatRoomStatus,
      hasReviewed: booking.hasReviewed,
    }
    
    return HttpResponse.json(detail)
  }),

  // POST /api/client/bookings — tạo mới booking (Client)
  http.post('/api/client/bookings', async ({ request }) => {
    await delay(1000)
    const body = await request.json() as { companionId: string; scenarioId: string; startTime: string }
    const newBooking = createBooking({
      companionId: body.companionId,
      scenarioId: body.scenarioId,
      startTime: body.startTime,
    })
    bookings.unshift(newBooking)

    // Trừ coin khỏi ví mock (escrow/freeze)
    const price = newBooking.price
    mockWallet.availableBalance = Math.max(0, mockWallet.availableBalance - price)
    mockWallet.frozenBalance = (mockWallet.frozenBalance || 0) + price
    mockWallet.transactions.unshift({
      transactionId: `tx-booking-${newBooking.bookingId}`,
      walletId: mockWallet.walletId,
      description: `Đặt lịch · ${newBooking.scenarioTitle}`,
      amount: -price,
      type: 'DEBIT',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json(
      {
        bookingId: newBooking.bookingId,
        clientId: newBooking.clientId,
        companionId: newBooking.companionId,
        scenarioSnapshot: newBooking.scenarioSnapshot,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        status: newBooking.status
      },
      { status: 201 }
    )
  }),

  // PATCH /api/client/bookings/:bookingId/cancel — Hủy đặt lịch (Client)
  http.patch('/api/client/bookings/:bookingId/cancel', async ({ params }) => {
    await delay(800)
    const idx = bookings.findIndex(b => b.bookingId === params.bookingId && b.clientId === currentMockUser?.userId)
    if (idx === -1) {
      return HttpResponse.json({ code: 'NOT_FOUND', message: 'Không tìm thấy booking' }, { status: 404 })
    }
    const booking = bookings[idx]
    if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
      return HttpResponse.json({ code: 'CANCEL_NOT_ALLOWED', message: 'Không thể hủy lúc này' }, { status: 422 })
    }
    bookings[idx] = { ...booking, status: 'CANCELLED', escrowStatus: 'refunded' }

    // Hoàn trả coin lại ví Client
    mockWallet.availableBalance += booking.price
    mockWallet.frozenBalance = Math.max(0, mockWallet.frozenBalance - booking.price)
    mockWallet.transactions.unshift({
      transactionId: `tx-refund-${booking.bookingId}`,
      walletId: mockWallet.walletId,
      description: `Hoàn tiền · ${booking.scenarioTitle}`,
      amount: booking.price,
      type: 'CREDIT',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    })

    return HttpResponse.json({
      bookingId: booking.bookingId,
      status: 'CANCELLED',
      refundAmount: booking.price,
      compensationAmount: 0
    })
  }),


  // --- COMPANION BOOKINGS API ---

  // GET /api/companion/bookings
  http.get('/api/companion/bookings', async ({ request }) => {
    await delay(600)
    autoCompleteBookings()

    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') {
      return HttpResponse.json({ code: 'UNAUTHORIZED', message: 'Không có quyền truy cập' }, { status: 401 })
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let items = bookings.filter(b => b.companionId === user.userId)
    if (status) items = items.filter(b => b.status.toLowerCase() === status.toLowerCase())

    const mappedItems: BookingListItem[] = items.map(b => ({
      bookingId: b.bookingId,
      partnerName: b.clientName,
      partnerAvatar: b.clientAvatarUrl,
      scenarioTitle: b.scenarioTitle,
      price: b.price,
      startTime: b.startTime,
      endTime: b.endTime,
      chatRoomId: b.chatRoomId,
      hasReviewed: b.hasReviewed,
      status: b.status,
    }))

    return HttpResponse.json({
      bookings: mappedItems,
      nextPageToken: null,
    })
  }),

  // GET /api/companion/bookings/:bookingId
  http.get('/api/companion/bookings/:bookingId', async ({ params }) => {
    await delay(400)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') {
      return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    }
    const booking = bookings.find(b => b.bookingId === params.bookingId && b.companionId === user.userId)
    if (!booking) {
      return HttpResponse.json(
        { code: 'NOT_FOUND', message: 'Không tìm thấy booking' },
        { status: 404 }
      )
    }
    
    const detail: BookingDetail = {
      bookingId: booking.bookingId,
      clientId: booking.clientId,
      companionId: booking.companionId,
      scenarioSnapshot: booking.scenarioSnapshot,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      chatRoomId: booking.chatRoomId,
      chatRoomStatus: booking.chatRoomStatus,
      hasReviewed: booking.hasReviewed,
    }
    
    return HttpResponse.json(detail)
  }),

  // PATCH /api/companion/bookings/:bookingId/accept — Chấp nhận đặt lịch (Companion)
  http.patch('/api/companion/bookings/:bookingId/accept', async ({ params }) => {
    await delay(600)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') {
      return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    }
    const idx = bookings.findIndex(b => b.bookingId === params.bookingId && b.companionId === user.userId)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Không tìm thấy' }, { status: 404 })
    const chatRoomId = `room-${params.bookingId}`
    bookings[idx] = { ...bookings[idx], status: 'ACCEPTED', chatRoomId, chatRoomStatus: 'ACTIVE' }
    return HttpResponse.json({ bookingId: params.bookingId, status: 'ACCEPTED', chatRoomId })
  }),

  // PATCH /api/companion/bookings/:bookingId/reject — Từ chối đặt lịch (Companion)
  http.patch('/api/companion/bookings/:bookingId/reject', async ({ params }) => {
    await delay(600)
    const user = currentMockUser
    if (!user || user.role !== 'COMPANION') {
      return HttpResponse.json({ code: 'UNAUTHORIZED' }, { status: 401 })
    }
    const idx = bookings.findIndex(b => b.bookingId === params.bookingId && b.companionId === user.userId)
    if (idx === -1) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Không tìm thấy' }, { status: 404 })
    bookings[idx] = { ...bookings[idx], status: 'REJECTED' }
    return HttpResponse.json({ bookingId: params.bookingId, status: 'REJECTED' })
  }),
]
