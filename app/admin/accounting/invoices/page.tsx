'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client';
import { splitGstByPartyState } from '@/utils/accounting/gst';

type InvoiceLine = {
  item_id: string;
  description: string;
  hsn_sac: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
};

type Invoice = {
  id: string;
  invoice_date: string;
  party_id: string;
  party_name: string;
  line_items: InvoiceLine[];
  subtotal: number;
  tax_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  transport_charges: number;
  grand_total: number;
};

type Party = { id: string; name: string; state: string | null };

function asInvoiceLine(value: unknown): InvoiceLine {
  if (typeof value !== 'object' || value === null) {
    return { item_id: '', description: '', hsn_sac: '', quantity: 1, unit_price: 0, tax_rate: 0 };
  }

  const line = value as Record<string, unknown>;
  return {
    item_id: typeof line.item_id === 'string' ? line.item_id : '',
    description: typeof line.description === 'string' ? line.description : '',
    hsn_sac: typeof line.hsn_sac === 'string' ? line.hsn_sac : '',
    quantity: typeof line.quantity === 'number' ? line.quantity : 1,
    unit_price: typeof line.unit_price === 'number' ? line.unit_price : 0,
    tax_rate: typeof line.tax_rate === 'number' ? line.tax_rate : 0,
  };
}

function amount(value: number) {
  return `₹${value.toFixed(2)}`;
}

