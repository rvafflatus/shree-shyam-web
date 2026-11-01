alter table public.invoices
  add column if not exists invoice_date date not null default current_date,
  add column if not exists party_id uuid,
  add column if not exists line_items jsonb not null default '[]'::jsonb,
  add column if not exists subtotal numeric(14, 2) not null default 0,
  add column if not exists tax_amount numeric(14, 2) not null default 0,
  add column if not exists transport_charges numeric(14, 2) not null default 0,
  add column if not exists grand_total numeric(14, 2) not null default 0;
