'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { createClient } from '@/utils/supabase/client';
import AccountingSidebar from '@/components/accounting/AccountingSidebar';

const dashboardPin = '9028';
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});
const compactCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

type InvoiceSummary = {
  id: string;
  invoice_date: string;
  grand_total: number;
};

type PurchaseSummary = {
  id: string;
  supplier_name: string;
  supplier_invoice_number: string;
  purchase_date: string;
  supplier_payable_total: number;
  total_outlay: number;
};

type DashboardActivity = {
  id: string;
  kind: 'invoice' | 'purchase';
  title: string;
  subtitle: string;
  date: string;
  amount: number;
};

function amountOrZero(value: unknown): number {
  const amount = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value);
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
}

export default function AccountingDashboardPage() {
  const [supabase] = useState(createClient);
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [purchases, setPurchases] = useState<PurchaseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isUnlocked) return;

    let isActive = true;

    async function loadDashboard() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [invoiceResult, purchaseResult] = await Promise.all([
          supabase.from('invoices').select('id, invoice_date, grand_total'),
          supabase
            .from('purchase_invoices')
            .select(
              'id, supplier_name, supplier_invoice_number, purchase_date, supplier_payable_total, total_outlay',
            ),
        ]);

        if (!isActive) return;

        const errors = [
          invoiceResult.error?.message,
          purchaseResult.error?.message,
        ].filter((message): message is string => Boolean(message));

        if (errors.length > 0) {
          setInvoices([]);
          setPurchases([]);
          setErrorMessage(`Unable to load accounting data: ${errors.join(' ')}`);
          return;
        }

        setInvoices(
          (invoiceResult.data ?? []).map((invoice) => ({
            ...invoice,
            grand_total: amountOrZero(invoice.grand_total),
          })),
        );
        setPurchases(
          (purchaseResult.data ?? []).map((purchase) => ({
            ...purchase,
            supplier_payable_total: amountOrZero(
              purchase.supplier_payable_total,
            ),
            total_outlay: amountOrZero(purchase.total_outlay),
          })),
        );
      } catch (error) {
        if (!isActive) return;
        setInvoices([]);
        setPurchases([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load accounting data. Please try again.',
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [isUnlocked, reloadKey, supabase]);

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

  const salesTotal = invoices.reduce(
    (total, invoice) => total + invoice.grand_total,
    0,
  );
  const purchaseTotal = purchases.reduce(
    (total, purchase) => total + purchase.total_outlay,
    0,
  );
  const receivablesEstimate = salesTotal;
  const payablesEstimate = purchases.reduce(
    (total, purchase) => total + purchase.supplier_payable_total,
    0,
  );
  const profitLossEstimate = salesTotal - purchaseTotal;

  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
    };
  });
  const monthlySales = new Map<string, number>();
  const monthlyPurchases = new Map<string, number>();

  for (const invoice of invoices) {
    const month = invoice.invoice_date.slice(0, 7);
    monthlySales.set(
      month,
      (monthlySales.get(month) ?? 0) + invoice.grand_total,
    );
  }
  for (const purchase of purchases) {
    const month = purchase.purchase_date.slice(0, 7);
    monthlyPurchases.set(
      month,
      (monthlyPurchases.get(month) ?? 0) + purchase.total_outlay,
    );
  }

  const chartData = monthKeys.map(({ key, label }) => ({
    month: label,
    sales: monthlySales.get(key) ?? 0,
    purchases: monthlyPurchases.get(key) ?? 0,
  }));
  const recentActivity: DashboardActivity[] = [
    ...invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      kind: 'invoice' as const,
      title: 'Customer invoice',
      subtitle: `Invoice ${invoice.id.slice(0, 8)}`,
      date: invoice.invoice_date,
      amount: invoice.grand_total,
    })),
    ...purchases.map((purchase) => ({
      id: `purchase-${purchase.id}`,
      kind: 'purchase' as const,
      title: purchase.supplier_name,
      subtitle: purchase.supplier_invoice_number,
      date: purchase.purchase_date,
      amount: purchase.supplier_payable_total,
    })),
  ]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 6);

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

  const unavailable = Boolean(errorMessage);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <AccountingSidebar />

      <main className="min-w-0 flex-1 lg:ml-64">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Accounting / Overview
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Good business starts with a clear picture.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Your sales, purchases, and outstanding estimates in one place.
              </p>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </header>

          {errorMessage && (
            <div
              role="alert"
              className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setReloadKey((key) => key + 1);
                }}
                className="shrink-0 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          <section aria-label="Financial overview" className="mb-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">Sales billed</p>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    Sales
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  {isLoading ? '—' : unavailable ? 'Unavailable' : formatCurrency(salesTotal)}
                </p>
                <p className="mt-1 text-xs text-slate-500">All recorded invoices</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">Purchase outlay</p>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    Purchases
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  {isLoading ? '—' : unavailable ? 'Unavailable' : formatCurrency(purchaseTotal)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Goods, tax, freight and charges</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">Estimated profit / loss</p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      profitLossEstimate >= 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {profitLossEstimate >= 0 ? 'Surplus estimate' : 'Shortfall estimate'}
                  </span>
                </div>
                <p
                  className={`mt-4 text-2xl font-bold tracking-tight ${
                    profitLossEstimate >= 0 ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {isLoading ? '—' : unavailable ? 'Unavailable' : formatCurrency(profitLossEstimate)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Sales less recorded purchase outlay</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">Estimated receivables</p>
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                    Customer dues
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  {isLoading ? '—' : unavailable ? 'Unavailable' : formatCurrency(receivablesEstimate)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Assumes all billed invoices unpaid</p>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-600">Estimated payables</p>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                    Supplier dues
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
                  {isLoading ? '—' : unavailable ? 'Unavailable' : formatCurrency(payablesEstimate)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Assumes all purchase bills unpaid</p>
              </article>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Estimates assume all recorded invoices and purchase bills are unpaid.
              Profit / loss is sales minus purchase outlay only; payments, inventory,
              and other expenses are not tracked.
            </p>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
            <section
              aria-labelledby="trends-heading"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 id="trends-heading" className="text-base font-semibold text-slate-950">
                    Sales vs. purchase trends
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Recorded totals over the last six months</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Monthly
                </span>
              </div>
              {isLoading ? (
                <div
                  role="status"
                  className="flex h-72 items-center justify-center text-sm text-slate-500"
                >
                  Loading trends...
                </div>
              ) : unavailable ? (
                <div className="flex h-72 items-center justify-center text-sm text-slate-500">
                  Trends are unavailable until the data can be loaded.
                </div>
              ) : (
                <div className="h-72 w-full" aria-label="Monthly sales and purchases bar chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickFormatter={formatCompactCurrency}
                        width={72}
                      />
                      <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{
                          borderRadius: 10,
                          borderColor: '#e2e8f0',
                          boxShadow: '0 8px 20px rgba(15, 23, 42, .08)',
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                      />
                      <Bar
                        dataKey="sales"
                        name="Sales"
                        fill="#2563eb"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={34}
                      />
                      <Bar
                        dataKey="purchases"
                        name="Purchases"
                        fill="#f97316"
                        radius={[5, 5, 0, 0]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section
              aria-labelledby="activity-heading"
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 id="activity-heading" className="text-base font-semibold text-slate-950">
                    Recent activity
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Latest invoices and purchase bills</p>
                </div>
                <Link
                  href="/admin/accounting/reports"
                  className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-900"
                >
                  View reports
                </Link>
              </div>
              {isLoading ? (
                <div role="status" className="flex h-56 items-center justify-center text-sm text-slate-500">
                  Loading activity...
                </div>
              ) : unavailable ? (
                <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                  Activity is unavailable until the data can be loaded.
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-slate-700">No activity yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    New invoices and purchase bills will appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          activity.kind === 'invoice'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}
                        aria-hidden="true"
                      >
                        {activity.kind === 'invoice' ? 'I' : 'P'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {activity.title}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              activity.kind === 'invoice'
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {activity.kind === 'invoice'
                              ? 'Receivable estimate'
                              : 'Payable estimate'}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {activity.subtitle} · {formatDate(activity.date)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-800">
                        {formatCurrency(activity.amount)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
