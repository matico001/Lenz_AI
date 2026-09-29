import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';

export default async function AdminDash() {
  const profile = await getCurrentUser();
  if (!profile) redirect('/login');
  if (profile.role !== 'admin') redirect('/403');

  const supabase = await supabaseServer();
  const { data: users } = await supabase.from('profiles').select('*')
    .order('created_at', { ascending: false });
  const { data: questions } = await supabase.from('past_questions').select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Admin Panel</h1>

        <section>
          <h2 className="text-lg font-semibold mb-3">Registered Users ({users?.length || 0})</h2>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="p-3">Photo</th><th className="p-3">Name</th>
                  <th className="p-3">Email</th><th className="p-3">Role</th>
                  <th className="p-3">Dept</th><th className="p-3">Level</th>
                  <th className="p-3">Courses</th><th className="p-3">Registered</th>
                </tr>
              </thead>
              <tbody>
                {users?.map(u => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3">
                      {u.photo_url
                        ? <img src={u.photo_url} className="w-10 h-10 rounded-full object-cover" />
                        : '—'}
                    </td>
                    <td className="p-3">{u.full_name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3"><span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs">{u.role}</span></td>
                    <td className="p-3">{u.department}</td>
                    <td className="p-3">{u.level || '—'}</td>
                    <td className="p-3">{(u.courses || []).join(', ') || '—'}</td>
                    <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Passwords are hashed by Supabase Auth and cannot be displayed. Admins can trigger resets
            via the Supabase dashboard or by extending this page with a "send reset" button.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">All Past Questions ({questions?.length || 0})</h2>
          <ul className="bg-white rounded-2xl shadow-sm divide-y">
            {questions?.map(q => (
              <li key={q.id} className="p-4 text-sm flex justify-between">
                <span><b>{q.course_code}</b> — {q.title}</span>
                <span className="text-gray-500">{q.department} • {q.level} • {q.year}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}