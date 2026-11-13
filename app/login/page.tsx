'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const demoEmail =
  process.env.NEXT_PUBLIC_DEMO_EMAIL ?? 'demo@shreeshyams.in';

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (!isActive) return;
      if (error) {
        setErrorMessage(`Unable to check your session: ${error.message}`);
        return;
      }

      const user = data.session?.user;
      if (!user) return;

      const accessRole = user.app_metadata.accounting_role;
      if (accessRole === 'demo' || accessRole === 'admin') {
        router.replace('/admin/accounting');
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (isActive) {
        setErrorMessage(
          signOutError
            ? `This account does not have accounting access. Sign-out failed: ${signOutError.message}`
            : 'This account does not have accounting access.',
        );
      }
    }).catch((error: unknown) => {
      if (isActive) {
        setErrorMessage(
          error instanceof Error
            ? `Unable to check your session: ${error.message}`
            : 'Unable to check your session.',
        );
      }
    });

    return () => {
      isActive = false;
    };
  }, [router, supabase]);

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.user?.app_metadata.accounting_role !== 'admin') {
        const { error: signOutError } = await supabase.auth.signOut();
        setErrorMessage(
          signOutError
            ? `This account does not have accounting access. Sign-out failed: ${signOutError.message}`
            : 'This account does not have accounting access.',
        );
        return;
      }

      router.replace('/admin/accounting');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoLogin() {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
      if (!demoPassword) {
        setErrorMessage(
          'Demo Login is not configured. Set NEXT_PUBLIC_DEMO_PASSWORD and rebuild the app.',
        );
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        setErrorMessage(`Unable to start Demo Mode: ${error.message}`);
        return;
      }

      if (data.user?.app_metadata.accounting_role !== 'demo') {
        const { error: signOutError } = await supabase.auth.signOut();
        setErrorMessage(
          signOutError
            ? `The configured account is not marked as a read-only demo user. Sign-out failed: ${signOutError.message}`
            : 'The configured account is not marked as a read-only demo user.',
        );
        return;
      }

      router.replace('/admin/accounting');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start Demo Mode. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Shree Shyam Accounting
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          Sign in to your workspace
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Use your staff account, or explore reports in read-only Demo Mode.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handlePasswordLogin}>
          <div>
            <label
              htmlFor="login-email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label
              htmlFor="login-password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {errorMessage && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          OR
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => void handleDemoLogin()}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:border-blue-300 hover:bg-blue-100 disabled:cursor-wait disabled:opacity-60"
        >
          <span aria-hidden="true">🔍</span>
          {isSubmitting ? 'Starting demo...' : 'Try Demo — Read-Only'}
        </button>
        <p className="mt-3 text-center text-xs leading-5 text-slate-500">
          Demo sessions can view accounting records but cannot make changes.
        </p>
      </section>
    </main>
  );
}
