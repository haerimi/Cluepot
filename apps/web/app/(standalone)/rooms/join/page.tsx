"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { createClient } from "@/util/supabase/client";
import { validateRoom } from "@/app/actions/rooms";
import { joinRoom } from "@/app/actions/participant"


export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
    });
  }, [router]);

  const normalizedCode = code.trim().toUpperCase();
  const isValid = normalizedCode.length >= 4;

  async function handleJoin() {
    if (!isValid) return;
    setError(null);
    setIsJoining(true);
    const validate = await validateRoom(normalizedCode)
    
    if (!validate.valid) {
      setError(validate.reason ?? "유효하지 않은 코드예요.");
      setIsJoining(false);
      return;
    }

    await joinRoom(normalizedCode)
    router.push(`/rooms/${normalizedCode}`);
  }

  return (
    <div className="min-h-dvh bg-canvas flex flex-col lg:justify-center lg:items-center">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 pt-safe pt-4 pb-3 w-full max-w-[480px] lg:px-0 lg:mb-4">
        <Link href="/" className="text-[20px] font-black text-ink tracking-tight">
          Clue<span className="text-accent">Pot</span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-[480px] px-5 pt-10 pb-8 flex flex-col lg:flex-none lg:bg-white lg:rounded-3xl lg:border lg:border-hairline lg:shadow-[0_12px_40px_rgba(26,32,51,0.04)] lg:p-10">
        {/* Headline */}
        <div className="mb-8">
          <h1 className="text-[26px] font-black text-ink leading-tight tracking-[-0.8px] mb-2">
            모임에 참가하기
          </h1>
          <p className="text-[14px] text-ink-subtle">
            호스트에게 받은 모임 코드를 입력해주세요
          </p>
        </div>

        {/* Code input card — 💡 데스크톱에서는 부모가 이미 카드가 되므로 내부 테두리와 패딩을 조절합니다 */}
        <div className="bg-white rounded-2xl border border-hairline shadow-[0_4px_12px_rgba(26,32,51,0.04)] p-6 mb-4 lg:border-none lg:shadow-none lg:p-0">
          <label
            htmlFor="room-code"
            className="block text-[11px] font-bold text-ink-subtle tracking-[1.5px] uppercase mb-3"
          >
            모임 코드
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              id="room-code"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="예: ABC123"
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className={[
                "w-full h-14 px-4 rounded-xl border text-[22px] font-black tracking-[4px] text-center",
                "placeholder:text-hairline-strong placeholder:text-[16px] placeholder:tracking-normal placeholder:font-medium",
                "outline-none transition-all duration-150",
                "focus:ring-2 focus:ring-[#7298C7] focus:ring-offset-0",
                error
                  ? "border-error bg-error-bg text-error"
                  : "border-hairline bg-canvas text-ink focus:border-accent focus:bg-white",
              ].join(" ")}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 mt-3">
              <span className="text-error text-[14px] flex-shrink-0">⚠️</span>
              <p className="text-[13px] text-error leading-snug">{error}</p>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="flex items-center gap-2 px-1 mb-8">
          <span className="text-[13px]">💡</span>
          <p className="text-[12px] text-ink-subtle">
            코드는 대소문자 구분 없이 입력할 수 있어요
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto lg:mt-0 flex flex-col gap-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!isValid}
            loading={isJoining}
            onClick={handleJoin}
          >
            {isJoining ? "입장하는 중…" : "모임 입장하기"}
          </Button>
          <div className="text-center">
            <span className="text-[13px] text-ink-subtle">모임이 없나요? </span>
            <Link
              href="/rooms/create"
              className="text-[13px] font-semibold text-accent underline-offset-2 hover:underline"
            >
              새로 만들기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
