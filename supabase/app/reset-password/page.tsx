'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Reset() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setMsg(error.message);
    setMsg('Password updated. Redirecting…');
    setTimeout(() => router.push('/login'), 1200);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">Set new password</h1>
        {msg && <p className="text-sm text-indigo-700 bg-indigo-50 p-2 rounded">{msg}</p>}
        <input required type="password" minLength={8} placeholder="New password"
          value={pw} onChange={e => setPw(e.target.value)}
          className="w-full rounded-lg border px-4 py-3 outline-none focus:border-indigo-500" />
        <button className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold">Update</button>
      </form>
    </main>
  );
}