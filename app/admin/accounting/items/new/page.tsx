'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

const gstRates = [0, 5, 12, 18, 28];

export default function NewItemPage() {
  const [supabase] = useState(createClient);
  const [name, setName] = useState('');
  const [hsnSac, setHsnSac] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gstRate, setGstRate] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const { error } = await supabase.from('items').insert({
        name: name.trim(),
        hsn_sac: hsnSac.trim(),
        purchase_price: Number(purchasePrice),
        selling_price: Number(sellingPrice),
        gst_rate: Number(gstRate),
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage('Item added successfully.');
      setName('');
      setHsnSac('');
      setPurchasePrice('');
      setSellingPrice('');
      setGstRate('0');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save the item. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <section className="mx-auto w-full max-w-xl rounded-xl bg-white p-6 shadow-lg sm:p-8">
        <Link
          href="/admin/accounting"
          className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          &larr; Accounting Home
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Item or Service</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the item details below to add it to your accounting catalog.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="item-name" className="mb-1 block text-sm font-medium text-gray-700">
              Item / Service Name
            </label>
            <input
              id="item-name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="hsn-sac" className="mb-1 block text-sm font-medium text-gray-700">
              HSN / SAC Code
            </label>
            <input
              id="hsn-sac"
              name="hsn_sac"
              type="text"
              required
              value={hsnSac}
              onChange={(event) => setHsnSac(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="purchase-price"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Purchase Price (₹)
              </label>
              <input
                id="purchase-price"
                name="purchase_price"
                type="number"
                min="0"
                step="0.01"
                required
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="selling-price"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Selling Price (₹)
              </label>
              <input
                id="selling-price"
                name="selling_price"
                type="number"
                min="0"
                step="0.01"
                required
                value={sellingPrice}
                onChange={(event) => setSellingPrice(event.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="gst-rate" className="mb-1 block text-sm font-medium text-gray-700">
              GST Rate (%)
            </label>
            <select
              id="gst-rate"
              name="gst_rate"
              value={gstRate}
              onChange={(event) => setGstRate(event.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {gstRates.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
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
            {isSaving ? 'Saving...' : 'Add Item'}
          </button>
        </form>
      </section>
    </main>
  );
}
