import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase-server';

export default async function StudentDash() {
  const profile = await getCurrentUser();
  if (!profile) redirect('/login');
  if (profile.role !== 'student') redirect('/403');

  const supabase = await supabaseServer();
  const { data: questions } = await supabase
    .from('past_questions')
    .select('*')
    .eq('department', profile.department)
    .eq('level', profile.level)
    .order('year', { ascending: false });

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-3">
        {profile.photo_url && (
          <img src={profile.photo_url} alt="me"
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500" />
        )}
        <div>
          <h1 className="font-bold">{profile.full_name}</h1>
          <p className="text-xs text-gray-500">
            {profile.department} • Level {profile.level}
          </p>
        </div>
      </header>

      <section className="p-4 max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold mb-3">Your Past Questions</h2>
        {!questions?.length && (
          <p className="text-gray-500 text-sm">No past questions for your department/level yet.</p>
        )}
        <ul className="space-y-3">
          {questions?.map(q => (
            <li key={q.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="font-semibold">{q.course_code} — {q.title}</h3>
                  <p className="text-xs text-gray-500">
                    {q.department} • {q.level} • {q.year}
                  </p>
                </div>
                <a href={`/api/download?id=${q.id}`}
                  className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium">
                  Download
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}