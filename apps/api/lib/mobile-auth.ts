import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function getMobileUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return null;

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase 환경변수가 설정되지 않았습니다.");

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}