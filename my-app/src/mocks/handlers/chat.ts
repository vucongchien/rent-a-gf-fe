import { http, HttpResponse, delay } from 'msw'
import { mockChatRooms, mockMessages } from '../fixtures/data'

export const chatHandlers = [
  // GET /api/chat/rooms
  http.get('/api/chat/rooms', async () => {
    await delay(500)
    return HttpResponse.json({ data: { rooms: mockChatRooms } })
  }),

  // GET /api/chat/rooms/:roomId/messages
  http.get('/api/chat/rooms/:roomId/messages', async ({ params }) => {
    await delay(400)
    const messages = mockMessages[params.roomId as string] ?? []
    return HttpResponse.json({
      data: { items: messages, nextCursor: null },
    })
  }),

  // POST /api/chat/rooms/:roomId/messages
  http.post('/api/chat/rooms/:roomId/messages', async ({ params, request }) => {
    await delay(300)
    const room = mockChatRooms.find(r => r.id === params.roomId)
    if (room?.isLocked) {
      return HttpResponse.json(
        { error: { code: 'ROOM_LOCKED', message: 'Phòng chat đã bị khóa' } },
        { status: 422 }
      )
    }
    const body = await request.json() as { content: string }
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: 'u-client-1',
      senderName: 'Minh Khách',
      content: body.content,
      sentAt: new Date().toISOString(),
      status: 'sent' as const,
    }
    if (!mockMessages[params.roomId as string]) {
      mockMessages[params.roomId as string] = []
    }
    mockMessages[params.roomId as string].push(newMsg)
    return HttpResponse.json({ data: newMsg }, { status: 201 })
  }),
]
