import type { User } from '@supabase/supabase-js';

const additionalAdminEmail = 'rv.afflatus2026@gmail.com';

export function isAccountingAdmin(
  user: Pick<User, 'email' | 'app_metadata'> | null | undefined,
) {
  return (
    user?.app_metadata.accounting_role === 'admin' ||
    user?.email?.trim().toLowerCase() === additionalAdminEmail
  );
}
