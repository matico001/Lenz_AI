```ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const { email, code, purpose } = await req.json();
  const admin = supabaseAdmin();

  const { data } = await admin
    .from('otps')
    .select('*')
    .eq('email', email).eq('code', code).eq('purpose', purpose)
    .eq('used', false).gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (!data) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });

  await admin.from('otps').update({ used: true }).eq('id', data.id);

  if (purpose === 'verify') {
    await admin.from('profiles').update({ email_verified: true }).eq('email', email);
  }

  return NextResponse.json({ ok: true });
}
```