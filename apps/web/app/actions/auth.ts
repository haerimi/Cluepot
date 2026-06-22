"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/util/supabase/server";
import { prisma } from "@/lib/prisma";

export interface AuthState {
  error: string | null;
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const cookieStore = await cookies();
  const rememberMe = formData.get("rememberMe") === "on";
  const supabase = createClient(cookieStore, rememberMe);

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않아요." };
  }

  redirect("/calendar");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") ?? "").toString().trim();
  const password = (formData.get("password") ?? "").toString();
  const nickname = (formData.get("nickname") ?? "").toString().trim();

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

  if (!data.user) return { error: "확인 메일을 확인해주세요." };

  try {
    await prisma.user.upsert({
      // upsert로 재시도에도 안전하게
      where: { id: data.user.id },
      update: {},
      create: { id: data.user.id, email, nickname },
    });
  } catch {
    // Supabase 계정은 이미 생겼으니 로그인으로 안내
    return {
      error: "계정 정보 저장에 실패했어요. 잠시 후 로그인을 시도해주세요.",
    };
  }
  redirect("/");
}

export async function logout(): Promise<never> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect("/login");
}

export async function profileLogin() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { nickname: true, profileImage: true },
  });

  const nickname = dbUser?.nickname ?? (user.user_metadata?.nickname as string | undefined) ?? "";
  const email = user.email ?? "";
  const initial = (nickname[0] ?? email[0] ?? "?").toUpperCase();
  const joinedAt = new Date(user.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return { id: user.id, initial, joinedAt, nickname, email, profileImage: dbUser?.profileImage ?? null }
}

export async function updateUserInfo(nickname: string, imageUrl: string | null) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      nickname,
      ...(imageUrl !== null && { profileImage: imageUrl }),
    },
  });
  revalidatePath("/", "layout");
}