export default function InvoicesPage() {
  const [supabase] = useState(createClient);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadInvoices() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [invoiceResult, partyResult] = await Promise.all([
          supabase
            .from('invoices')
            .select('id, invoice_date, party_id, line_items, subtotal, tax_amount, cgst_amount, sgst_amount, igst_amount, transport_charges, grand_total')
            .order('invoice_date', { ascending: false }),
          supabase.from('parties').select('id, name, state'),
        ]);

        if (!active) return;
        if (invoiceResult.error || partyResult.error) {
          setErrorMessage(
            [invoiceResult.error?.message, partyResult.error?.message]
              .filter(Boolean)
              .join(' '),
          );
          return;
        }

        const loadedParties = partyResult.data ?? [];
        const names = new Map(loadedParties.map((party) => [party.id, party.name]));
        setParties(loadedParties);
        setInvoices(
          (invoiceResult.data ?? []).map((row) => ({
            ...row,
            party_name: names.get(row.party_id) ?? 'Party not found',
            line_items: Array.isArray(row.line_items) ? row.line_items.map(asInvoiceLine) : [],
          })),
        );
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load invoices. Please try again.',
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadInvoices();

    return () => {
      active = false;
    };
  }, [reloadKey, supabase]);

  function updateLine(index: number, patch: Partial<InvoiceLine>) {
    setEditingInvoice((current) =>
      current
        ? {
            ...current,
            line_items: current.line_items.map((line, lineIndex) =>
              lineIndex === index ? { ...line, ...patch } : line,
            ),
          }
        : current,
    );
  }

  const subtotal =
    editingInvoice?.line_items.reduce(
      (sum, line) => sum + line.quantity * line.unit_price,
      0,
    ) ?? 0;
  const tax =
    editingInvoice?.line_items.reduce(
      (sum, line) => sum + (line.quantity * line.unit_price * line.tax_rate) / 100,
      0,
    ) ?? 0;
  const selectedPartyState = parties.find(
    (party) => party.id === editingInvoice?.party_id,
  )?.state;
  const gstSplit = splitGstByPartyState(tax, selectedPartyState);
  const total = subtotal + tax + (editingInvoice?.transport_charges ?? 0);

  async function saveInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingInvoice) return;
    setErrorMessage('');

    if (!editingInvoice.party_id || editingInvoice.line_items.length === 0) {
      setErrorMessage('Select a party and keep at least one invoice item.');
      return;
    }
    if (
      editingInvoice.line_items.some(
        (line) =>
          !line.description.trim() ||
          !Number.isFinite(line.quantity) ||
          line.quantity <= 0 ||
          !Number.isFinite(line.unit_price) ||
          line.unit_price < 0 ||
          !Number.isFinite(line.tax_rate) ||
          line.tax_rate < 0,
      ) ||
      editingInvoice.transport_charges < 0
    ) {
      setErrorMessage('Check the invoice item quantities, prices, GST rates, and transport charge.');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({
          invoice_date: editingInvoice.invoice_date,
          party_id: editingInvoice.party_id,
          line_items: editingInvoice.line_items.map((line) => ({
            ...line,
            line_total: Number((line.quantity * line.unit_price).toFixed(2)),
            tax_amount: Number(
              ((line.quantity * line.unit_price * line.tax_rate) / 100).toFixed(2),
            ),
          })),
          subtotal: Number(subtotal.toFixed(2)),
          cgst_amount: gstSplit.cgst_amount,
          sgst_amount: gstSplit.sgst_amount,
          igst_amount: gstSplit.igst_amount,
          tax_amount: gstSplit.tax_amount,
          transport_charges: Number(editingInvoice.transport_charges.toFixed(2)),
          grand_total: Number(total.toFixed(2)),
        })
        .eq('id', editingInvoice.id)
        .select('id')
        .single();

      if (error) {
        setErrorMessage(`Invoice was not updated: ${error.message}`);
        return;
      }
      if (!data) {
        setErrorMessage('Invoice was not updated because no matching record was found.');
        return;
      }

      setEditingInvoice(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to update the invoice.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteInvoice(invoice: Invoice) {
    if (!window.confirm('Delete this invoice? This action cannot be undone.')) return;

    setDeletingId(invoice.id);
    setErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id)
        .select('id')
        .single();

      if (error) {
        setErrorMessage(`Invoice was not deleted: ${error.message}`);
        return;
      }
      if (!data) {
        setErrorMessage('Invoice was not deleted because no matching record was found.');
        return;
      }

      setInvoices((current) => current.filter((entry) => entry.id !== invoice.id));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to delete the invoice.',
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
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Sales</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Manage Invoices
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Edit or delete saved invoices using the Actions column.
            </p>
          </div>
          <Link
            href="/admin/accounting/invoices/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Create New Invoice
          </Link>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="shrink-0 font-semibold underline"
            >
              Reload
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {isLoading ? (
            <p role="status" className="flex min-h-48 items-center justify-center text-sm text-slate-600">
              Loading invoices...
            </p>
          ) : invoices.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="font-medium text-slate-900">No saved invoices found</p>
              <Link
                href="/admin/accounting/invoices/new"
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Subtotal</th>
                    <th scope="col" className="px-4 py-3 font-semibold">GST</th>
                    <th scope="col" className="px-4 py-3 font-semibold">CGST</th>
                    <th scope="col" className="px-4 py-3 font-semibold">SGST</th>
                    <th scope="col" className="px-4 py-3 font-semibold">IGST</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Transport</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Grand Total</th>
                    <th scope="col" className="sticky right-0 bg-slate-50 px-4 py-3 font-semibold shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.5)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{invoice.invoice_date}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{invoice.party_name}</td>
                      <td className="px-4 py-3 text-slate-700">{amount(invoice.subtotal)}</td>
                      <td className="px-4 py-3 text-slate-700">{amount(invoice.tax_amount)}</td>
                      <td className="px-4 py-3 text-slate-700">{amount(invoice.cgst_amount)}</td>
                      <td className="px-4 py-3 text-slate-700">{amount(invoice.sgst_amount)}</td>
                      <td className="px-4 py-3 text-slate-700">{amount(invoice.igst_amount)}</td>
                      <td className="px-4 py-3 text-slate-700">{amount(invoice.transport_charges)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{amount(invoice.grand_total)}</td>
                      <td className="sticky right-0 whitespace-nowrap bg-white px-4 py-3 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.5)]">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setErrorMessage('');
                              setEditingInvoice({ ...invoice });
                            }}
                            className="rounded px-2 py-1 font-semibold text-blue-700 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === invoice.id}
                            onClick={() => void deleteInvoice(invoice)}
                            className="rounded px-2 py-1 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === invoice.id ? 'Deleting...' : 'Delete'}
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

        {editingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-invoice-title"
              className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            >
              <h2 id="edit-invoice-title" className="text-xl font-semibold text-slate-900">Edit Invoice</h2>
              <form className="mt-5 space-y-5" onSubmit={saveInvoice}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-invoice-party" className="mb-1 block text-sm font-medium text-slate-700">Customer / Party</label>
                    <select
                      id="edit-invoice-party"
                      required
                      value={editingInvoice.party_id}
                      onChange={(event) =>
                        setEditingInvoice((current) => current ? { ...current, party_id: event.target.value } : current)
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="">Select party</option>
                      {parties.map((party) => (
                        <option key={party.id} value={party.id}>{party.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-invoice-date" className="mb-1 block text-sm font-medium text-slate-700">Invoice Date</label>
                    <input
                      id="edit-invoice-date"
                      type="date"
                      required
                      value={editingInvoice.invoice_date}
                      onChange={(event) =>
                        setEditingInvoice((current) => current ? { ...current, invoice_date: event.target.value } : current)
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                {editingInvoice.line_items.map((line, index) => (
                  <fieldset key={`${editingInvoice.id}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <legend className="px-1 text-sm font-medium text-slate-700">Item {index + 1}</legend>
                    <div className="sm:col-span-2">
                      <label htmlFor={`edit-description-${index}`} className="mb-1 block text-xs font-medium text-slate-600">Description</label>
                      <input
                        id={`edit-description-${index}`}
                        required
                        value={line.description}
                        onChange={(event) => updateLine(index, { description: event.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-quantity-${index}`} className="mb-1 block text-xs font-medium text-slate-600">Quantity</label>
                      <input
                        id={`edit-quantity-${index}`}
                        type="number"
                        min="0.001"
                        step="0.001"
                        required
                        value={line.quantity}
                        onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-price-${index}`} className="mb-1 block text-xs font-medium text-slate-600">Unit Price (₹)</label>
                      <input
                        id={`edit-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={line.unit_price}
                        onChange={(event) => updateLine(index, { unit_price: Number(event.target.value) })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-tax-${index}`} className="mb-1 block text-xs font-medium text-slate-600">GST Rate (%)</label>
                      <input
                        id={`edit-tax-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={line.tax_rate}
                        onChange={(event) => updateLine(index, { tax_rate: Number(event.target.value) })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-hsn-${index}`} className="mb-1 block text-xs font-medium text-slate-600">HSN / SAC</label>
                      <input
                        id={`edit-hsn-${index}`}
                        value={line.hsn_sac}
                        onChange={(event) => updateLine(index, { hsn_sac: event.target.value })}
                        className="w-full rounded-md border border-slate-300 px-3 py-2"
                      />
                    </div>
                    {editingInvoice.line_items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingInvoice((current) => current ? {
                            ...current,
                            line_items: current.line_items.filter((_, lineIndex) => lineIndex !== index),
                          } : current)
                        }
                        className="self-end text-left text-sm font-medium text-red-700 hover:text-red-900"
                      >
                        Remove item
                      </button>
                    )}
                  </fieldset>
                ))}

                <div className="max-w-sm">
                  <label htmlFor="edit-transport" className="mb-1 block text-sm font-medium text-slate-700">Freight / Transport (₹)</label>
                  <input
                    id="edit-transport"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingInvoice.transport_charges}
                    onChange={(event) =>
                      setEditingInvoice((current) => current ? {
                        ...current,
                        transport_charges: Number(event.target.value) || 0,
                      } : current)
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>

                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                  <p>Subtotal: {amount(subtotal)}</p>
                  <p>GST: {amount(tax)}</p>
                  <p>CGST: {amount(gstSplit.cgst_amount)}</p>
                  <p>SGST: {amount(gstSplit.sgst_amount)}</p>
                  <p>IGST: {amount(gstSplit.igst_amount)}</p>
                  <p>Transport: {amount(editingInvoice.transport_charges)}</p>
                  <p className="mt-2 text-base font-bold text-slate-900">Grand Total: {amount(total)}</p>
                </div>

                {errorMessage && (
                  <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{errorMessage}</p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setEditingInvoice(null)}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
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
