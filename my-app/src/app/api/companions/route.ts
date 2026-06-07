import { NextRequest, NextResponse } from 'next/server'
import { companionService } from '@/shared/services/companionService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/**
   * GET /api/companions
   *
   * Proxy thông qua companionService để tận dụng cache và fallback mock offline
   */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const city = searchParams.get('city') || undefined
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    const { items, total, hasNextPage } = await companionService.getCompanions({
      city,
      limit,
    })

    return NextResponse.json({
      data: { 
        items, 
        meta: { total, hasNextPage } 
      },
    })
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
