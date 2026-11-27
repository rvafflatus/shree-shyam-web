do $$
declare
  table_name text;
  admin_claim text := '((auth.jwt() -> ''app_metadata'' ->> ''accounting_role'') = ''admin'' or lower(coalesce(auth.jwt() ->> ''email'', '''')) = ''rv.afflatus2026@gmail.com'')';
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
      raise exception 'Cannot grant accounting admin access: public.% does not exist', table_name;
    end if;

    execute format('drop policy if exists accounting_admin_insert on public.%I', table_name);
    execute format('drop policy if exists accounting_admin_update on public.%I', table_name);
    execute format('drop policy if exists accounting_admin_delete on public.%I', table_name);
    execute format('drop policy if exists accounting_insert_guard on public.%I', table_name);
    execute format('drop policy if exists accounting_update_guard on public.%I', table_name);
    execute format('drop policy if exists accounting_delete_guard on public.%I', table_name);

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
