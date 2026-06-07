import { NextRequest, NextResponse } from 'next/server'
import { companionService } from '@/shared/services/companionService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/**
 * GET /api/companions/[companionId]
 * Proxy thông qua companionService để tận dụng cache mới (use cache)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ companionId: string }> },
) {
  const { companionId } = await params
  try {
    const data = await companionService.getCompanionDetail(companionId)
    if (!data) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Không tìm thấy bạn đồng hành' } },
        { status: 404 }
      )
    }
    return NextResponse.json(data)
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
