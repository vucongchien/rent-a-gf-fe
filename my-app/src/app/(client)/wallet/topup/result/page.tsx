import { TopupResultView } from './TopupResultView';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    orderId?: string;
    amount?: string;
    code?: string;
  }>;
}

export default async function TopupResultPage({ searchParams }: PageProps) {
  const { status, orderId, amount, code } = await searchParams;
  const safeStatus: 'success' | 'cancelled' | 'failed' =
    status === 'success' || status === 'cancelled' ? status : 'failed';
  const amountNum = amount ? Number(amount) : 0;
  return (
    <TopupResultView
      status={safeStatus}
      orderId={orderId ?? ''}
      amount={Number.isFinite(amountNum) ? amountNum : 0}
      code={code ?? ''}
    />
  );
}
