import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function getMobileUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}