'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import AccountingSidebar from './AccountingSidebar';

export default function AccountingLayoutShell({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [showDemoNotice, setShowDemoNotice] = useState(false);
  const accountingShellRef = useRef<HTMLDivElement>(null);
  const isDemo = session?.user.app_metadata.accounting_role === 'demo';
  const isAdmin = session?.user.app_metadata.accounting_role === 'admin';

  useEffect(() => {
    let isActive = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
      setIsLoading(false);
      setAuthError('');
    });

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isActive) return;
        if (error) {
          setAuthError(`Unable to verify your sign-in: ${error.message}`);
        } else {
          setSession(data.session);
        }
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setAuthError(
          error instanceof Error
            ? `Unable to verify your sign-in: ${error.message}`
            : 'Unable to verify your sign-in.',
        );
        setIsLoading(false);
      });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!isLoading && !session && !authError) {
      router.replace('/login');
    }
  }, [authError, isLoading, router, session]);

  useEffect(() => {
    if (!showDemoNotice) return;
    const timeout = window.setTimeout(() => setShowDemoNotice(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [showDemoNotice]);

  useEffect(() => {
    const root = accountingShellRef.current;
    if (!isDemo || !root) return;

    const makeFormsReadOnly = () => {
      root
        .querySelectorAll<HTMLElement>(
          '[data-demo-mutation-action], form button[type="submit"], form input[type="submit"]',
        )
        .forEach((action) => action.setAttribute('aria-disabled', 'true'));

      root.querySelectorAll('form input, form select, form textarea').forEach((control) => {
        if (control instanceof HTMLInputElement) {
          if (['button', 'submit', 'reset', 'hidden'].includes(control.type)) return;
          if (['checkbox', 'file', 'radio'].includes(control.type)) {
            control.disabled = true;
            control.setAttribute('aria-disabled', 'true');
          } else {
            control.readOnly = true;
            control.setAttribute('aria-readonly', 'true');
          }
        } else if (control instanceof HTMLSelectElement) {
          control.disabled = true;
          control.setAttribute('aria-disabled', 'true');
        } else if (control instanceof HTMLTextAreaElement) {
          control.readOnly = true;
          control.setAttribute('aria-readonly', 'true');
        }
      });
    };

    makeFormsReadOnly();
    const observer = new MutationObserver(makeFormsReadOnly);
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [isDemo]);

  function showRestrictedActionNotice() {
    setShowDemoNotice(true);
  }

  function blockDemoAction(event: MouseEvent<HTMLDivElement>) {
    if (!isDemo) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const action = target.closest(
      '[data-demo-mutation-action], form button[type="submit"], form input[type="submit"]',
    );
    if (!action) return;

    event.preventDefault();
    event.stopPropagation();
    showRestrictedActionNotice();
  }

  function blockDemoFormSubmit(event: FormEvent<HTMLDivElement>) {
    if (!isDemo) return;
    if (!(event.target instanceof HTMLFormElement)) return;

    event.preventDefault();
    event.stopPropagation();
    showRestrictedActionNotice();
  }

  function blockDemoRouteChange(event: ChangeEvent<HTMLDivElement>) {
    if (!isDemo) return;

    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (!target.selectedOptions[0]?.hasAttribute('data-demo-mutation-action')) return;

    event.preventDefault();
    event.stopPropagation();
    showRestrictedActionNotice();
  }

  async function exitDemoMode() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(`Unable to exit Demo Mode: ${error.message}`);
      return;
    }
    router.replace('/login');
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p role="status" className="text-sm text-slate-600">
          Checking your accounting access...
        </p>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Sign-in check failed</h1>
          <p role="alert" className="mt-2 text-sm text-red-800">{authError}</p>
          <button
            type="button"
            onClick={() => router.replace('/login')}
            className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Go to sign in
          </button>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p role="status" className="text-sm text-slate-600">Redirecting to sign in...</p>
      </main>
    );
  }

  if (!isDemo && !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-lg rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Accounting access not enabled</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This account is not authorized to open the accounting workspace.
          </p>
          <button
            type="button"
            onClick={() => void exitDemoMode()}
            className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Sign in with another account
          </button>
        </section>
      </main>
    );
  }

  return (
    <div
      ref={accountingShellRef}
      className="min-h-screen bg-slate-50"
      data-demo-mode={isDemo ? 'true' : undefined}
      onClickCapture={blockDemoAction}
      onChangeCapture={blockDemoRouteChange}
      onSubmitCapture={blockDemoFormSubmit}
    >
      <AccountingSidebar />
      <div className="min-h-screen min-w-0 lg:ml-64">
        {isDemo && (
          <div
            role="status"
            className="flex flex-col gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
          >
            <p className="font-medium">
              🔍 You are viewing in Demo Mode (Read-Only)
            </p>
            <button
              type="button"
              onClick={() => void exitDemoMode()}
              className="self-start font-semibold underline underline-offset-2 hover:text-amber-700 sm:self-auto"
            >
              Exit demo and sign in
            </button>
          </div>
        )}
        {children}
      </div>
      {isDemo && showDemoNotice && (
        <div
          role="alert"
          className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          Demo Mode: You can view all reports and data, but making changes is disabled.
        </div>
      )}
    </div>
  );
}
