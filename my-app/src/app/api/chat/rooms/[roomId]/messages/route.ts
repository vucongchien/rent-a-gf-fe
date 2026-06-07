import { NextRequest, NextResponse } from 'next/server'
import { chatService } from '@/shared/services/chatService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/chat/rooms/[roomId]/messages — Load tin nhắn (cursor-based) */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params
  try {
    const data = await chatService.getChatMessages(roomId, {
      req,
      searchParams: req.nextUrl.searchParams,
    })
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}

/** POST /api/chat/rooms/[roomId]/messages — Gửi tin nhắn mới */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params
  try {
    const body = await req.json() as { content: string }
    const data = await chatService.sendChatMessage(roomId, body, { req })
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
