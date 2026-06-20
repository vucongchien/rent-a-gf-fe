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

export interface ChatRoom {
  chatRoomId: string
  companionId: string
  companionName: string
  companionAvatarUrl: string
  bookingId: string
  status: 'ACTIVE' | 'INACTIVE'
  lastMessage?: string | null
  lastMessageAt?: string | null
  unreadCount?: number
}
