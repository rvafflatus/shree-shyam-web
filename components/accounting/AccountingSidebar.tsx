'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavIconName =
  | 'overview'
  | 'invoices'
  | 'parties'
  | 'items'
  | 'purchases'
  | 'reports';

const navigation: { label: string; href: string; icon: NavIconName }[] = [
  { label: 'Overview', href: '/admin/accounting', icon: 'overview' },
  { label: 'Invoices', href: '/admin/accounting/invoices', icon: 'invoices' },
  { label: 'Parties', href: '/admin/accounting/parties', icon: 'parties' },
  { label: 'Items', href: '/admin/accounting/items', icon: 'items' },
  {
    label: 'Purchases & Transport',
    href: '/admin/accounting/purchases',
    icon: 'purchases',
  },
  { label: 'Reports', href: '/admin/accounting/reports', icon: 'reports' },
];

function NavIcon({ name }: { name: NavIconName }) {
  const paths: Record<NavIconName, string> = {
    overview: 'M3 3h7v7H3z M14 3h7v4h-7z M14 10h7v11h-7z M3 14h7v7H3z',
    invoices: 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h8 M9 17h8',
    parties:
      'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 8v6 M23 11h-6',
    items:
      'm12 3 9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 16l9 5 9-5',
    purchases:
      'M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 8H6 M10 21h.01 M18 21h.01',
    reports:
      'M4 19V5 M4 19h17 M8 15l4-4 3 2 5-6 M8 8h.01 M12 11h.01 M15 13h.01 M20 7h.01',
  };

  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export default function AccountingSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-slate-200 bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r lg:border-slate-800">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">
          S
        </span>
        <div>
          <p className="text-sm font-semibold tracking-wide">Shree Shyam</p>
          <p className="mt-0.5 text-xs text-slate-400">Accounting Suite</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-5 lg:grid-cols-1">
        <Link
          href="/admin/accounting/invoices/new"
          data-demo-mutation-action
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          New Invoice
        </Link>
        <Link
          href="/admin/accounting/purchases/new"
          data-demo-mutation-action
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          New Purchase
        </Link>
      </div>

      <nav
        aria-label="Accounting sections"
        className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-3 lg:pb-5"
      >
        <p className="hidden px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 lg:block">
          Workspace
        </p>
        {navigation.map((item) => {
          const isActive =
            item.href === '/admin/accounting'
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`inline-flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600/15 text-blue-300'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <NavIcon name={item.icon} />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-slate-800 px-5 py-4 text-xs leading-5 text-slate-500 lg:block">
        Business records and reports
      </div>
    </aside>
  );
}
