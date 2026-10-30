create table if not exists public.purchase_invoices (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  supplier_invoice_number text not null,
  purchase_date date not null default current_date,
  line_items jsonb not null default '[]'::jsonb,
  goods_subtotal numeric(14, 2) not null default 0 check (goods_subtotal >= 0),
  goods_gst_amount numeric(14, 2) not null default 0 check (goods_gst_amount >= 0),
  transporter_name text,
  gr_number text,
  freight_charge numeric(14, 2) not null default 0 check (freight_charge >= 0),
  handling_charge numeric(14, 2) not null default 0 check (handling_charge >= 0),
  toll_charge numeric(14, 2) not null default 0 check (toll_charge >= 0),
  other_charge numeric(14, 2) not null default 0 check (other_charge >= 0),
  rcm_applicable boolean not null default false,
  rcm_gst_rate numeric(5, 2) not null default 0 check (rcm_gst_rate >= 0),
  total_transport_amount numeric(14, 2)
    generated always as (
      freight_charge + handling_charge + toll_charge + other_charge
    ) stored,
  rcm_gst_amount numeric(14, 2)
    generated always as (
      case
        when rcm_applicable
          then round((freight_charge + handling_charge + toll_charge + other_charge) * rcm_gst_rate / 100, 2)
        else 0
      end
    ) stored,
  transport_payment_status text not null default 'TO PAY'
    check (transport_payment_status in ('TO PAY', 'PAID')),
  supplier_payable_total numeric(14, 2)
    generated always as (
      goods_subtotal + goods_gst_amount + freight_charge + handling_charge + toll_charge + other_charge
    ) stored,
  total_outlay numeric(14, 2)
    generated always as (
      goods_subtotal + goods_gst_amount + freight_charge + handling_charge + toll_charge + other_charge
      + case
          when rcm_applicable
            then round((freight_charge + handling_charge + toll_charge + other_charge) * rcm_gst_rate / 100, 2)
          else 0
        end
    ) stored,
  created_at timestamptz not null default now(),
  constraint purchase_invoices_line_items_array check (jsonb_typeof(line_items) = 'array')
);

create index if not exists purchase_invoices_purchase_date_idx
  on public.purchase_invoices (purchase_date desc);

create index if not exists purchase_invoices_gr_number_idx
  on public.purchase_invoices (gr_number);
