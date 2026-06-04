import { createClient } from '@supabase/supabase-js';

// .env 파일에 아래 두 값 필요
// EXPO_PUBLIC_SUPABASE_URL=...
// EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
