import { notFound } from 'next/navigation';
import { isMockMode } from '@/shared/lib/env';
import { MockVNPayCheckout } from './MockVNPayCheckout';

interface PageProps {
  searchParams: Promise<{ orderId?: string; amount?: string }>;
}

/**
 * /mock/vnpay/checkout — Trang giả lập trang thanh toán VNPay.
 *
 * Chỉ render khi mock mode (API_URL không set). Khi BE thật cấu hình:
 * - walletService trả real VNPay sandbox URL → browser đi thẳng VNPay → page này không bao giờ reach.
 * - Nếu vì lý do gì hit page này khi !mockMode → 404 để tránh phơi bày trang giả.
 */
export default async function MockVNPayCheckoutPage({ searchParams }: PageProps) {
  if (!isMockMode()) notFound();
  const { orderId, amount } = await searchParams;
  if (!orderId || !amount) notFound();

  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) notFound();

  return <MockVNPayCheckout orderId={orderId} amount={amountNum} />;
}
