'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type PurchaseInvoice = {
  id: string;
  supplier_name: string;
  supplier_invoice_number: string;
  purchase_date: string;
  transporter_name: string | null;
  gr_number: string | null;
  total_transport_amount: number;
  rcm_applicable: boolean;
  rcm_gst_rate: number;
  rcm_gst_amount: number;
  transport_payment_status: 'TO PAY' | 'PAID';
  supplier_payable_total: number;
  total_outlay: number;
};

function formatCurrency(value: number) {
  return `₹${value.toFixed(2)}`;
}

export default function PurchasesPage() {
  const [supabase] = useState(createClient);
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadPurchases() {
      try {
        const { data, error } = await supabase
          .from('purchase_invoices')
          .select(
            'id, supplier_name, supplier_invoice_number, purchase_date, transporter_name, gr_number, total_transport_amount, rcm_applicable, rcm_gst_rate, rcm_gst_amount, transport_payment_status, supplier_payable_total, total_outlay',
          )
          .order('purchase_date', { ascending: false });

        if (!isActive) return;
        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setPurchases(data ?? []);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load purchase entries. Please try again.',
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadPurchases();

    return () => {
      isActive = false;
    };
  }, [reloadKey, supabase]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/accounting"
          className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          &larr; Accounting Home
        </Link>

        <header className="mb-6 mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Purchasing &amp; Transport Ledger
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Purchase Entries
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Review supplier bills, bilty charges, RCM liability, and transport payment status.
            </p>
          </div>
          <Link
            href="/admin/accounting/purchases/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Add purchase entry
          </Link>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setIsLoading(true);
                setReloadKey((key) => key + 1);
              }}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div role="status" className="flex min-h-48 items-center justify-center text-sm text-slate-600">
              Loading purchase entries...
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
              <p className="font-medium text-slate-900">No purchase entries found</p>
              <p className="mt-1 text-sm text-slate-500">
                Saved supplier invoices and transport details will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Date / Bill</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Supplier</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Transporter / G.R.</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Transport Total</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Transport Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">RCM Rate / GST</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Supplier Payable</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Total Outlay</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">
                        <div>{purchase.purchase_date}</div>
                        <div className="text-xs text-slate-500">{purchase.supplier_invoice_number}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{purchase.supplier_name}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{purchase.transporter_name || '—'}</div>
                        <div className="text-xs text-slate-500">{purchase.gr_number || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatCurrency(purchase.total_transport_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          purchase.transport_payment_status === 'PAID'
                            ? 'bg-green-50 text-green-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}>
                          {purchase.transport_payment_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {purchase.rcm_applicable
                          ? `${purchase.rcm_gst_rate}% · ${formatCurrency(purchase.rcm_gst_amount)}`
                          : 'Not applicable'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {formatCurrency(purchase.supplier_payable_total)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatCurrency(purchase.total_outlay)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
