```ts
import { supabaseServer } from './supabase-server';

export async function getCurrentUser() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return profile;
}

export async function requireRole(allowed: string[]) {
  const profile = await getCurrentUser();
  if (!profile) return { error: 'unauthenticated', status: 401 } as const;
  if (!allowed.includes(profile.role))
    return { error: 'Access Denied', status: 403 } as const;
  return { profile } as const;
}
```