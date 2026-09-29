'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/Spinner';

export default function UploadForm({ department }: { department: string }) {
  const router = useRouter();
  const [f, setF] = useState({
    title: '', department, level: '', course_code: '', year: new Date().getFullYear().toString(),
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMsg('Please choose a PDF.');
    setLoading(true); setMsg('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('meta', JSON.stringify({ ...f, year: parseInt(f.year) }));
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return setMsg(d.error);
    setMsg('Uploaded successfully!');
    router.refresh();
  }

  const input = "w-full rounded-lg border border-gray-300 px-4 py-3 text-base outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200";

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h2 className="text-lg font-semibold">Upload Past Question</h2>
      {msg && <p className="text-sm text-emerald-700 bg-emerald-50 p-2 rounded">{msg}</p>}
      <input required placeholder="Title" value={f.title}
        onChange={e => setF({ ...f, title: e.target.value })} className={input} />
      <input required placeholder="Department" value={f.department}
        onChange={e => setF({ ...f, department: e.target.value })} className={input} />
      <input required placeholder="Level (e.g. 300)" value={f.level}
        onChange={e => setF({ ...f, level: e.target.value })} className={input} />
      <input required placeholder="Course code (e.g. CSC301)" value={f.course_code}
        onChange={e => setF({ ...f, course_code: e.target.value })} className={input} />
      <input required type="number" placeholder="Year" value={f.year}
        onChange={e => setF({ ...f, year: e.target.value })} className={input} />
      <input required type="file" accept="application/pdf"
        onChange={e => setFile(e.target.files?.[0] || null)} className={input} />
      <button disabled={loading}
        className="w-full py-3 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-60 flex items-center justify-center">
        {loading ? <Spinner label="Uploading…" /> : 'Upload'}
      </button>
    </form>
  );
}