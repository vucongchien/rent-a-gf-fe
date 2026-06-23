import React from 'react';
import { authService } from '@/shared/services/authService';
import { adminSettingsService } from '@/shared/services/adminSettingsService';
import { AdminTopbar } from '@/shared/components/admin/AdminTopbar';
import { FlagToggleRow } from './FlagToggleRow';

export default async function AdminSettingsPage() {
  const user = await authService.getMe();
  const { flags } = await adminSettingsService.listFlags();

  return (
    <>
      {user && <AdminTopbar user={user} title="Settings" />}

      <div className="flex-1 p-8 space-y-6 min-w-0">
        <div className="max-w-2xl space-y-6">
          <header>
            <h2 className="text-[18px] font-semibold text-neutral-900">Feature flags</h2>
            <p className="text-[13px] text-text-muted mt-1 leading-relaxed">
              Bật/tắt tính năng theo runtime. Mỗi lần thay đổi đều ghi audit log.
              Fees / config khác sẽ được thêm ở các iteration sau.
            </p>
          </header>

          <section className="border border-border rounded-lg bg-surface px-6 divide-y divide-border">
            {flags.map((flag) => (
              <FlagToggleRow key={flag.key} flag={flag} />
            ))}
          </section>

          <p className="text-[11.5px] text-text-muted">
            🚧 Các phần dưới đây sẽ được làm sau:
          </p>
          <ul className="text-[12.5px] text-text-muted list-disc pl-5 space-y-1">
            <li>Fees config (commission %, payout threshold)</li>
            <li>System-wide announcements</li>
            <li>Maintenance mode</li>
          </ul>
        </div>
      </div>
    </>
  );
}
