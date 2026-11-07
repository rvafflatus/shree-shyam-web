'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getPartyState, splitGstByPartyState } from '@/utils/accounting/gst';

type DataRow = Record<string, unknown>;
type TabKey = 'invoices' | 'parties' | 'items' | 'purchases';
type InvoiceLine = {
  item_id: string;
  description: string;
  hsn_sac: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
};
type EditableInvoice = {
  id: string;
  party_id: string;
  invoice_date: string;
  line_items: InvoiceLine[];
  transport_charges: number;
};

const tabs: { id: TabKey; label: string; filename: string }[] = [
  { id: 'invoices', label: 'Invoices', filename: 'invoices_report.csv' },
  { id: 'parties', label: 'Parties', filename: 'parties_list.csv' },
  { id: 'items', label: 'Items', filename: 'items_master.csv' },
  { id: 'purchases', label: 'Purchases & Transport', filename: 'purchase_transport_report.csv' },
];

function toRows(data: unknown): DataRow[] {
  if (!Array.isArray(data)) return [];

  return data.filter(
    (row): row is DataRow =>
      typeof row === 'object' && row !== null && !Array.isArray(row),
  );
}

function getJoinedPartyName(value: unknown): string | undefined {
  const party = Array.isArray(value) ? value[0] : value;
  if (typeof party !== 'object' || party === null) return undefined;

  const name = (party as DataRow).name;
  return typeof name === 'string' ? name : undefined;
}

function getEditableInvoice(row: DataRow): EditableInvoice | null {
  if (typeof row.id !== 'string') return null;

  const lineItems = Array.isArray(row.line_items)
    ? row.line_items.map((value): InvoiceLine => {
        const line = typeof value === 'object' && value !== null ? (value as DataRow) : {};
        return {
          item_id: typeof line.item_id === 'string' ? line.item_id : '',
          description: typeof line.description === 'string' ? line.description : '',
          hsn_sac: typeof line.hsn_sac === 'string' ? line.hsn_sac : '',
          quantity: typeof line.quantity === 'number' ? line.quantity : 1,
          unit_price: typeof line.unit_price === 'number' ? line.unit_price : 0,
          tax_rate: typeof line.tax_rate === 'number' ? line.tax_rate : 0,
        };
      })
    : [];

  return {
    id: row.id,
    party_id: typeof row.party_id === 'string' ? row.party_id : '',
    invoice_date:
      typeof row.invoice_date === 'string'
        ? row.invoice_date.slice(0, 10)
        : '',
    line_items: lineItems,
    transport_charges:
      typeof row.transport_charges === 'number' ? row.transport_charges : 0,
  };
}

