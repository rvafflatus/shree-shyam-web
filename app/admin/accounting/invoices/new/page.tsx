'use client';
import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import { isRajasthanState, splitGstByPartyState } from '@/utils/accounting/gst';

const addNewPartyOption = '__add_new_party__';
const addNewItemOption = '__add_new_item__';

type Party = {
  id: string;
  name: string;
  gstin?: string | null;
  state?: string | null;
};

type Item = {
  id: string;
  name: string;
  hsn_sac: string;
  purchase_price: number | null;
  selling_price: number;
  gst_rate: number;
};

type LineItem = {
  item_id: string;
  description: string;
  hsn_sac: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
};

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [itemsMaster, setItemsMaster] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [selectedParty, setSelectedParty] = useState('');
  const [transportCharges, setTransportCharges] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item_id: '', description: '', hsn_sac: '', quantity: 1, unit_price: 0, tax_rate: 18 }
  ]);

  useEffect(() => {
    let isActive = true;

    async function fetchData() {
      setIsLoading(true);

      try {
        const [partyResult, itemResult] = await Promise.all([
          supabase.from('parties').select('id, name, gstin, state').order('name'),
          supabase
            .from('items')
            .select('id, name, hsn_sac, purchase_price, selling_price, gst_rate')
            .order('name'),
        ]);

        if (!isActive) return;

        if (partyResult.error || itemResult.error) {
          setErrorMessage(
            [
              partyResult.error?.message,
              itemResult.error?.message,
            ]
              .filter(Boolean)
              .join(' '),
          );
          return;
        }

        setParties(partyResult.data ?? []);
        setItemsMaster(itemResult.data ?? []);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load invoice form data.',
          );
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void fetchData();

    return () => {
      isActive = false;
    };
  }, []);

  // Nayi row add karne ke liye function
  const addItemRow = () => {
    setLineItems([...lineItems, { item_id: '', description: '', hsn_sac: '', quantity: 1, unit_price: 0, tax_rate: 18 }]);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedParty) {
      setErrorMessage('Select a customer or party before saving the invoice.');
      return;
    }

    if (lineItems.some((item) => !item.item_id)) {
      setErrorMessage('Select an item for every invoice line or remove the empty line.');
      return;
    }

    if (
      lineItems.some(
        (item) =>
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unit_price) ||
          item.unit_price < 0 ||
          !Number.isFinite(item.tax_rate) ||
          item.tax_rate < 0,
      )
    ) {
      setErrorMessage('Check that each quantity, unit price, and GST rate is valid.');
      return;
    }

    if (!Number.isFinite(transportCharges) || transportCharges < 0) {
      setErrorMessage('Transport charges must be zero or a positive amount.');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from('invoices').insert({
        invoice_date: new Date().toISOString().slice(0, 10),
        party_id: selectedParty,
        line_items: lineItems.map((item) => ({
          ...item,
          line_total: Number((item.quantity * item.unit_price).toFixed(2)),
          tax_amount: Number(
            ((item.quantity * item.unit_price * item.tax_rate) / 100).toFixed(2),
          ),
        })),
        subtotal: Number(subtotal.toFixed(2)),
        cgst_amount: gstSplit.cgst_amount,
        sgst_amount: gstSplit.sgst_amount,
        igst_amount: gstSplit.igst_amount,
        tax_amount: gstSplit.tax_amount,
        transport_charges: Number(transportCharges.toFixed(2)),
        grand_total: Number(grandTotal.toFixed(2)),
      });

      if (error) {
        setErrorMessage(`Unable to save invoice: ${error.message}`);
        return;
      }

      setSuccessMessage('Invoice saved successfully.');
      setIsSaved(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? `Unable to save invoice: ${error.message}` : 'Unable to save invoice.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  // Item select hone par details auto-fill karna
  const handleItemSelect = (index: number, itemId: string) => {
    const selected = itemsMaster.find(i => i.id === itemId);
    const updated = [...lineItems];
    if (selected) {
      updated[index] = {
        item_id: selected.id,
        description: selected.name,
        hsn_sac: selected.hsn_sac,
        quantity: 1,
        unit_price: selected.selling_price,
        tax_rate: selected.gst_rate
      };
    }
    setLineItems(updated);
  };

  // Calculations
  const subtotal = roundMoney(lineItems.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0));
  const totalTax = roundMoney(lineItems.reduce((acc, curr) => acc + ((curr.quantity * curr.unit_price * curr.tax_rate) / 100), 0));
  const selectedPartyState = parties.find((party) => party.id === selectedParty)?.state;
  const gstSplit = splitGstByPartyState(totalTax, selectedPartyState);
  const grandTotal = roundMoney(subtotal + gstSplit.tax_amount + transportCharges);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded-lg my-6">
      <Link
        href="/admin/accounting"
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        &larr; Accounting Home
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Tax Invoice</h1>
      
      <form onSubmit={handleSubmit}>
      {errorMessage && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <div role="status" className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
          <p>{successMessage}</p>
          <Link
            href="/admin/accounting/reports"
            className="mt-1 inline-block font-semibold underline underline-offset-2"
          >
            View accounting reports
          </Link>
        </div>
      )}

      {/* Party Selection Dropdown */}
      <div className="mb-4">
        <label htmlFor="invoice-party" className="block text-sm font-medium text-gray-700">Select Customer / Party</label>
        <select 
          id="invoice-party"
          value={selectedParty} 
          required
          onChange={(e) => {
            if (e.target.value === addNewPartyOption) {
              router.push('/admin/accounting/parties/new');
              return;
            }
            setSelectedParty(e.target.value);
          }}
          disabled={isLoading || isSaving || isSaved}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 shadow-sm disabled:bg-gray-100"
        >
          <option value="">-- Choose Party --</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>{p.name} {p.gstin ? `(${p.gstin})` : ''}</option>
          ))}
          <option value={addNewPartyOption}>+ Add New Party</option>
        </select>
        {selectedParty && (
          <p className="mt-1 text-xs text-gray-600">
            Place of supply: {selectedPartyState || 'State not set'} ·{' '}
            {isRajasthanState(selectedPartyState)
              ? 'CGST + SGST apply'
              : 'IGST applies'}
          </p>
        )}
      </div>

      {/* Dynamic Multi-Item Table */}
      <div className="mb-6 overflow-x-auto">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Line Items</h3>
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-xs text-gray-600 uppercase">
              <th className="p-2">Item</th>
              <th className="p-2">HSN/SAC</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Price (₹)</th>
              <th className="p-2">GST %</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((row, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  <select 
                    value={row.item_id}
                    required
                    onChange={(e) => {
                      if (e.target.value === addNewItemOption) {
                        router.push('/admin/accounting/items/new');
                        return;
                      }
                      handleItemSelect(index, e.target.value);
                    }}
                    disabled={isLoading || isSaving || isSaved}
                    className="w-full rounded border bg-white p-1 text-sm disabled:bg-gray-100"
                  >
                    <option value="">Select Item</option>
                    {itemsMaster.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                    <option value={addNewItemOption}>+ Add New Item</option>
                  </select>
                </td>
                <td className="p-2"><input aria-label={`HSN/SAC for ${row.description || 'line item'}`} type="text" value={row.hsn_sac} readOnly className="w-24 rounded border bg-gray-50 p-1 text-sm" /></td>
                <td className="p-2"><input aria-label={`Quantity for ${row.description || 'line item'}`} type="number" min="0.001" step="0.001" required value={row.quantity} disabled={isSaving || isSaved} onChange={(e) => {
                  const updated = [...lineItems];
                  updated[index] = { ...updated[index], quantity: Number(e.target.value) };
                  setLineItems(updated);
                }} className="w-20 rounded border p-1 text-sm" /></td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    aria-label={`Unit price on invoice for ${row.description || 'line item'}`}
                    placeholder="Enter price"
                    value={row.unit_price}
                    required
                    disabled={isSaving || isSaved}
                    onChange={(event) => {
                      const updated = [...lineItems];
                      updated[index] = {
                        ...updated[index],
                        unit_price: Number(event.target.value),
                      };
                      setLineItems(updated);
                    }}
                    className="w-28 rounded border p-1 text-sm"
                  />
                </td>
                <td className="p-2 text-sm">{row.tax_rate}%</td>
                <td className="p-2 font-semibold text-sm">₹{(row.quantity * row.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          type="button"
          onClick={addItemRow}
          disabled={isSaving || isSaved}
          className="mt-3 rounded bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-60"
        >
          + Add Another Item
        </button>
      </div>

      {/* Totals & Actions */}
      <div className="flex flex-col gap-6 border-t pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-xs">
          <label
            htmlFor="transport-charges"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Freight / Transport Charges (₹)
          </label>
          <input
            id="transport-charges"
            name="transport_charges"
            type="number"
            min="0"
            step="0.01"
            value={transportCharges}
            onChange={(event) => setTransportCharges(Number(event.target.value) || 0)}
            disabled={isSaving || isSaved}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <p className="text-sm text-gray-600">Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Estimated Tax (GST): ₹{totalTax.toFixed(2)}</p>
          <p className="text-sm text-gray-600">CGST: ₹{gstSplit.cgst_amount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">SGST: ₹{gstSplit.sgst_amount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">IGST: ₹{gstSplit.igst_amount.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Freight / Transport: ₹{transportCharges.toFixed(2)}</p>
          <p className="text-xl font-bold text-gray-900">Grand Total: ₹{grandTotal.toFixed(2)}</p>
        </div>
        <div className="space-x-3">
          <button
            type="submit"
            disabled={isSaving || isLoading || isSaved}
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : isSaved ? 'Invoice Saved' : 'Save Invoice'}
          </button>
        </div>
      </div>
      </form>
    </div>
  );
} 