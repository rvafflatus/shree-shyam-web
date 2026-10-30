'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/supabase';

const addNewPartyOption = '__add_new_party__';
const addNewItemOption = '__add_new_item__';

type Party = {
  id: string;
  name: string;
  gstin?: string | null;
};

type Item = {
  id: string;
  name: string;
  hsn_sac: string;
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

export default function NewInvoicePage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [itemsMaster, setItemsMaster] = useState<Item[]>([]);

  // Form State
  const [selectedParty, setSelectedParty] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { item_id: '', description: '', hsn_sac: '', quantity: 1, unit_price: 0, tax_rate: 18 }
  ]);

  useEffect(() => {
    // Dropdowns ke liye parties aur items fetch karna
    async function fetchData() {
      const { data: pData } = await supabase.from('parties').select('*');
      const { data: iData } = await supabase.from('items').select('*');
      if (pData) setParties(pData);
      if (iData) setItemsMaster(iData);
    }
    fetchData();
  }, []);

  // Nayi row add karne ke liye function
  const addItemRow = () => {
    setLineItems([...lineItems, { item_id: '', description: '', hsn_sac: '', quantity: 1, unit_price: 0, tax_rate: 18 }]);
  };

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
  const subtotal = lineItems.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0);
  const totalTax = lineItems.reduce((acc, curr) => acc + ((curr.quantity * curr.unit_price * curr.tax_rate) / 100), 0);
  const grandTotal = subtotal + totalTax;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded-lg my-6">
      <Link
        href="/admin/accounting"
        className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
      >
        &larr; Accounting Home
      </Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Create New Tax Invoice</h1>
      
      {/* Party Selection Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Select Customer / Party</label>
        <select 
          value={selectedParty} 
          onChange={(e) => {
            if (e.target.value === addNewPartyOption) {
              router.push('/admin/accounting/parties/new');
              return;
            }
            setSelectedParty(e.target.value);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
        >
          <option value="">-- Choose Party --</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>{p.name} {p.gstin ? `(${p.gstin})` : ''}</option>
          ))}
          <option value={addNewPartyOption}>+ Add New Party</option>
        </select>
      </div>

      {/* Dynamic Multi-Item Table */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Line Items</h3>
        <table className="w-full border-collapse">
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
                    onChange={(e) => {
                      if (e.target.value === addNewItemOption) {
                        router.push('/admin/accounting/items/new');
                        return;
                      }
                      handleItemSelect(index, e.target.value);
                    }}
                    className="w-full border p-1 rounded text-sm bg-white"
                  >
                    <option value="">Select Item</option>
                    {itemsMaster.map((i) => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                    <option value={addNewItemOption}>+ Add New Item</option>
                  </select>
                </td>
                <td className="p-2"><input type="text" value={row.hsn_sac} readOnly className="w-24 bg-gray-50 border p-1 rounded text-sm" /></td>
                <td className="p-2"><input type="number" value={row.quantity} onChange={(e) => {
                  const updated = [...lineItems];
                  updated[index].quantity = Number(e.target.value);
                  setLineItems(updated);
                }} className="w-16 border p-1 rounded text-sm" /></td>
                <td className="p-2"><input type="number" value={row.unit_price} onChange={(e) => {
                  const updated = [...lineItems];
                  updated[index].unit_price = Number(e.target.value);
                  setLineItems(updated);
                }} className="w-24 border p-1 rounded text-sm" /></td>
                <td className="p-2 text-sm">{row.tax_rate}%</td>
                <td className="p-2 font-semibold text-sm">₹{(row.quantity * row.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          onClick={addItemRow}
          className="mt-3 px-4 py-1.5 bg-gray-200 text-gray-800 rounded text-sm font-medium hover:bg-gray-300"
        >
          + Add Another Item
        </button>
      </div>

      {/* Totals & Actions */}
      <div className="flex justify-between items-center border-t pt-4">
        <div>
          <p className="text-sm text-gray-600">Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Estimated Tax (GST): ₹{totalTax.toFixed(2)}</p>
          <p className="text-xl font-bold text-gray-900">Grand Total: ₹{grandTotal.toFixed(2)}</p>
        </div>
        <div className="space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Save Invoice</button>
        </div>
      </div>
    </div>
  );
} 