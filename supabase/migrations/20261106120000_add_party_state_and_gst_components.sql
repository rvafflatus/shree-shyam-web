alter table public.parties
  add column if not exists state text;

update public.parties
set state = btrim(
  split_part(
    split_part(address, E'\n', 2),
    ',',
    2
  )
)
where state is null
  and address like E'%\n%'
  and length(split_part(address, E'\n', 2))
      - length(replace(split_part(address, E'\n', 2), ',', '')) >= 2;

alter table public.invoices
  add column if not exists cgst_amount numeric(14, 2) not null default 0,
  add column if not exists sgst_amount numeric(14, 2) not null default 0,
  add column if not exists igst_amount numeric(14, 2) not null default 0;

alter table public.purchase_invoices
  add column if not exists party_id uuid,
  add column if not exists cgst_amount numeric(14, 2) not null default 0,
  add column if not exists sgst_amount numeric(14, 2) not null default 0,
  add column if not exists igst_amount numeric(14, 2) not null default 0,
  add column if not exists tax_amount numeric(14, 2) not null default 0;
