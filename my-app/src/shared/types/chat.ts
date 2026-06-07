/**
 * chat.ts — Types cho Chat domain.
 */

export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  sentAt: string
  status: MessageStatus
}

export interface ChatRoom {
  id: string
  companionId: string
  companionName: string
  companionAvatarUrl: string
  bookingId: string
  isLocked: boolean
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

/** Cursor-based message pagination */
export interface MessagePage {
  items: ChatMessage[]
  nextCursor: string | null
}
