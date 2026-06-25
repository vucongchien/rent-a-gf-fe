import { NextRequest, NextResponse } from 'next/server';
import { companionService } from '@/shared/services/companionService';
import { toErrorPayload } from '@/shared/lib/apiClient';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const city = searchParams.get('city') ?? undefined;

    const data = await companionService.getCompanions({
      ...(page ? { page: Number(page) } : {}),
      ...(pageSize ? { pageSize: Number(pageSize) } : {}),
      ...(city ? { city } : {}),
    });

    return NextResponse.json(data);
  } catch (err) {
    const payload = toErrorPayload(err);
    return NextResponse.json(payload, { status: payload.status });
  }
}
