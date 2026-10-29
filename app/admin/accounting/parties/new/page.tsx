'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/supabase';

export default function NewPartyPage() {
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { error } = await supabase.from('parties').insert({
        name: name.trim(),
        gstin: gstin.trim() || null,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setName('');
      setGstin('');
      setSuccessMessage('Party added successfully. Return to the invoice to select it.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save the party. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Party</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a customer or party to use on an invoice.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="party-name" className="mb-1 block text-sm font-medium text-gray-700">
              Party Name
            </label>
            <input
              id="party-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="party-gstin" className="mb-1 block text-sm font-medium text-gray-700">
              GSTIN (optional)
            </label>
            <input
              id="party-gstin"
              name="gstin"
              type="text"
              value={gstin}
              onChange={(event) => setGstin(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {successMessage && (
            <p role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800">
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Add Party'}
          </button>
        </form>

        <Link
          href="/admin/accounting/invoices/new"
          className="mt-4 block text-center text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Return to invoice
        </Link>
      </section>
    </main>
  );
}
