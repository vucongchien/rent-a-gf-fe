# Backlog — Wallet Topup: FE Service & Route Contract

> Bổ sung cho [`wallet-real-payment-integration.md`](./wallet-real-payment-integration.md) và spec gốc [`flow/04-wallet-topup.md`](../important/flow/04-wallet-topup.md). File này tập trung vào **gap cụ thể về service / route handler** ở FE-BFF, để khi BE thật sẵn sàng có thể implement nhanh không phải design lại.

---

## 1. Vấn đề

Hiện tại `walletService.initiateTopup` (FE-BFF) chỉ trả `{ paymentUrl }`. Sau khi client redirect VNPay xong quay lại, **không có cơ chế kiểm tra trạng thái giao dịch** — vi phạm spec `flow/04-wallet-topup.md` §6 (race condition giữa IPN webhook và page return) và §8 (recovery strategy short-polling 5×2s).

Gap cụ thể:

| Item | Hiện tại | Cần |
|---|---|---|
| `TopupResponse` type | `{ paymentUrl }` | `{ paymentUrl, txId }` (`vnp_TxnRef`) |
| FE-BFF route status check | KHÔNG có | `GET /api/finance/topup/status/[txId]` |
| Service method | KHÔNG có | `walletService.getTopupStatus(txId)` |
| Client polling UI | KHÔNG có | Page `/wallet/topup/processing` với loop 5×2s |
| Pending-success fallback | KHÔNG có | UI trạng thái "đang xử lý 1-5 phút" sau timeout polling |

---

## 2. Type contract đề xuất

**`src/shared/types/wallet.ts`**:

```ts
/** Response từ POST /finance/topup. txId = vnp_TxnRef do BE sinh. */
export interface TopupResponse {
  paymentUrl: string;
  txId: string;            // ← MỚI. BE phải trả cùng paymentUrl
}

/** Status mỗi lần poll. */
export type TopupStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'ALREADY_PROCESSED';

export interface TopupStatusResponse {
  txId: string;
  status: TopupStatus;
  /** Số tiền nạp (coin), có khi status=SUCCESS */
  amount?: number;
  /** Số dư mới sau giao dịch */
  newBalance?: number;
  /** Lý do failed/timeout */
  reason?: string;
}
```

---

## 3. Service signature đề xuất

**`src/shared/services/walletService.ts`**:

```ts
async getTopupStatus(
  txId: string,
  options?: ServiceRequestOptions
): Promise<TopupStatusResponse> {
  if (isMockMode()) {
    // Mock: random pending vài lần rồi success để test polling UX
    return { txId, status: 'SUCCESS', amount: 100, newBalance: 250 };
  }
  const req = await getRequestCookieHeader(options?.req);
  return serverFetch<TopupStatusResponse>(`/finance/topup/${txId}/status`, { req });
}
```

`initiateTopup` cập nhật để forward `txId` từ BE thật (xoá mock hardcoded `vnp_TxnRef`).

---

## 4. Route handler đề xuất

**File mới**: `src/app/api/finance/topup/status/[txId]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/shared/services/walletService'
import { toErrorPayload } from '@/shared/lib/apiClient'

/** GET /api/finance/topup/status/[txId] — Polling trạng thái giao dịch nạp tiền. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txId: string }> },
) {
  try {
    const { txId } = await params
    const data = await walletService.getTopupStatus(txId, { req })
    return NextResponse.json(data, {
      // Polling endpoint — bắt buộc không cache
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    const payload = toErrorPayload(err)
    return NextResponse.json(payload, { status: payload.status })
  }
}
```

Lý do **route handler** thay vì Server Action: client (page `processing`) cần polling từ browser → fetch HTTP. Server Action không phù hợp cho polling tick.

---

## 5. Client polling contract

**File mới**: `src/app/(client)/wallet/topup/processing/page.tsx` ('use client' page)

Pseudo-logic:

