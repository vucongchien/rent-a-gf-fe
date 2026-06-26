import { NextRequest, NextResponse } from 'next/server';
import { toErrorPayload } from '@/shared/lib/apiClient';

export async function PUT(req: NextRequest) {
  try {
    const uploadUrl = req.headers.get('x-upload-url');
    if (!uploadUrl) {
      return NextResponse.json({ message: 'Missing x-upload-url header' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || 'application/octet-stream';
    const body = await req.arrayBuffer();

    console.log(`[BFF Proxy] Proxying upload to: ${uploadUrl} (${body.byteLength} bytes, Type: ${contentType})`);

    const s3Res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body,
    });

    if (!s3Res.ok) {
      const text = await s3Res.text();
      console.error(`[BFF Proxy] S3 upload failed: ${s3Res.status} - ${text}`);
      return NextResponse.json(
        { message: `Storage server returned status ${s3Res.status}` },
        { status: s3Res.status }
      );
    }

    console.log('[BFF Proxy] Proxy upload successful');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[BFF Proxy] Error proxying upload:', err);
    const payload = toErrorPayload(err);
    return NextResponse.json(payload, { status: payload.status });
  }
}
