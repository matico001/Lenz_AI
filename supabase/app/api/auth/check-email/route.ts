```ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  const { email } = await req.json();
  const admin = supabaseAdmin();
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  return NextResponse.json({ exists: !!data });
}
```