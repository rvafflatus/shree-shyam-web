'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client';

type Party = {
  id: string;
  name: string;
  type: string | null;
  gstin: string | null;
  phone: string | null;
  state: string | null;
  address: string | null;
};

export default function PartiesPage() {
  const [supabase] = useState(createClient);
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadParties() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const { data, error } = await supabase
          .from('parties')
          .select('id, name, type, gstin, phone, state, address')
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

  async function handlePartyUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingParty) return;

    setIsSaving(true);
    setActionError('');

    try {
      const { error } = await supabase
        .from('parties')
        .update({
          name: editingParty.name.trim(),
          type: editingParty.type?.trim() || null,
          gstin: editingParty.gstin?.trim() || null,
          phone: editingParty.phone?.trim() || null,
          state: editingParty.state?.trim() || null,
          address: editingParty.address?.trim() || null,
        })
        .eq('id', editingParty.id)
        .select('id')
        .single();

      if (error) {
        setActionError(`Unable to update party: ${error.message}`);
        return;
      }

      setEditingParty(null);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to update party. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePartyDelete(party: Party) {
    if (!window.confirm(`Delete "${party.name}"? This cannot be undone.`)) return;

    setDeletingId(party.id);
    setActionError('');

    try {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', party.id)
        .select('id')
        .single();
      if (error) {
        setActionError(`Unable to delete party: ${error.message}`);
        return;
      }

      setParties((current) => current.filter((entry) => entry.id !== party.id));
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : 'Unable to delete party. Please try again.',
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
                    <th scope="col" className="px-4 py-3 font-semibold">State</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Address</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parties.map((party) => (
                    <tr key={party.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{party.name}</td>
                      <td className="px-4 py-3 text-slate-600">{party.type || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{party.gstin || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{party.phone || '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{party.state || '—'}</td>
                      <td className="max-w-sm whitespace-pre-line px-4 py-3 text-slate-600">
                        {party.address || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setActionError('');
                              setEditingParty({ ...party });
                            }}
                            className="font-medium text-blue-700 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === party.id}
                            onClick={() => void handlePartyDelete(party)}
                            className="font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingId === party.id ? 'Deleting...' : 'Delete'}
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

        {editingParty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-party-title"
              className="my-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
            >
              <h2 id="edit-party-title" className="text-xl font-semibold text-slate-900">
                Edit Party
              </h2>
              <form
                className="mt-5 grid gap-4 sm:grid-cols-2"
                onSubmit={handlePartyUpdate}
              >
                {([
                  ['name', 'Name'],
                  ['type', 'Type'],
                  ['gstin', 'GSTIN'],
                  ['phone', 'Phone'],
                  ['state', 'State'],
                ] as const).map(([field, label]) => (
                  <div key={field}>
                    <label htmlFor={`edit-party-${field}`} className="mb-1 block text-sm font-medium text-slate-700">
                      {label}
                    </label>
                    <input
                      id={`edit-party-${field}`}
                      required={field === 'name'}
                      value={editingParty[field] ?? ''}
                      onChange={(event) =>
                        setEditingParty((current) =>
                          current ? { ...current, [field]: event.target.value } : current,
                        )
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label htmlFor="edit-party-address" className="mb-1 block text-sm font-medium text-slate-700">
                    Address
                  </label>
                  <textarea
                    id="edit-party-address"
                    rows={3}
                    value={editingParty.address ?? ''}
                    onChange={(event) =>
                      setEditingParty((current) =>
                        current ? { ...current, address: event.target.value } : current,
                      )
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                {actionError && (
                  <p role="alert" className="sm:col-span-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {actionError}
                  </p>
                )}
                <div className="flex justify-end gap-3 sm:col-span-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setEditingParty(null)}
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
