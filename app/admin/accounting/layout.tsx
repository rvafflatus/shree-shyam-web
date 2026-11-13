import type { ReactNode } from 'react';
import AccountingLayoutShell from '@/components/accounting/AccountingLayoutShell';

export default function AccountingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AccountingLayoutShell>{children}</AccountingLayoutShell>;
}
