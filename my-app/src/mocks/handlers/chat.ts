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
    const { currentMockUser } = await import('../fixtures/data')
    const senderId = currentMockUser?.userId || 'u-client-1'

    const newMsg: ChatMessage = {
      messageId: `msg-${Date.now()}`,
      roomId: params.roomId as string,
      senderId,
      content: body.text,
      createdAt: new Date().toISOString(),
    }
    if (!mockMessages[params.roomId as string]) {
      mockMessages[params.roomId as string] = []
    }
    mockMessages[params.roomId as string].push(newMsg)

    // Cập nhật tin nhắn cuối cùng trong room
    if (room) {
      room.lastMessage = body.text
      room.lastMessageAt = newMsg.createdAt
    }

    // Giả lập bot tự động trả lời sau 1.5 giây
    const isClient = senderId === 'u-client-1'
    const receiverId = isClient ? (room?.companionId || 'u-comp-1') : 'u-client-1'
    
    setTimeout(() => {
      const roomMsgs = mockMessages[params.roomId as string]
      if (roomMsgs) {
        const botMsg: ChatMessage = {
          messageId: `msg-bot-${Date.now()}`,
          roomId: params.roomId as string,
          senderId: receiverId,
          content: `Chào bạn, mình đã nhận được tin nhắn: "${body.text}". Mình sẽ phản hồi sớm nhé!`,
          createdAt: new Date().toISOString(),
        }
        roomMsgs.push(botMsg)
        if (room) {
          room.lastMessage = botMsg.content
          room.lastMessageAt = botMsg.createdAt
        }
      }
    }, 1500)

    return HttpResponse.json(newMsg, { status: 201 })
  }),
]


