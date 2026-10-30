'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

const dashboardPin = '9028';

const sections = [
  {
    number: '01',
    category: 'Sales',
    title: 'Create New Invoice',
    description:
      'Prepare a customer invoice with your party and product details.',
    href: '/admin/accounting/invoices/new',
    action: 'Create invoice',
    accent: 'border-blue-200 bg-blue-50 text-blue-700',
    button: 'bg-blue-700 hover:bg-blue-800',
  },
  {
    number: '02',
    category: 'Catalog',
    title: 'Items & Products Master',
    description:
      'Manage your products, HSN/SAC codes, prices, and GST rates.',
    href: '/admin/accounting/items',
    action: 'Manage items',
    accent: 'border-violet-200 bg-violet-50 text-violet-700',
    button: 'bg-violet-700 hover:bg-violet-800',
  },
  {
    number: '03',
    category: 'Contacts',
    title: 'Parties',
    description:
      'Keep customer and vendor contact, GSTIN, and address details organized.',
    href: '/admin/accounting/parties',
    action: 'Manage parties',
    accent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    button: 'bg-emerald-700 hover:bg-emerald-800',
  },
  {
    number: '04',
    category: 'Insights',
    title: 'Reports & CSV Export',
    description:
      'Review invoice, party, and item records, and export reports to CSV.',
    href: '/admin/accounting/reports',
    action: 'View reports',
    accent: 'border-amber-200 bg-amber-50 text-amber-700',
    button: 'bg-amber-600 hover:bg-amber-700',
  },
];

export default function AccountingDashboardPage() {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handlePinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (pin !== dashboardPin) {
      setPin('');
      setErrorMessage('Incorrect PIN. Please try again.');
      return;
    }

    setIsUnlocked(true);
  }

  if (!isUnlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Shree Shyam Accounting
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Accounting Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter your PIN to continue.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handlePinSubmit}>
            <div>
              <label
                htmlFor="accounting-pin"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Dashboard PIN
              </label>
              <input
                id="accounting-pin"
                name="pin"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={4}
                required
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {errorMessage && (
              <p role="alert" className="text-sm text-red-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Enter dashboard
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Shree Shyam Accounting
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Accounting Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Create invoices, manage your business records, and review accounting
            reports from one place.
          </p>
        </header>

        <section
          aria-label="Accounting sections"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
        >
          {sections.map((section) => (
            <article
              key={section.number}
              className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex size-12 items-center justify-center rounded-xl border text-sm font-bold ${section.accent}`}
                  aria-hidden="true"
                >
                  {section.number}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.category}
                </span>
              </div>

              <h2 className="mt-6 text-lg font-semibold text-slate-900">
                {section.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {section.description}
              </p>

              <Link
                href={section.href}
                className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${section.button}`}
              >
                {section.action}
                <span className="ml-2" aria-hidden="true">
                  &rarr;
                </span>
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
