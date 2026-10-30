'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

type DataRow = Record<string, unknown>;
type TabKey = 'invoices' | 'parties' | 'items' | 'purchases';

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
              'purchase_date, supplier_invoice_number, supplier_name, transporter_name, gr_number, freight_charge, handling_charge, toll_charge, other_charge, total_transport_amount, transport_payment_status, rcm_applicable, rcm_gst_rate, rcm_gst_amount, supplier_payable_total, total_outlay',
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

        const partyRows = toRows(partyResult.data);
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
