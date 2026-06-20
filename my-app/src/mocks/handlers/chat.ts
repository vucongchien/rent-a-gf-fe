import { http, HttpResponse, delay } from 'msw'
import { mockChatRooms, mockMessages } from '../fixtures/data'
import type { ChatMessage } from '@/shared/types/chat'

export const chatHandlers = [
  // GET /api/interaction/rooms
  http.get('/api/interaction/rooms', async () => {
    await delay(500)
    return HttpResponse.json(mockChatRooms)
  }),

  // GET /api/interaction/rooms/:roomId/messages
  http.get('/api/interaction/rooms/:roomId/messages', async ({ params }) => {
    await delay(400)
    const messages = mockMessages[params.roomId as string] ?? []
    return HttpResponse.json(messages)
  }),

  // POST /api/interaction/rooms/:roomId/messages
  http.post('/api/interaction/rooms/:roomId/messages', async ({ params, request }) => {
    await delay(300)
    const room = mockChatRooms.find(r => r.chatRoomId === params.roomId)
    if (room?.status === 'INACTIVE') {
      return HttpResponse.json(
        { code: 'ROOM_LOCKED', message: 'Phòng chat đã bị khóa' },
        { status: 422 }
      )
    }
    const body = await request.json() as { text: string }
    const newMsg: ChatMessage = {
      messageId: `msg-${Date.now()}`,
      roomId: params.roomId as string,
      senderId: 'u-client-1',
      content: body.text,
      createdAt: new Date().toISOString(),
    }
    if (!mockMessages[params.roomId as string]) {
      mockMessages[params.roomId as string] = []
    }
    mockMessages[params.roomId as string].push(newMsg)
    return HttpResponse.json(newMsg, { status: 201 })
  }),
]