```ts
// const MAX_POLLS = 5, INTERVAL = 2000
// for i in [0..MAX_POLLS):
//   await sleep(INTERVAL)
//   const res = await fetch(`/api/finance/topup/status/${txId}`)
//   if (res.status === SUCCESS) → redirect /wallet/topup/return?status=success
//   if (res.status === FAILED | ALREADY_PROCESSED) → redirect /wallet/topup/return?status=...
//   continue
// → timeout: redirect /wallet/topup/return?status=pending (UX "1-5 phút")
```

UX states: `polling` (spinner + "Đang xác nhận giao dịch..."), `success`, `failed`, `pending-timeout`.

---

## 6. BE-side dependencies (block-FE)

FE không tự làm được hết — cần BE confirm các điểm sau:

- [ ] BE endpoint `POST /finance/topup` trả thêm field `txId` (== `vnp_TxnRef` đã sinh khi tạo VNPay URL).
- [ ] BE endpoint `GET /finance/topup/{txId}/status` trả `TopupStatusResponse` schema ở §2.
- [ ] BE handle IPN webhook từ VNPay → update DB → endpoint status trả `SUCCESS` đúng lúc.
- [ ] BE chống F5/double-call trang return: query lần 2 với cùng `txId` trả `ALREADY_PROCESSED` (theo `flow/04-wallet-topup.md` §7).
- [ ] BE confirm tên endpoint chính xác (`/finance/topup/{txId}/status` vs `/wallet/topup/{txId}/status` — hiện FE dùng prefix `/finance`).

---

## 7. Decision points cho BA / PM

Trước khi implement, cần chốt:

1. **Max retries**: spec hiện tại nói "5 lần × 2s = 10s". Giữ nguyên hay tăng (15-20s) cho mạng chậm?
2. **Pending-success UX**: text chính xác hiển thị khi timeout polling. Hiện gợi ý: "Thanh toán đã thành công, hệ thống cần 1-5 phút để cập nhật số dư".
3. **Cancel button khi polling**: có nút "Quay lại ví" không, hay khoá cho đến khi xong?
4. **Mobile deep-link return**: spec §9 nói VNPay redirect về ứng dụng ngân hàng. Có cần handle separate cho mobile browser không?
5. **Idempotency-key**: đã có ở `POST /finance/topup` (P0). Status check là GET, không cần. Confirm.

---

## 8. Test strategy

Khi implement:

- **Mock mode**: MSW handler `GET /api/finance/topup/status/:txId` trả `PENDING` 2 lần rồi `SUCCESS` lần 3 — verify UX polling chuyển trang đúng.
- **Timeout case**: handler trả `PENDING` mãi → verify FE chuyển sang `pending-success` sau 5 polls.
- **F5 case**: lần 2 polling cùng txId → `ALREADY_PROCESSED`.
- **Unit test**: service method với mock `serverFetch` (pattern theo `configService.test.ts`).

---

## 9. Ước lượng

| Pha | File | Effort |
|---|---|---|
| Type + service + route | 4 file | 0.5 ngày |
| Processing page + polling logic | 1 file | 0.5 ngày |
| Return page state + UX text | 1 file | 0.3 ngày |
| MSW mock + tests | 2 file | 0.3 ngày |

**Tổng**: ~1.5-2 ngày FE (sau khi BE sẵn sàng).

---

## 10. Phụ thuộc / tham chiếu

- Spec gốc: [`docs/important/flow/04-wallet-topup.md`](../important/flow/04-wallet-topup.md)
- Backlog tích hợp VNPay: [`wallet-real-payment-integration.md`](./wallet-real-payment-integration.md)
- Cấu trúc service hiện tại: [`artifacts/services-review/services-review.md`](../../artifacts/services-review/services-review.md) §7 (walletService)
- Idempotency pattern đã có ở `app/api/bookings/route.ts:24-29` — apply tương tự cho `POST /finance/topup` (P0 đã làm).
