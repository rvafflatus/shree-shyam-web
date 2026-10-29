'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/supabase';

export default function NewPartyPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const address = [
        streetAddress.trim(),
        [city.trim(), state.trim(), pincode.trim()].filter(Boolean).join(', '),
      ]
        .filter(Boolean)
        .join('\n');
      const { error } = await supabase.from('parties').insert({
        name: name.trim(),
        type: type.trim() || null,
        gstin: gstin.trim() || null,
        phone: phone.trim() || null,
        address: address || null,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setName('');
      setType('');
      setGstin('');
      setPhone('');
      setStreetAddress('');
      setCity('');
      setState('');
      setPincode('');
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
      <section className="mx-auto w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Party</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add a customer or party to use on an invoice.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="party-name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
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
              <label htmlFor="party-type" className="mb-1 block text-sm font-medium text-gray-700">
                Party Type (optional)
              </label>
              <input
                id="party-type"
                name="type"
                type="text"
                value={type}
                onChange={(event) => setType(event.target.value)}
                placeholder="Customer, supplier, etc."
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

            <div>
              <label htmlFor="party-phone" className="mb-1 block text-sm font-medium text-gray-700">
                Phone (optional)
              </label>
              <input
                id="party-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4 sm:p-5">
            <legend className="px-1 text-sm font-semibold text-gray-800">Address (optional)</legend>
            <div>
              <label htmlFor="party-street" className="mb-1 block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <textarea
                id="party-street"
                name="street_address"
                rows={2}
                autoComplete="street-address"
                value={streetAddress}
                onChange={(event) => setStreetAddress(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="party-city" className="mb-1 block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="party-city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="party-state" className="mb-1 block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  id="party-state"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label htmlFor="party-pincode" className="mb-1 block text-sm font-medium text-gray-700">
                  Pincode
                </label>
                <input
                  id="party-pincode"
                  name="pincode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </fieldset>

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
