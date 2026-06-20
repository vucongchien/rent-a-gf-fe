import { NextRequest, NextResponse } from 'next/server'
import { toErrorPayload } from '@/shared/lib/apiClient'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (file) {
      console.log(`[BFF] Uploading file: ${file.name} (${file.size} bytes, type: ${file.type})`)
    } else {
      console.log('[BFF] No file found in upload request')
    }

    // Since this is mock/dev-only, we directly return mock success response.
    const mockUrl = `https://i.pravatar.cc/600?u=mock-upload-${Date.now()}`
    
    return NextResponse.json({
      data: {
        url: mockUrl,
        success: true
      }
    })
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
