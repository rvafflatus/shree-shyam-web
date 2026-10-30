'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type Party = {
  id: string;
  name: string;
  type: string | null;
  gstin: string | null;
  phone: string | null;
  address: string | null;
};

export default function PartiesPage() {
  const [supabase] = useState(createClient);
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadParties() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('parties')
          .select('id, name, type, gstin, phone, address')
          .order('name');

        if (!isActive) return;
        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setParties(data ?? []);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load parties. Please try again.',
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadParties();

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
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Contacts
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Parties
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage customer and vendor contact and tax details.
            </p>
          </div>
          <Link
            href="/admin/accounting/parties/new"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Add new party
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
              <span className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
              Loading parties...
            </div>
          ) : parties.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center px-4 text-center">
              <p className="font-medium text-slate-900">No parties found</p>
              <p className="mt-1 text-sm text-slate-500">
                Add a customer or vendor to start managing your contacts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-4 py-3 font-semibold">Name</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                    <th scope="col" className="px-4 py-3 font-semibold">GSTIN</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Phone</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parties.map((party) => (
                    <tr key={party.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{party.name}</td>
                      <td className="px-4 py-3 text-slate-600">{party.type || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{party.gstin || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{party.phone || '—'}</td>
                      <td className="max-w-sm whitespace-pre-line px-4 py-3 text-slate-600">
                        {party.address || '—'}
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
