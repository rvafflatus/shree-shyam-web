alter table public.invoices
add column if not exists transport_charges numeric not null default 0;
