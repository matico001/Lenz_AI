```ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const {
    email, password, full_name, role,
    department, level, courses, photo_base64
  } = body;

  if (!['student', 'lecturer'].includes(role))
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  const admin = supabaseAdmin();

  // 1. Email exists?
  const { data: existing } = await admin
    .from('profiles').select('id').eq('email', email.toLowerCase()).maybeSingle();
  if (existing)
    return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 });

  // 2. Create auth user (email confirm disabled — we do OTP)
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: false,
  });
  if (createErr || !created.user)
    return NextResponse.json({ error: createErr?.message || 'Signup failed' }, { status: 400 });

  const userId = created.user.id;

  // 3. Upload photo
  let photo_url: string | null = null;
  if (photo_base64) {
    const base64 = photo_base64.split(',')[1];
    const buf = Buffer.from(base64, 'base64');
    const path = `${userId}/avatar.jpg`;
    const { error: upErr } = await admin.storage
      .from('photos')
      .upload(path, buf, { contentType: 'image/jpeg', upsert: true });
    if (!upErr) {
      const { data: pub } = admin.storage.from('photos').getPublicUrl(path);
      photo_url = pub.publicUrl;
    }
  }

  // 4. Insert profile
  await admin.from('profiles').insert({
    id: userId,
    full_name, email: email.toLowerCase(), role,
    department, level: role === 'student' ? level : null,
    courses: courses || [],
    photo_url,
    email_verified: false,
  });

  // 5. Send verification link (Supabase magic link works as email verification)
  const { data: linkData } = await admin.auth.admin.generateLink({
    type: 'magiclink', email,
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/verify` }
  });

  await resend.emails.send({
    from: 'PastQ <noreply@yourdomain.com>',
    to: email,
    subject: 'Verify your PastQ account',
    html: `<p>Hi ${full_name}, click to verify:</p>
           <a href="${linkData?.properties?.action_link}">Verify Email</a>
           <p>Link expires in 60 minutes.</p>`
  });

  return NextResponse.json({ ok: true });
}
```