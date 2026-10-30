'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client';

const leadStatuses = ['New', 'Follow-up', 'Converted'] as const;

export default function NewLeadPage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState<(typeof leadStatuses)[number]>('New');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.from('leads').insert({
        name: name.trim(),
        phone: phone.trim(),
        remarks: remarks.trim() || null,
        status,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push('/admin/accounting/leads');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save the lead. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link
          href="/admin/accounting/leads"
          className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          &larr; Back to leads
        </Link>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">Add New Lead</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add contact details and notes to keep your follow-ups organized.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="lead-name" className="mb-1 block text-sm font-medium text-slate-700">
              Lead Name
            </label>
            <input
              id="lead-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label htmlFor="lead-phone" className="mb-1 block text-sm font-medium text-slate-700">
              Phone Number
            </label>
            <input
              id="lead-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label htmlFor="lead-remarks" className="mb-1 block text-sm font-medium text-slate-700">
              Remarks / Follow-up Notes
            </label>
            <textarea
              id="lead-remarks"
              name="remarks"
              rows={4}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div>
            <label htmlFor="lead-status" className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="lead-status"
              name="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as (typeof leadStatuses)[number])
              }
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            >
              {leadStatuses.map((leadStatus) => (
                <option key={leadStatus} value={leadStatus}>
                  {leadStatus}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-md bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Lead'}
          </button>
        </form>
      </section>
    </main>
  );
}
