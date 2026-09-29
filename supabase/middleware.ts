```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PUBLIC = ['/login', '/register', '/forgot-password', '/reset-password', '/verify'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => req.cookies.get(n)?.value,
        set: (n, v, o) => res.cookies.set({ name: n, value: v, ...o }),
        remove: (n, o) => res.cookies.set({ name: n, value: '', ...o }),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = req.nextUrl;

  // Unauthenticated → login
  if (!user && !PUBLIC.some(p => pathname.startsWith(p))) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated: enforce role-based access on /dashboard/*
  if (user && pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    if (pathname.startsWith('/dashboard/student') && role !== 'student')
      return NextResponse.redirect(new URL('/403', req.url));
    if (pathname.startsWith('/dashboard/lecturer') && role !== 'lecturer')
      return NextResponse.redirect(new URL('/403', req.url));
    if (pathname.startsWith('/dashboard/admin') && role !== 'admin')
      return NextResponse.redirect(new URL('/403', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|pdf)$).*)'],
};
```