"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";

export interface AuthState {
  error: string | null;
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않아요." };
  }

  redirect("/room/create");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const nickname = ((formData.get("nickname") as string) ?? "").trim();

  if (!email || !password || !nickname) {
    return { error: "모든 항목을 입력해주세요." };
  }

  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 해요." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "이미 사용 중인 이메일이에요." };
    }
    return { error: "계정을 만들 수 없어요. 다시 시도해주세요." };
  }

  // Supabase user ID를 그대로 Prisma users 테이블에 동기화
  await prisma.user.create({
    data: {
      id: data.user!.id,   // Supabase UUID를 PK로 사용
      email,
      nickname,
    },
  });

  redirect("/");
}

export async function logout(): Promise<never> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/login");
}
