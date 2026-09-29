'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Spinner from '@/components/Spinner';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = supabaseBrowser();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <main className="min-h-screen w-full px-4 py-6 sm:flex sm:items-center sm:justify-center sm:bg-gray-100">
      <form onSubmit={submit}
        className="w-full sm:max-w-md bg-white sm:rounded-2xl sm:shadow-lg p-5 sm:p-8 space-y-4
                   min-h-screen sm:min-h-0 flex flex-col justify-center">
        <h1 className="text-2xl font-bold text-center">Forgot password</h1>
        {sent ? (
          <p className="text-green-700 bg-green-50 p-3 rounded-lg text-sm text-center">
            If that email exists, a reset link has been sent.
          </p>
        ) : (
          <>
            <p className="text-gray-500 text-sm text-center">
              Enter your email — we'll send a secure reset link.
            </p>
            <input required type="email" placeholder="Email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
            <button disabled={loading}
              className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60 flex items-center justify-center">
              {loading ? <Spinner label="Sending…" /> : 'Send reset link'}
            </button>
          </>
        )}
        <a href="/login" className="text-center text-sm text-indigo-600">Back to login</a>
      </form>
    </main>
  );
}