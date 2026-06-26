import { TopupResultView } from './TopupResultView';
import { parseTopupResult } from './parseTopupResult';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    orderId?: string;
    amount?: string;
    code?: string;
    vnp_Amount?: string;
    vnp_ResponseCode?: string;
    vnp_TxnRef?: string;
  }>;
}

export default async function TopupResultPage({ searchParams }: PageProps) {
  const result = parseTopupResult(await searchParams);
  return (
    <TopupResultView
      status={result.status}
      orderId={result.orderId}
      amount={result.amount}
      code={result.code}
    />
  );
}
