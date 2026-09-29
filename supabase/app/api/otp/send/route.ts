```ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, purpose } = await req.json();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const admin = supabaseAdmin();
  await admin.from('otps').insert({ email, code, purpose, expires_at });

  await resend.emails.send({
    from: 'PastQ <noreply@yourdomain.com>',
    to: email,
    subject: 'Your verification code',
    html: `<h2>${code}</h2><p>Valid for 10 minutes.</p>`
  });

  return NextResponse.json({ ok: true });
}
```