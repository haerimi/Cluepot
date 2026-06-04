import axios from 'axios';
import { supabase } from './supabase';

// .env 파일에 아래 값 필요
// EXPO_PUBLIC_API_URL=http://localhost:3000

export const api = axios.create({
  baseURL: `${process.env.EXPO_PUBLIC_API_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 모든 요청에 Supabase 세션 토큰 자동 첨부
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
