import React from 'react';
import { walletService } from '@/shared/services/walletService';
import type { WalletTransaction } from '@/shared/types';
import { CalendarIcon, ArrowUpIcon, ArrowDownIcon } from '@/shared/components/atoms/Icons';

interface TransactionListProps {
  type?: string;
  status?: string;
}

export const TransactionList: React.FC<TransactionListProps> = async ({ type, status }) => {
  // Lấy dữ liệu không qua cache để đảm bảo giao dịch tài chính hiển thị chính xác nhất
  const allTransactions = await walletService.getTransactions();

  // Áp dụng bộ lọc trên Server
  const filteredTransactions = allTransactions.filter((tx) => {
    const matchType = !type || type === 'ALL' || tx.type === type;
    const matchStatus = !status || status === 'ALL' || tx.status === status;
    return matchType && matchStatus;
  });

  // Định dạng ngày giờ tiếng Việt
  const formatDateTimeVN = (iso: string): string => {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    return `${time} · ${date}`;
  };

  const getStatusBadge = (txStatus: WalletTransaction['status']) => {
    switch (txStatus) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center font-sans font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Thành công
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center font-sans font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Đang xử lý
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center font-sans font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Thất bại
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center font-sans font-bold text-[10px] tracking-wide px-2 py-0.5 rounded-full bg-neutral-50 text-neutral-600 border border-neutral-200">
            {txStatus}
          </span>
        );
    }
  };

  if (filteredTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-100">
          <CalendarIcon size={20} className="text-neutral-400" />
        </div>
        <p className="font-sans font-medium text-[13.5px] text-neutral-500">
          Không có giao dịch nào phù hợp với bộ lọc đã chọn.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full divide-y divide-neutral-100">
      {filteredTransactions.map((tx) => {
        const isCredit = tx.type === 'CREDIT';
        // Tỉ lệ VNĐ: 1 Coin = 1000 VNĐ
        const amountVnd = Math.abs(tx.amount) * 1000;
        
        return (
          <div key={tx.transactionId} className="flex items-center justify-between py-4 first:pt-2 last:pb-2">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Icon loại giao dịch */}
              {isCredit ? (
                <div 
                  title="Giao dịch nạp tiền"
                  className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100"
                >
                  <ArrowUpIcon size={15} />
                </div>
              ) : (
                <div 
                  title="Giao dịch thanh toán"
                  className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-100"
                >
                  <ArrowDownIcon size={15} />
                </div>
              )}

              {/* Chi tiết nội dung */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans font-semibold text-[13.5px] text-neutral-800 truncate pr-2">
                  {tx.description || (isCredit ? 'Nạp tiền vào ví' : 'Thanh toán dịch vụ')}
                </span>
                <span className="font-mono text-[11px] text-neutral-400">
                  {formatDateTimeVN(tx.createdAt)}
                </span>
              </div>
            </div>

            {/* Số tiền & Trạng thái */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pl-3">
              <div className={`font-sans font-bold text-[14px] ${isCredit ? 'text-emerald-600' : 'text-neutral-800'}`}>
                {isCredit ? '+' : '-'}
                {Math.abs(tx.amount).toLocaleString('vi-VN')} Coin
                <span className="block text-[10px] font-medium text-neutral-400 text-right mt-0.5">
                  {isCredit ? '+' : '-'}
                  {amountVnd.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div>{getStatusBadge(tx.status)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
