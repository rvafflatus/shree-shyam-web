'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { createClient } from '@/utils/supabase/client';

type Item = {
  id: string;
  name: string;
  hsn_sac: string;
  purchase_price: number | null;
  gst_rate: number;
};

type PurchaseLineItem = {
  item_id: string;
  description: string;
  hsn_sac: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
};

const emptyLineItem = (): PurchaseLineItem => ({
  item_id: '',
  description: '',
  hsn_sac: '',
  quantity: 1,
  unit_price: 0,
  tax_rate: 0,
});

const inputClassName =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function NewPurchasePage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [items, setItems] = useState<Item[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [lineItems, setLineItems] = useState<PurchaseLineItem[]>([emptyLineItem()]);
  const [transporterName, setTransporterName] = useState('');
  const [grNumber, setGrNumber] = useState('');
  const [freightCharge, setFreightCharge] = useState(0);
  const [handlingCharge, setHandlingCharge] = useState(0);
  const [tollCharge, setTollCharge] = useState(0);
  const [otherCharge, setOtherCharge] = useState(0);
  const [rcmApplicable, setRcmApplicable] = useState(false);
  const [rcmGstRate, setRcmGstRate] = useState(0);
  const [transportPaymentStatus, setTransportPaymentStatus] = useState<'TO PAY' | 'PAID'>(
    'TO PAY',
  );
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadItems() {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('id, name, hsn_sac, purchase_price, gst_rate')
          .order('name');

        if (!isActive) return;
        if (error) {
          setErrorMessage(`Unable to load the item catalog: ${error.message}`);
          return;
        }

        setItems(data ?? []);
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load the item catalog.',
          );
        }
      } finally {
        if (isActive) setIsLoadingItems(false);
      }
    }

    void loadItems();

    return () => {
      isActive = false;
    };
  }, [supabase]);

  const goodsSubtotal = roundMoney(
    lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
  );
  const goodsGstAmount = roundMoney(
    lineItems.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate) / 100,
      0,
    ),
  );
  const totalTransportAmount = roundMoney(
    freightCharge + handlingCharge + tollCharge + otherCharge,
  );
  const rcmGstAmount = rcmApplicable
    ? roundMoney((totalTransportAmount * rcmGstRate) / 100)
    : 0;
  const supplierPayableTotal = roundMoney(
    goodsSubtotal + goodsGstAmount + totalTransportAmount,
  );
  const totalOutlay = roundMoney(supplierPayableTotal + rcmGstAmount);

  function updateLineItem(index: number, patch: Partial<PurchaseLineItem>) {
    setLineItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
  }

  function handleItemSelect(index: number, itemId: string) {
    const selected = items.find((item) => item.id === itemId);
    if (!selected) {
      updateLineItem(index, { item_id: '', description: '', hsn_sac: '' });
      return;
    }

    updateLineItem(index, {
      item_id: selected.id,
      description: selected.name,
      hsn_sac: selected.hsn_sac,
      unit_price: selected.purchase_price ?? 0,
      tax_rate: selected.gst_rate,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    const validLineItems = lineItems.filter((item) => item.item_id);
    if (validLineItems.length === 0) {
      setErrorMessage('Add at least one item to the purchase invoice.');
      setIsSaving(false);
      return;
    }

    if (
      validLineItems.some(
        (item) =>
          !Number.isFinite(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unit_price) ||
          item.unit_price < 0 ||
          !Number.isFinite(item.tax_rate) ||
          item.tax_rate < 0,
      )
    ) {
      setErrorMessage('Check the quantity, unit price, and GST rate for each item.');
      setIsSaving(false);
      return;
    }

    try {
      const { error } = await supabase.from('purchase_invoices').insert({
        supplier_name: supplierName.trim(),
        supplier_invoice_number: supplierInvoiceNumber.trim(),
        purchase_date: purchaseDate,
        line_items: validLineItems.map((item) => ({
          ...item,
          line_total: roundMoney(item.quantity * item.unit_price),
        })),
        goods_subtotal: goodsSubtotal,
        goods_gst_amount: goodsGstAmount,
        transporter_name: transporterName.trim() || null,
        gr_number: grNumber.trim() || null,
        freight_charge: freightCharge,
        handling_charge: handlingCharge,
        toll_charge: tollCharge,
        other_charge: otherCharge,
        rcm_applicable: rcmApplicable,
        rcm_gst_rate: rcmApplicable ? rcmGstRate : 0,
        transport_payment_status: transportPaymentStatus,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      router.push('/admin/accounting/purchases');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to save the purchase invoice.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/accounting"
          className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          &larr; Accounting Home
        </Link>

        <header className="mb-6 mt-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Purchasing
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            New Purchase Entry
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Record supplier invoice items, bilty charges, and any applicable RCM.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Supplier Invoice</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="supplier-name" className="mb-1 block text-sm font-medium text-slate-700">
                  Supplier Name
                </label>
                <input
                  id="supplier-name"
                  required
                  value={supplierName}
                  onChange={(event) => setSupplierName(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="supplier-invoice" className="mb-1 block text-sm font-medium text-slate-700">
                  Supplier Invoice Number
                </label>
                <input
                  id="supplier-invoice"
                  required
                  value={supplierInvoiceNumber}
                  onChange={(event) => setSupplierInvoiceNumber(event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="purchase-date" className="mb-1 block text-sm font-medium text-slate-700">
                  Purchase Date
                </label>
                <input
                  id="purchase-date"
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Purchased Items</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Master purchase prices are prefilled; edit unit prices to match this bill.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLineItems((current) => [...current, emptyLineItem()])}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Add item
              </button>
            </div>

            {isLoadingItems ? (
              <p role="status" className="mt-5 text-sm text-slate-600">
                Loading item catalog...
              </p>
            ) : items.length === 0 ? (
              <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                No items are available. Add items to the master catalog before entering a purchase.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {lineItems.map((lineItem, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-2 lg:grid-cols-6"
                  >
                    <div className="sm:col-span-2 lg:col-span-2">
                      <label htmlFor={`purchase-item-${index}`} className="mb-1 block text-xs font-medium text-slate-600">
                        Item
                      </label>
                      <select
                        id={`purchase-item-${index}`}
                        value={lineItem.item_id}
                        onChange={(event) => handleItemSelect(index, event.target.value)}
                        required
                        className={inputClassName}
                      >
                        <option value="">Select item</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`purchase-qty-${index}`} className="mb-1 block text-xs font-medium text-slate-600">
                        Quantity
                      </label>
                      <input
                        id={`purchase-qty-${index}`}
                        type="number"
                        min="0.001"
                        step="0.001"
                        required
                        value={lineItem.quantity}
                        onChange={(event) => updateLineItem(index, { quantity: Number(event.target.value) || 0 })}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor={`purchase-price-${index}`} className="mb-1 block text-xs font-medium text-slate-600">
                        Unit Price (₹)
                      </label>
                      <input
                        id={`purchase-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={lineItem.unit_price}
                        onChange={(event) => updateLineItem(index, { unit_price: Number(event.target.value) || 0 })}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label htmlFor={`purchase-gst-${index}`} className="mb-1 block text-xs font-medium text-slate-600">
                        GST Rate (%)
                      </label>
                      <input
                        id={`purchase-gst-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={lineItem.tax_rate}
                        onChange={(event) => updateLineItem(index, { tax_rate: Number(event.target.value) || 0 })}
                        className={inputClassName}
                      />
                    </div>
                    <div className="flex items-end justify-between gap-2 lg:col-span-6">
                      <p className="text-sm text-slate-600">
                        HSN/SAC: {lineItem.hsn_sac || '—'} · Line total: ₹
                        {(lineItem.quantity * lineItem.unit_price).toFixed(2)}
                      </p>
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setLineItems((current) =>
                              current.filter((_, itemIndex) => itemIndex !== index),
                            )
                          }
                          className="text-sm font-medium text-red-700 hover:text-red-900"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <details className="rounded-xl border border-slate-200 bg-white shadow-sm" open>
            <summary className="cursor-pointer px-5 py-4 text-lg font-semibold text-slate-900 sm:px-6">
              Transport &amp; Bilty Details
            </summary>
            <div className="space-y-5 border-t border-slate-200 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="transporter-name" className="mb-1 block text-sm font-medium text-slate-700">
                    Transporter Name
                  </label>
                  <input
                    id="transporter-name"
                    value={transporterName}
                    onChange={(event) => setTransporterName(event.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="gr-number" className="mb-1 block text-sm font-medium text-slate-700">
                    G.R. Number
                  </label>
                  <input
                    id="gr-number"
                    value={grNumber}
                    onChange={(event) => setGrNumber(event.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: 'freight-charge', label: 'Freight', value: freightCharge, setValue: setFreightCharge },
                  { id: 'handling-charge', label: 'Handling', value: handlingCharge, setValue: setHandlingCharge },
                  { id: 'toll-charge', label: 'Toll', value: tollCharge, setValue: setTollCharge },
                  { id: 'other-charge', label: 'Other Charges', value: otherCharge, setValue: setOtherCharge },
                ].map((charge) => (
                  <div key={charge.id}>
                    <label htmlFor={charge.id} className="mb-1 block text-sm font-medium text-slate-700">
                      {charge.label} (₹)
                    </label>
                    <input
                      id={charge.id}
                      type="number"
                      min="0"
                      step="0.01"
                      value={charge.value}
                      onChange={(event) => charge.setValue(Number(event.target.value) || 0)}
                      className={inputClassName}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="transport-payment-status" className="mb-1 block text-sm font-medium text-slate-700">
                    Transport Payment Status
                  </label>
                  <select
                    id="transport-payment-status"
                    value={transportPaymentStatus}
                    onChange={(event) =>
                      setTransportPaymentStatus(event.target.value as 'TO PAY' | 'PAID')
                    }
                    className={inputClassName}
                  >
                    <option value="TO PAY">TO PAY</option>
                    <option value="PAID">PAID</option>
                  </select>
                </div>

                <div className="flex items-end pb-2">
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={rcmApplicable}
                      onChange={(event) => setRcmApplicable(event.target.checked)}
                      className="size-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
                    />
                    RCM applicable on transport
                  </label>
                </div>
              </div>

              {rcmApplicable && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rcm-gst-rate" className="mb-1 block text-sm font-medium text-slate-700">
                      RCM GST Rate (%)
                    </label>
                    <input
                      id="rcm-gst-rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={rcmGstRate}
                      onChange={(event) => setRcmGstRate(Number(event.target.value) || 0)}
                      className={inputClassName}
                    />
                  </div>
                  <p className="self-end text-sm text-slate-600">
                    Estimated RCM liability: ₹{rcmGstAmount.toFixed(2)}. This is shown separately
                    from the amount payable to the supplier/transporter.
                  </p>
                </div>
              )}
            </div>
          </details>

          {errorMessage && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {errorMessage}
            </p>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Purchase Summary</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Goods subtotal</dt>
                <dd>₹{goodsSubtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Goods GST</dt>
                <dd>₹{goodsGstAmount.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Total transport charges</dt>
                <dd>₹{totalTransportAmount.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-slate-600">
                <dt>Transport status</dt>
                <dd>{transportPaymentStatus}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 font-semibold text-slate-900">
                <dt>Supplier payable</dt>
                <dd>₹{supplierPayableTotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 font-semibold text-amber-800">
                <dt>RCM GST liability</dt>
                <dd>₹{rcmGstAmount.toFixed(2)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xl font-bold text-slate-900">
              Total outlay (including RCM): ₹{totalOutlay.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Transport charges are reported separately and are not allocated across item costs.
            </p>
            <button
              type="submit"
              disabled={isSaving || isLoadingItems || items.length === 0}
              className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSaving ? 'Saving purchase...' : 'Save Purchase Entry'}
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}
