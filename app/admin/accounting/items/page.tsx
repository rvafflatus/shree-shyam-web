'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client';

type Item = {
  id: string;
  name: string;
  hsn_sac: string | null;
  purchase_price: number | null;
  selling_price: number | null;
  gst_rate: number | null;
};

export default function ItemsPage() {
  const [supabase] = useState(createClient);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadItems() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, name, hsn_sac, purchase_price, selling_price, gst_rate')
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

  async function handleItemUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingItem) return;

    setIsSaving(true);
    setActionError('');

    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: editingItem.name.trim(),
          hsn_sac: editingItem.hsn_sac?.trim() || null,
          purchase_price: editingItem.purchase_price,
          selling_price: editingItem.selling_price,
          gst_rate: editingItem.gst_rate,
        })
        .eq('id', editingItem.id)
        .select('id')
        .single();

      if (error) {
        setActionError(`Unable to update item: ${error.message}`);
        return;
      }

      setEditingItem(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to update item. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleItemDelete(item: Item) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    setDeletingId(item.id);
    setActionError('');

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', item.id)
        .select('id')
        .single();
      if (error) {
        setActionError(`Unable to delete item: ${error.message}`);
        return;
      }

      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to delete item. Please try again.',
      );
    } finally {
      setDeletingId(null);
    }
  }

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

        {actionError && (
          <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {actionError}
          </p>
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
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Item</th>
                    <th scope="col" className="px-4 py-3 font-semibold">HSN / SAC</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Purchase Price</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Selling Price</th>
                    <th scope="col" className="px-4 py-3 font-semibold">GST Rate</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.hsn_sac || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.purchase_price == null ? '—' : `₹${item.purchase_price.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.selling_price == null ? '—' : `₹${item.selling_price.toFixed(2)}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.gst_rate == null ? '—' : `${item.gst_rate}%`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActionError('');
                              setEditingItem({ ...item });
                            }}
                            className="font-medium text-blue-700 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => void handleItemDelete(item)}
                            className="font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-item-title"
              className="my-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-xl"
            >
              <h2 id="edit-item-title" className="text-xl font-semibold text-slate-900">
                Edit Item
              </h2>
              <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleItemUpdate}>
                {([
                  ['name', 'Name', 'text'],
                  ['hsn_sac', 'HSN / SAC', 'text'],
                  ['purchase_price', 'Purchase Price (₹)', 'number'],
                  ['selling_price', 'Selling Price (₹)', 'number'],
                  ['gst_rate', 'GST Rate (%)', 'number'],
                ] as const).map(([field, label, type]) => (
                  <div key={field}>
                    <label htmlFor={`edit-item-${field}`} className="mb-1 block text-sm font-medium text-slate-700">
                      {label}
                    </label>
                    <input
                      id={`edit-item-${field}`}
                      type={type}
                      min={type === 'number' ? '0' : undefined}
                      step={type === 'number' && field !== 'gst_rate' ? '0.01' : undefined}
                      required={field === 'name'}
                      value={editingItem[field] ?? ''}
                      onChange={(event) =>
                        setEditingItem((current) => {
                          if (!current) return current;
                          const value =
                            type === 'number'
                              ? event.target.value === ''
                                ? null
                                : Number(event.target.value)
                              : event.target.value;
                          return { ...current, [field]: value };
                        })
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                ))}
                {actionError && (
                  <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {actionError}
                  </p>
                )}
                <div className="flex justify-end gap-3 sm:col-span-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setEditingItem(null)}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
