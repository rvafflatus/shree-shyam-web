do $$
declare
  table_name text;
  admin_claim text := '(auth.jwt() -> ''app_metadata'' ->> ''accounting_role'') = ''admin''';
begin
  foreach table_name in array array[
    'invoices',
    'parties',
    'items',
    'purchase_invoices',
    'leads'
  ]
  loop
    if to_regclass(format('public.%I', table_name)) is null then
      raise exception 'Cannot secure accounting access: public.% does not exist', table_name;
    end if;

    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, public', table_name);
    execute format(
      'grant select, insert, update, delete on table public.%I to authenticated',
      table_name
    );

    execute format('drop policy if exists accounting_read on public.%I', table_name);
    execute format('drop policy if exists accounting_admin_insert on public.%I', table_name);
    execute format('drop policy if exists accounting_admin_update on public.%I', table_name);
    execute format('drop policy if exists accounting_admin_delete on public.%I', table_name);
    execute format('drop policy if exists accounting_insert_guard on public.%I', table_name);
    execute format('drop policy if exists accounting_update_guard on public.%I', table_name);
    execute format('drop policy if exists accounting_delete_guard on public.%I', table_name);

    execute format(
      'create policy accounting_read on public.%I as permissive for select to authenticated using (true)',
      table_name
    );
    execute format(
      'create policy accounting_admin_insert on public.%I as permissive for insert to authenticated with check (%s)',
      table_name,
      admin_claim
    );
    execute format(
      'create policy accounting_admin_update on public.%I as permissive for update to authenticated using (%s) with check (%s)',
      table_name,
      admin_claim,
      admin_claim
    );
    execute format(
      'create policy accounting_admin_delete on public.%I as permissive for delete to authenticated using (%s)',
      table_name,
      admin_claim
    );

    execute format(
      'create policy accounting_insert_guard on public.%I as restrictive for insert to authenticated with check (%s)',
      table_name,
      admin_claim
    );
    execute format(
      'create policy accounting_update_guard on public.%I as restrictive for update to authenticated using (%s) with check (%s)',
      table_name,
      admin_claim,
      admin_claim
    );
    execute format(
      'create policy accounting_delete_guard on public.%I as restrictive for delete to authenticated using (%s)',
      table_name,
      admin_claim
    );
  end loop;
end
$$;
