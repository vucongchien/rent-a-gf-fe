/**
 * chat.ts — Types cho Chat domain.
 */

export interface ChatMessage {
  messageId: string
  roomId: string
  senderId: string
  content: string
  createdAt: string
}

export interface SendMessageBody {
  text: string
}

/**
 * RawChatRoom — Raw response từ API backend
 * API trả về roomId (không phải chatRoomId) và không có companionName/avatar
 */
export interface RawChatRoom {
  roomId: string
  bookingId: string
  clientId: string
  companionId: string
  status: 'ACTIVE' | 'INACTIVE'
  lockAt: string | null
  createdAt: string
  updatedAt: string
}

/**
 * ChatRoom — Normalized type dùng trong toàn bộ UI
 * companionName/companionAvatarUrl là optional vì API hiện chưa trả về
 */
export interface ChatRoom {
  chatRoomId: string
  clientId: string
  companionId: string
  companionName: string
  companionAvatarUrl: string
  bookingId: string
  status: 'ACTIVE' | 'INACTIVE'
  lastMessage?: string | null
  lastMessageAt?: string | null
  unreadCount?: number
}
