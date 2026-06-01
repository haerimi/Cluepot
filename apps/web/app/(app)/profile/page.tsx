import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/util/supabase/server";
import { logout } from "@/app/actions/auth";

/**
 * Profile — protected page (requires auth via middleware).
 *
 * Reads the current user from the server so data is always fresh.
 * Stub: edit-in-place nickname / avatar upload wires up in a later sprint.
 */
export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const nickname =
    (user.user_metadata?.nickname as string | undefined) ?? "";
  const email = user.email ?? "";
  const initial = (nickname[0] ?? email[0] ?? "?").toUpperCase();
  const joinedAt = new Date(user.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-10">

      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-px bg-hairline-strong" />
          <span className="text-[10px] font-bold text-ink-subtle tracking-[3px] uppercase">
            프로필
          </span>
        </div>
        <h1 className="text-[32px] lg:text-[40px] font-black text-ink leading-tight tracking-[-1.5px]">
          내 계정
        </h1>
      </div>

      {/* Profile card */}
      <div className="max-w-[480px] bg-white rounded-2xl border border-hairline shadow-[0_2px_8px_rgba(26,32,51,0.06)] overflow-hidden">

        {/* Avatar band */}
        <div className="bg-ink px-8 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shrink-0">
            <span className="text-[24px] font-black text-white leading-none">
              {initial}
            </span>
          </div>
          <div>
            {nickname && (
              <p className="text-[18px] font-bold text-white leading-tight">
                {nickname}
              </p>
            )}
            <p className="text-[13px] text-ink-subtle">{email}</p>
          </div>
        </div>

        {/* Detail rows */}
        <div className="divide-y divide-[#F0EDE7]">
          <Row label="이메일" value={email} />
          {nickname && <Row label="닉네임" value={nickname} />}
          <Row label="가입일" value={joinedAt} />
        </div>

        {/* Actions */}
        <div className="px-6 py-5 bg-surface border-t border-hairline">
          <form action={logout}>
            <button
              type="submit"
              className="h-10 px-5 text-[13px] font-medium text-error border border-error-border rounded-full bg-white hover:bg-error-bg transition-colors cursor-pointer"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between px-6 py-4 gap-4">
      <span className="text-[11px] font-semibold text-ink-subtle uppercase tracking-wider shrink-0">
        {label}
      </span>
      <span className="text-[14px] text-ink text-right truncate">
        {value}
      </span>
    </div>
  );
}
