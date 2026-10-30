'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Lead = {
  id: string;
  name: string;
  phone: string;
  remarks: string | null;
  status: string;
  created_at: string;
};

function exportLeadsToCsv(leads: Lead[]) {
  const columns: { key: keyof Lead; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created At' },
  ];
  const escapeCell = (value: string | null) =>
    `"${(value ?? '').replaceAll('"', '""')}"`;
  const csv = [
    columns.map(({ label }) => escapeCell(label)).join(','),
    ...leads.map((lead) =>
      columns.map(({ key }) => escapeCell(lead[key])).join(','),
    ),
  ].join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'leads.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function LeadsPage() {
  const [supabase] = useState(createClient);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadLeads() {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, name, phone, remarks, status, created_at')
          .order('created_at', { ascending: false });

        if (!isActive) return;
        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setLeads(data ?? []);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load leads. Please try again.',
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadLeads();

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
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
              CRM &amp; Follow-up
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Leads
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Keep track of potential customers and their follow-up status.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => exportLeadsToCsv(leads)}
              disabled={isLoading || leads.length === 0}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export to CSV
            </button>
            <Link
              href="/admin/accounting/leads/new"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800"
            >
              Add new lead
            </Link>
          </div>
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
            <div
              role="status"
              className="flex min-h-48 items-center justify-center gap-3 text-sm text-slate-600"
            >
              <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-cyan-700" />
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
              <p className="font-medium text-slate-900">No leads found</p>
              <p className="mt-1 text-sm text-slate-500">
                Add a lead to start tracking follow-ups.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Remarks</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.phone}</td>
                      <td className="max-w-sm whitespace-pre-line px-4 py-3 text-slate-600">
                        {lead.remarks || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800">
                          {lead.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatCreatedAt(lead.created_at)}
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