function getColumns(rows: DataRow[]): string[] {
  return [...new Set(rows.flatMap((row) => Object.keys(row)))];
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatColumnName(column: string): string {
  return column
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function exportToCsv(rows: DataRow[], filename: string) {
  const columns = getColumns(rows);
  const escapeCell = (value: unknown) => {
    const text =
      value === null || value === undefined
        ? ''
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);

    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = [
    columns.map(escapeCell).join(','),
    ...rows.map((row) => columns.map((column) => escapeCell(row[column])).join(',')),
  ].join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function AccountingReportsPage() {
  const [supabase] = useState(createClient);
  const [invoices, setInvoices] = useState<DataRow[]>([]);
  const [parties, setParties] = useState<DataRow[]>([]);
  const [items, setItems] = useState<DataRow[]>([]);
  const [purchases, setPurchases] = useState<DataRow[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('invoices');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [editingInvoice, setEditingInvoice] = useState<EditableInvoice | null>(null);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [invoiceResult, partyResult, itemResult, purchaseResult] = await Promise.all([
          supabase.from('invoices').select('*, parties(name)'),
          supabase.from('parties').select('*'),
          supabase.from('items').select('*'),
          supabase
            .from('purchase_invoices')
            .select(
              'purchase_date, supplier_invoice_number, supplier_name, transporter_name, gr_number, freight_charge, handling_charge, toll_charge, other_charge, total_transport_amount, cgst_amount, sgst_amount, igst_amount, tax_amount, transport_payment_status, rcm_applicable, rcm_gst_rate, rcm_gst_amount, supplier_payable_total, total_outlay',
            )
            .order('purchase_date', { ascending: false }),
        ]);

        let invoiceData = invoiceResult.data;
        let invoiceError = invoiceResult.error;

        if (invoiceError) {
          const fallbackResult = await supabase.from('invoices').select('*');
          invoiceData = fallbackResult.data;
          invoiceError = fallbackResult.error;
        }

        if (!isActive) return;

        const partyRows: DataRow[] = toRows(partyResult.data).map((party): DataRow => ({
          ...party,
          state: getPartyState(
            typeof party.state === 'string' ? party.state : null,
            typeof party.address === 'string' ? party.address : null,
          ),
        }));
        const partyNames = new Map(
          partyRows.map((party) => [party.id, party.name]),
        );
        const invoiceRows = toRows(invoiceData).map((invoice) => {
          const row = { ...invoice };
          const joinedPartyName = getJoinedPartyName(row.parties);
          delete row.parties;

          const partyId = row.party_id;
          const fallbackPartyName =
            typeof partyId === 'string' ? partyNames.get(partyId) : undefined;
          const partyName = joinedPartyName ?? fallbackPartyName;

          return partyName ? { ...row, party_name: partyName } : row;
        });

        setInvoices(invoiceRows);
        setParties(partyRows);
        setItems(toRows(itemResult.data));
        setPurchases(toRows(purchaseResult.data));

        const errors = [
          invoiceError?.message,
          partyResult.error?.message,
          itemResult.error?.message,
          purchaseResult.error?.message,
        ].filter((message): message is string => Boolean(message));

        if (errors.length > 0) {
          setErrorMessage(`Unable to load all reports: ${errors.join(' ')}`);
        }
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load accounting reports. Please try again.',
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadReports();

    return () => {
      isActive = false;
    };
  }, [reloadKey, supabase]);

  const editSubtotal =
    editingInvoice?.line_items.reduce(
      (sum, line) => sum + line.quantity * line.unit_price,
      0,
    ) ?? 0;
  const editTaxAmount =
    editingInvoice?.line_items.reduce(
      (sum, line) =>
        sum + (line.quantity * line.unit_price * line.tax_rate) / 100,
      0,
    ) ?? 0;
  const editGrandTotal =
    editSubtotal + editTaxAmount + (editingInvoice?.transport_charges ?? 0);
  const editPartyState = parties.find(
    (party) => party.id === editingInvoice?.party_id,
  )?.state;
  const editGstSplit = splitGstByPartyState(editTaxAmount, typeof editPartyState === 'string' ? editPartyState : null);

  function updateInvoiceLine(index: number, patch: Partial<InvoiceLine>) {
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

  async function handleInvoiceUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingInvoice) return;
    setActionError('');

    if (!editingInvoice.party_id || editingInvoice.line_items.length === 0) {
      setActionError('Select a customer and keep at least one invoice line.');
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
      !Number.isFinite(editingInvoice.transport_charges) ||
      editingInvoice.transport_charges < 0
    ) {
      setActionError('Check that each item, quantity, unit price, GST rate, and transport charge is valid.');
      return;
    }

    setIsSavingInvoice(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          party_id: editingInvoice.party_id,
          invoice_date: editingInvoice.invoice_date,
          line_items: editingInvoice.line_items.map((line) => ({
            ...line,
            line_total: Number((line.quantity * line.unit_price).toFixed(2)),
            tax_amount: Number(
              ((line.quantity * line.unit_price * line.tax_rate) / 100).toFixed(2),
            ),
          })),
          subtotal: Number(editSubtotal.toFixed(2)),
          cgst_amount: editGstSplit.cgst_amount,
          sgst_amount: editGstSplit.sgst_amount,
          igst_amount: editGstSplit.igst_amount,
          tax_amount: editGstSplit.tax_amount,
          transport_charges: Number(editingInvoice.transport_charges.toFixed(2)),
          grand_total: Number(editGrandTotal.toFixed(2)),
        })
        .eq('id', editingInvoice.id)
        .select('id')
        .single();

      if (error) {
        setActionError(`Unable to update invoice: ${error.message}`);
        return;
      }

      setEditingInvoice(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to update invoice. Please try again.',
      );
    } finally {
      setIsSavingInvoice(false);
    }
  }

  async function handleInvoiceDelete(invoice: DataRow) {
    const invoiceId = invoice.id;
    if (typeof invoiceId !== 'string') {
      setActionError('This invoice does not have a usable record ID.');
      return;
    }
    if (!window.confirm('Delete this invoice? This cannot be undone.')) return;

    setDeletingInvoiceId(invoiceId);
    setActionError('');
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .select('id')
        .single();

      if (error) {
        setActionError(`Unable to delete invoice: ${error.message}`);
        return;
      }

      setInvoices((current) => current.filter((entry) => entry.id !== invoiceId));
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to delete invoice. Please try again.',
      );
    } finally {
      setDeletingInvoiceId(null);
    }
  }

  const reportData: Record<TabKey, DataRow[]> = { invoices, parties, items, purchases };
  const selectedRows = reportData[activeTab];
  const selectedTab = tabs.find((tab) => tab.id === activeTab);
  const columns = getColumns(selectedRows);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/accounting"
          className="mb-6 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          &larr; Accounting Home
        </Link>
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Accounting
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Reports &amp; data
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Review and export invoices, parties, items, and purchase transport/RCM records.
          </p>
        </header>

        <section
          aria-label="Accounting report counts"
          className="mb-6 grid gap-4 sm:grid-cols-3"
        >
          {tabs.map((tab) => (
            <div key={tab.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{tab.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {isLoading ? '—' : reportData[tab.id].length}
              </p>
              <p className="mt-1 text-xs text-slate-500">Records</p>
            </div>
          ))}
        </section>

        {actionError && (
          <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {actionError}
          </p>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 sm:px-6">
            <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div
                role="tablist"
                aria-label="Accounting report sections"
                className="flex gap-1 overflow-x-auto"
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    id={`${tab.id}-tab`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 text-xs text-slate-500">
                      {isLoading ? '' : reportData[tab.id].length}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => selectedTab && exportToCsv(selectedRows, selectedTab.filename)}
                disabled={isLoading || selectedRows.length === 0}
                className="inline-flex items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export to CSV
              </button>
            </div>
          </div>

          <div
            id={`${activeTab}-panel`}
            role="tabpanel"
            aria-labelledby={`${activeTab}-tab`}
            className="p-4 sm:p-6"
          >
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

            {isLoading ? (
              <div
                role="status"
                className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-600"
              >
                <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700" />
                Loading accounting data...
              </div>
            ) : selectedRows.length === 0 ? (
              <div className="flex min-h-48 flex-col items-center justify-center text-center">
                <p className="font-medium text-slate-900">No {activeTab} found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Records will appear here once they have been added.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      {columns.map((column) => (
                        <th key={column} scope="col" className="px-4 py-3 font-semibold">
                          {formatColumnName(column)}
                        </th>
                      ))}
                      {activeTab === 'invoices' && (
                        <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRows.map((row, index) => (
                      <tr key={String(row.id ?? index)} className="hover:bg-slate-50">
                        {columns.map((column) => (
                          <td
                            key={column}
                            className="max-w-xs px-4 py-3 text-slate-700"
                          >
                            <span className="block truncate">{formatCell(row[column])}</span>
                          </td>
                        ))}
                        {activeTab === 'invoices' && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={!getEditableInvoice(row)}
                                onClick={() => {
                                  const invoice = getEditableInvoice(row);
                                  if (!invoice) return;
                                  setActionError('');
                                  setEditingInvoice(invoice);
                                }}
                                className="font-medium text-blue-700 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={typeof row.id !== 'string' || deletingInvoiceId === row.id}
                                onClick={() => void handleInvoiceDelete(row)}
                                className="font-medium text-red-700 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingInvoiceId === row.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {editingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-invoice-title"
              className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            >
              <h2 id="edit-invoice-title" className="text-xl font-semibold text-slate-900">
                Edit Invoice
              </h2>
              <form className="mt-5 space-y-5" onSubmit={handleInvoiceUpdate}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="edit-invoice-party" className="mb-1 block text-sm font-medium text-slate-700">
                      Customer / Party
                    </label>
                    <select
                      id="edit-invoice-party"
                      required
                      value={editingInvoice.party_id}
                      onChange={(event) =>
                        setEditingInvoice((current) =>
                          current ? { ...current, party_id: event.target.value } : current,
                        )
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2"
                    >
                      <option value="">Select party</option>
                      {parties.map((party) => (
                        <option key={String(party.id)} value={String(party.id)}>
                          {String(party.name ?? 'Unnamed party')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-invoice-date" className="mb-1 block text-sm font-medium text-slate-700">
                      Invoice Date
                    </label>
                    <input
                      id="edit-invoice-date"
                      type="date"
                      required
                      value={editingInvoice.invoice_date}
                      onChange={(event) =>
                        setEditingInvoice((current) =>
                          current ? { ...current, invoice_date: event.target.value } : current,
                        )
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-slate-900">Invoice items</h3>
                  {editingInvoice.line_items.map((line, index) => (
                    <div key={`${editingInvoice.id}-${index}`} className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="sm:col-span-2">
                        <label htmlFor={`edit-invoice-description-${index}`} className="mb-1 block text-xs font-medium text-slate-600">
                          Description
                        </label>
                        <input
                          id={`edit-invoice-description-${index}`}
                          required
                          value={line.description}
                          onChange={(event) => updateInvoiceLine(index, { description: event.target.value })}
                          className="w-full rounded-md border border-slate-300 px-3 py-2"
                        />
                      </div>
                      {([
                        ['quantity', 'Quantity'],
                        ['unit_price', 'Unit Price (₹)'],
                        ['tax_rate', 'GST Rate (%)'],
                      ] as const).map(([field, label]) => (
                        <div key={field}>
                          <label htmlFor={`edit-invoice-${field}-${index}`} className="mb-1 block text-xs font-medium text-slate-600">
                            {label}
                          </label>
                          <input
                            id={`edit-invoice-${field}-${index}`}
                            type="number"
                            min={field === 'quantity' ? '0.001' : '0'}
                            step={field === 'quantity' ? '0.001' : '0.01'}
                            required
                            value={line[field]}
                            onChange={(event) => {
                              const value = Number(event.target.value);
                              if (field === 'quantity') {
                                updateInvoiceLine(index, { quantity: value });
                              } else if (field === 'unit_price') {
                                updateInvoiceLine(index, { unit_price: value });
                              } else {
                                updateInvoiceLine(index, { tax_rate: value });
                              }
                            }}
                            className="w-full rounded-md border border-slate-300 px-3 py-2"
                          />
                        </div>
                      ))}
                      <div>
                        <label htmlFor={`edit-invoice-hsn-${index}`} className="mb-1 block text-xs font-medium text-slate-600">
                          HSN / SAC
                        </label>
                        <input
                          id={`edit-invoice-hsn-${index}`}
                          value={line.hsn_sac}
                          onChange={(event) => updateInvoiceLine(index, { hsn_sac: event.target.value })}
                          className="w-full rounded-md border border-slate-300 px-3 py-2"
                        />
                      </div>
                      {editingInvoice.line_items.length > 1 && (
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingInvoice((current) =>
                                current
                                  ? {
                                      ...current,
                                      line_items: current.line_items.filter(
                                        (_, lineIndex) => lineIndex !== index,
                                      ),
                                    }
                                  : current,
                              )
                            }
                            className="text-sm font-medium text-red-700 hover:text-red-900"
                          >
                            Remove item
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingInvoice((current) =>
                        current
                          ? {
                              ...current,
                              line_items: [
                                ...current.line_items,
                                { item_id: '', description: '', hsn_sac: '', quantity: 1, unit_price: 0, tax_rate: 0 },
                              ],
                            }
                          : current,
                      )
                    }
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    Add item
                  </button>
                </div>

                <div className="max-w-xs">
                  <label htmlFor="edit-invoice-transport" className="mb-1 block text-sm font-medium text-slate-700">
                    Freight / Transport (₹)
                  </label>
                  <input
                    id="edit-invoice-transport"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingInvoice.transport_charges}
                    onChange={(event) =>
                      setEditingInvoice((current) =>
                        current
                          ? { ...current, transport_charges: Number(event.target.value) || 0 }
                          : current,
                      )
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>

                <div className="rounded-lg bg-slate-50 p-4 text-sm">
                  <p>Subtotal: ₹{editSubtotal.toFixed(2)}</p>
                  <p>GST: ₹{editTaxAmount.toFixed(2)}</p>
                  <p>CGST: ₹{editGstSplit.cgst_amount.toFixed(2)}</p>
                  <p>SGST: ₹{editGstSplit.sgst_amount.toFixed(2)}</p>
                  <p>IGST: ₹{editGstSplit.igst_amount.toFixed(2)}</p>
                  <p>Transport: ₹{editingInvoice.transport_charges.toFixed(2)}</p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    Grand Total: ₹{editGrandTotal.toFixed(2)}
                  </p>
                </div>

                {actionError && (
                  <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {actionError}
                  </p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSavingInvoice}
                    onClick={() => setEditingInvoice(null)}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingInvoice}
                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
                  >
                    {isSavingInvoice ? 'Saving...' : 'Save changes'}
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
