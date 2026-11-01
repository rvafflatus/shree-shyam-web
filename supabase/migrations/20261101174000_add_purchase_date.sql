alter table public.purchase_invoices
  add column if not exists purchase_date date not null default current_date;

create index if not exists purchase_invoices_purchase_date_idx
  on public.purchase_invoices (purchase_date desc);
