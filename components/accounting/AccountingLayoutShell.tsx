'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import AccountingSidebar from './AccountingSidebar';

export default function AccountingLayoutShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === '/admin/accounting') {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:pl-64">
      <AccountingSidebar />
      <div className="min-h-screen min-w-0">{children}</div>
    </div>
  );
}
