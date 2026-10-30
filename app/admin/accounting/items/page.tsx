'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Item = {
  id: string;
  name: string;
  hsn_sac: string | null;
  selling_price: number | null;
  gst_rate: number | null;
};

export default function ItemsPage() {
  const [supabase] = useState(createClient);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadItems() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, name, hsn_sac, selling_price, gst_rate')
          .order('name');

        if (!isActive) return;
        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setItems(data ?? []);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load items. Please try again.',
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadItems();

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
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">
              Catalog
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Items &amp; Products
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage the products and services available for your invoices.
            </p>
          </div>
          <Link
            href="/admin/accounting/items/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800"
          >
            Add new item
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
              onClick={() => setReloadKey((key) => key + 1)}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <div
              role="status"
              className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-600"
            >
              <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-violet-700" />
              Loading items...
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
              <p className="font-medium text-slate-900">No items found</p>
              <p className="mt-1 text-sm text-slate-500">
                Add an item or service to start building your catalog.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Item</th>
                    <th scope="col" className="px-4 py-3 font-semibold">HSN / SAC</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Selling Price</th>
                    <th scope="col" className="px-4 py-3 font-semibold">GST Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.hsn_sac || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.selling_price == null ? '—' : `₹${item.selling_price.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.gst_rate == null ? '—' : `${item.gst_rate}%`}
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
